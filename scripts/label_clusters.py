#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "numpy",
# ]
# ///
"""
LLM-labeling for the clusters produced by embed.py.

Two phases:

    1. dump  — walk every archived run for a dataset and emit, per cluster
               (flat clusters + each EVoC layer), all member titles plus up to
               N sampled abstracts. Written to
               scripts/outputs/<dataset>/cluster_dump.json for a human/LLM to read.

    2. apply — read scripts/outputs/<dataset>/cluster_labels_authored.json
               (a flat map of "<model>/<projector>/<unit>/<cluster_id>" -> {label, description})
               and distribute it into each archive as cluster_labels.json (flat)
               and cluster_layer_labels.json (per EVoC layer), then regenerate the TS bundle.

The unit key is "<model_slug>/<projector>/<unit>/<cluster_id>" where <unit> is
"flat" (from clusters.json) or "layerN" (from cluster_layers.json[N]).

Usage:
    uv run scripts/label_clusters.py --dataset posters --dump
    # ... author scripts/outputs/posters/cluster_labels_authored.json ...
    uv run scripts/label_clusters.py --dataset posters --apply
"""

import argparse
import importlib.util
import json
from collections import defaultdict
from pathlib import Path

# Reuse the dataset config + TS writer from embed.py (its only top-level dep is numpy).
_spec = importlib.util.spec_from_file_location("embed", str(Path(__file__).with_name("embed.py")))
embed = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(embed)

DATASETS = embed.DATASETS
OUTPUTS_DIR = embed.OUTPUTS_DIR
N_SAMPLE_ABSTRACTS = 10

DUMP_NAME = "cluster_dump.jsonl"           # titles only — small, pageable (primary authoring view)
ABSTRACTS_NAME = "cluster_abstracts.jsonl"  # sampled abstracts per cluster — for targeted lookup
AUTHORED_NAME = "cluster_labels_authored.json"


def evenly_spaced(seq, k):
    """Up to k items from seq, evenly spaced (deterministic, order-preserving)."""
    if len(seq) <= k:
        return list(seq)
    return [seq[round(j * (len(seq) - 1) / (k - 1))] for j in range(k)]


def iter_units(proj_dir: Path):
    """Yield (unit_name, labels) for a projection dir: 'flat' then 'layer0', 'layer1', ..."""
    cf = proj_dir / "clusters.json"
    if cf.exists():
        yield "flat", json.loads(cf.read_text())
    lf = proj_dir / "cluster_layers.json"
    if lf.exists():
        for i, layer in enumerate(json.loads(lf.read_text())):
            yield f"layer{i}", layer


def flat_matches_layer(proj_dir: Path):
    """For EVoC runs the flat clustering equals the coarsest layer. Return that
    layer index (so flat labels can be reused from it), else None."""
    cf, lf = proj_dir / "clusters.json", proj_dir / "cluster_layers.json"
    if not (cf.exists() and lf.exists()):
        return None
    flat = json.loads(cf.read_text())
    layers = json.loads(lf.read_text())
    for i, layer in enumerate(layers):
        if layer == flat:
            return i
    return None


def cmd_dump(ds):
    text = {p["id"]: p for p in ds.load_items()}  # id -> {title, abstract, ...}
    ds_dir = OUTPUTS_DIR / ds.name
    units = []
    for proj_dir in sorted(p for p in ds_dir.glob("*/*") if p.is_dir()):
        model, projector = proj_dir.parent.name, proj_dir.name
        ids = json.loads((proj_dir / "ids.json").read_text())
        dup_flat_layer = flat_matches_layer(proj_dir)  # skip flat if it duplicates a layer
        for uname, labels in iter_units(proj_dir):
            if uname == "flat" and dup_flat_layer is not None:
                continue
            groups = defaultdict(list)
            for idx, lab in enumerate(labels):
                if lab != -1:
                    groups[lab].append(idx)
            for cid, idxs in sorted(groups.items()):
                key = f"{model}/{projector}/{uname}/{cid}"
                sample = evenly_spaced(idxs, N_SAMPLE_ABSTRACTS)
                units.append({
                    "titles": {
                        "key": key,
                        "model": model,
                        "projector": projector,
                        "unit": uname,
                        "cluster": cid,
                        "size": len(idxs),
                        "titles": [text[ids[i]].get("title", "") for i in idxs],
                    },
                    "abstracts": {
                        "key": key,
                        "abstracts": [
                            {"title": text[ids[i]].get("title", ""),
                             "abstract": text[ids[i]].get("abstract", "")}
                            for i in sample
                        ],
                    },
                })
    dump = ds_dir / DUMP_NAME
    absf = ds_dir / ABSTRACTS_NAME
    with open(dump, "w") as f:
        for u in units:
            f.write(json.dumps(u["titles"]) + "\n")
    with open(absf, "w") as f:
        for u in units:
            f.write(json.dumps(u["abstracts"]) + "\n")
    n_titles = sum(len(u["titles"]["titles"]) for u in units)
    print(f"Wrote {dump}  —  {len(units)} clusters (titles only, 1 per line, {n_titles} titles)")
    print(f"Wrote {absf}  —  sampled abstracts per cluster (grep by key for lookup)")
    print(f"Author labels into: {ds_dir / AUTHORED_NAME}")


def cmd_apply(ds):
    ds_dir = OUTPUTS_DIR / ds.name
    authored_path = ds_dir / AUTHORED_NAME
    if not authored_path.exists():
        raise FileNotFoundError(f"Missing {authored_path} — author it first (see --dump).")
    authored = json.loads(authored_path.read_text())

    written = 0
    for proj_dir in sorted(p for p in ds_dir.glob("*/*") if p.is_dir()):
        model, projector = proj_dir.parent.name, proj_dir.name
        prefix = f"{model}/{projector}/"

        # EVoC layers → cluster_layer_labels.json (list aligned with cluster_layers[N])
        layer_maps = []
        lf = proj_dir / "cluster_layers.json"
        if lf.exists():
            for i, layer in enumerate(json.loads(lf.read_text())):
                m = {}
                for cid in sorted(set(layer) - {-1}):
                    k = f"{prefix}layer{i}/{cid}"
                    if k in authored:
                        m[str(cid)] = authored[k]
                layer_maps.append(m)
            if any(layer_maps):
                (proj_dir / "cluster_layer_labels.json").write_text(json.dumps(layer_maps))
                written += sum(len(m) for m in layer_maps)

        # Flat clusters → cluster_labels.json. Prefer authored flat keys; otherwise
        # reuse the coarsest layer (flat == that layer for every EVoC run).
        cf = proj_dir / "clusters.json"
        if cf.exists():
            flat = json.loads(cf.read_text())
            flat_map = {}
            for cid in sorted(set(flat) - {-1}):
                k = f"{prefix}flat/{cid}"
                if k in authored:
                    flat_map[str(cid)] = authored[k]
            if not flat_map:
                dup = flat_matches_layer(proj_dir)
                if dup is not None and dup < len(layer_maps):
                    flat_map = layer_maps[dup]
            if flat_map:
                (proj_dir / "cluster_labels.json").write_text(json.dumps(flat_map))
                written += len(flat_map)

    print(f"Applied {written} labels across archives. Regenerating TS...")
    items_by_id = {p["id"]: p for p in ds.load_items()}
    embed.write_ts_projections(ds, items_by_id)
    print("Done!")


def main():
    parser = argparse.ArgumentParser(description="LLM-label embed.py clusters")
    parser.add_argument("--dataset", required=True, choices=DATASETS.keys())
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--dump", action="store_true", help="Emit per-cluster text for labeling")
    g.add_argument("--apply", action="store_true", help="Inject authored labels + regenerate TS")
    args = parser.parse_args()

    ds = DATASETS[args.dataset]
    if args.dump:
        cmd_dump(ds)
    else:
        cmd_apply(ds)


if __name__ == "__main__":
    main()

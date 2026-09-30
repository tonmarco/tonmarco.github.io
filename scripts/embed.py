#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "sentence-transformers",
#     "transformers",
#     "adapters",
#     "torch",
#     "numpy",
#     "hdbscan",
#     "umap-learn",
#     "evoc",
#     "matplotlib",
#     "einops",
# ]
# ///
"""
Compute embeddings for poster or talk abstracts and write them to TypeScript files.

One pipeline, two datasets (see DATASETS below):
    posters  ← poster.json            → poster_projections.ts
    talks    ← parallel-sessions.json  → talk_projections.ts

Each run is archived under scripts/outputs/<dataset>/<model-slug>/<projector>/ so
previous results are never overwritten. ALL archived projections for a dataset are
bundled into its TS output so the frontend can switch between them.

Usage:
    uv run scripts/embed.py --dataset posters                                 # specter2 + umap
    uv run scripts/embed.py --dataset talks --projector evoc                  # specter2 + evoc
    uv run scripts/embed.py --dataset posters --reproject specter2 --projector evoc
    uv run scripts/embed.py --dataset talks --list

Outputs (per run):
    scripts/outputs/<dataset>/<model>/<projector>/embeddings.npy      (raw vectors, archived)
    scripts/outputs/<dataset>/<model>/<projector>/projections_2d.npy
    scripts/outputs/<dataset>/<model>/<projector>/ids.json
    scripts/outputs/<dataset>/<model>/<projector>/clusters.json
    scripts/outputs/<dataset>/<model>/<projector>/cluster_layers.json  (evoc only)
    scripts/outputs/<dataset>/<model>/<projector>/metadata.json
    src/lib/data/full-program/<dataset>_projections.ts                 (all projections bundled)
"""

import argparse
import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import numpy as np

OUTPUTS_DIR = Path("scripts/outputs")
PRECISION = 6
BATCH_SIZE = 16


# ── Datasets ─────────────────────────────────────────────────────────

def strip_session_suffix(title: str) -> str:
    return re.sub(r"\s*\([^)]+\)\s*$", "", title)


@dataclass(frozen=True)
class Dataset:
    name: str                              # "posters" | "talks"
    data_json: str                         # source JSON produced by build_data.py
    ts_path: str                           # generated TS bundle
    container_key: str                     # session field holding the items
    id_key: str                            # item field holding the unique id
    theme_fn: Callable[[dict, dict], str]  # (session, item) -> theme label
    ts_var: str                            # exported const name in the TS file
    emit_interface: bool                   # posters define the shared TS interfaces

    def load_items(self) -> list[dict]:
        """Read the generated JSON (sessions → items) into a flat list."""
        with open(self.data_json, "r", encoding="utf-8") as f:
            sessions = json.load(f)
        items = []
        for session in sessions:
            for it in session.get(self.container_key, []):
                items.append(
                    {
                        "id": it[self.id_key],
                        "title": it.get("title", ""),
                        "abstract": it.get("abstract", ""),
                        "theme": self.theme_fn(session, it),
                    }
                )
        return items


DATASETS = {
    "posters": Dataset(
        name="posters",
        data_json="src/lib/data/full-program/poster.json",
        ts_path="src/lib/data/full-program/poster_projections.ts",
        container_key="posters",
        id_key="id",
        theme_fn=lambda session, it: it.get("theme", ""),
        ts_var="projections",
        emit_interface=True,
    ),
    "talks": Dataset(
        name="talks",
        data_json="src/lib/data/full-program/parallel-sessions.json",
        ts_path="src/lib/data/full-program/talk_projections.ts",
        container_key="papers",
        id_key="submission",
        theme_fn=lambda session, it: strip_session_suffix(session.get("title", "")),
        ts_var="talkProjections",
        emit_interface=False,
    ),
}


def slug_for(model_name: str) -> str:
    return model_name.split("/")[-1]


# ── Embedders ────────────────────────────────────────────────────────

def embed_specter2(items, model_name: str):
    import torch
    from adapters import AutoAdapterModel
    from transformers import AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained("allenai/specter2_base")
    model = AutoAdapterModel.from_pretrained("allenai/specter2_base")
    model.load_adapter("allenai/specter2", source="hf", load_as="specter2", set_active=True)
    model.eval()

    text_batch = [
        p["title"] + tokenizer.sep_token + (p.get("abstract") or "")
        for p in items
    ]

    all_embeddings = []
    n_batches = (len(text_batch) - 1) // BATCH_SIZE + 1
    for i in range(0, len(text_batch), BATCH_SIZE):
        batch = text_batch[i : i + BATCH_SIZE]
        inputs = tokenizer(
            batch,
            padding=True,
            truncation=True,
            return_tensors="pt",
            return_token_type_ids=False,
            max_length=512,
        )
        with torch.no_grad():
            output = model(**inputs)
        embeddings = output.last_hidden_state[:, 0, :]
        all_embeddings.append(embeddings.cpu().numpy())
        print(f"  Batch {i // BATCH_SIZE + 1}/{n_batches}")

    return np.concatenate(all_embeddings, axis=0)


def embed_sentence_transformers(items, model_name: str):
    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(model_name, trust_remote_code=True, device="cpu")
    documents = [f"{p['title']}. {p['abstract']}" for p in items]

    # encode_document is Google embeddinggemma-specific; everything else uses encode
    if hasattr(model, "encode_document"):
        return model.encode_document(documents, show_progress_bar=True)
    return model.encode(documents, show_progress_bar=True)


def compute_embeddings(items, model_name: str):
    if "specter2" in model_name:
        return embed_specter2(items, model_name)
    else:
        return embed_sentence_transformers(items, model_name)


# ── Projectors ───────────────────────────────────────────────────────

def project_umap(embeddings):
    import umap

    print("Projecting with UMAP...")
    reducer = umap.UMAP(n_components=2, random_state=42, n_neighbors=15, min_dist=0.1)
    return reducer.fit_transform(embeddings)


def project_evoc(embeddings):
    from evoc.knn_graph import knn_graph
    from evoc.graph_construction import neighbor_graph_matrix
    from evoc.node_embedding import node_embedding

    print("Projecting with EVoC...")
    rng = np.random.RandomState(42)
    n_neighbors = min(10, embeddings.shape[0] - 1)
    nn_inds, nn_dists = knn_graph(embeddings, n_neighbors=n_neighbors, random_state=rng)
    graph = neighbor_graph_matrix(n_neighbors, nn_inds, nn_dists, True)
    return node_embedding(graph, n_components=2, n_epochs=200, random_state=rng)


PROJECTORS = {
    "umap": project_umap,
    "evoc": project_evoc,
}


def project(embeddings, projector: str):
    coords = PROJECTORS[projector](embeddings)
    mins = coords.min(axis=0)
    maxs = coords.max(axis=0)
    return (coords - mins) / (maxs - mins)


# ── Clustering ───────────────────────────────────────────────────────

def cluster_hdbscan(embeddings):
    """Run HDBSCAN clustering on the raw embeddings."""
    try:
        import hdbscan

        print("Running HDBSCAN clustering...")
        clusterer = hdbscan.HDBSCAN(min_cluster_size=5)
        labels = clusterer.fit_predict(embeddings)
        n_clusters = len(set(labels) - {-1})
        n_noise = int((labels == -1).sum())
        print(f"  {n_clusters} clusters, {n_noise} noise points")
        return labels.tolist()
    except Exception as e:
        print(f"  HDBSCAN clustering failed ({e}), skipping clusters")
        return None


def cluster_evoc(embeddings):
    """Run EVoC clustering — returns (labels, layers) where layers is a list of label arrays at different granularities."""
    try:
        import evoc

        print("Running EVoC clustering...")
        clusterer = evoc.EVoC()
        labels = clusterer.fit_predict(embeddings)
        n_clusters = len(set(labels) - {-1})
        n_noise = int((labels == -1).sum())
        print(f"  {n_clusters} clusters, {n_noise} noise points")

        layers = []
        if hasattr(clusterer, "cluster_layers_") and clusterer.cluster_layers_ is not None:
            for i, layer in enumerate(clusterer.cluster_layers_):
                layer_labels = layer.tolist() if hasattr(layer, "tolist") else list(layer)
                n_cl = len(set(layer_labels) - {-1})
                print(f"  Layer {i}: {n_cl} clusters")
                layers.append(layer_labels)

        if not layers:
            layers = [labels.tolist()]

        return labels.tolist(), layers
    except Exception as e:
        print(f"  EVoC clustering failed ({e}), skipping clusters")
        return None, None


def cluster(embeddings, projector: str):
    """Returns (labels, layers). layers is None for non-EVoC."""
    if projector == "evoc":
        return cluster_evoc(embeddings)
    labels = cluster_hdbscan(embeddings)
    return labels, None


# ── Archive helpers ──────────────────────────────────────────────────

def archive_dir(ds: Dataset, model_slug: str, projector: str) -> Path:
    return OUTPUTS_DIR / ds.name / model_slug / projector


def archive_run(ds: Dataset, model_slug: str, projector: str, items, embeddings, coords_2d, model_name: str, clusters=None, cluster_layers=None):
    out_dir = archive_dir(ds, model_slug, projector)
    out_dir.mkdir(parents=True, exist_ok=True)

    np.save(out_dir / "embeddings.npy", embeddings)
    np.save(out_dir / "projections_2d.npy", coords_2d)

    if clusters is not None:
        with open(out_dir / "clusters.json", "w") as f:
            json.dump(clusters, f)

    if cluster_layers is not None:
        with open(out_dir / "cluster_layers.json", "w") as f:
            json.dump(cluster_layers, f)

    ids = [p["id"] for p in items]
    with open(out_dir / "ids.json", "w") as f:
        json.dump(ids, f)

    meta = {
        "dataset": ds.name,
        "model": model_name,
        "model_slug": model_slug,
        "projector": projector,
        "dim": int(embeddings.shape[1]),
        "n_items": len(items),
        "has_clusters": clusters is not None,
        "n_cluster_layers": len(cluster_layers) if cluster_layers else 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    with open(out_dir / "metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"  Archived to {out_dir}/")


def load_archived_embeddings(ds: Dataset, model_slug: str):
    """Find embeddings.npy under any projector dir for this dataset+model."""
    parent = OUTPUTS_DIR / ds.name / model_slug
    for sibling in sorted(parent.iterdir()):
        npy = sibling / "embeddings.npy"
        ids_file = sibling / "ids.json"
        meta_file = sibling / "metadata.json"
        if npy.exists() and ids_file.exists() and meta_file.exists():
            embeddings = np.load(npy)
            with open(ids_file) as f:
                ids = json.load(f)
            with open(meta_file) as f:
                meta = json.load(f)
            return embeddings, ids, meta
    raise FileNotFoundError(f"No archived embeddings under {parent}/")


def collect_all_projections(ds: Dataset, items_by_id: dict):
    """Walk all archived runs for this dataset and return a list of
    (label, meta, ordered_items, coords_2d, clusters, cluster_layers)."""
    results = []
    ds_dir = OUTPUTS_DIR / ds.name
    if not ds_dir.exists():
        return results
    for model_dir in sorted(ds_dir.iterdir()):
        if not model_dir.is_dir():
            continue
        for proj_dir in sorted(model_dir.iterdir()):
            proj_file = proj_dir / "projections_2d.npy"
            ids_file = proj_dir / "ids.json"
            meta_file = proj_dir / "metadata.json"
            if not (proj_file.exists() and ids_file.exists() and meta_file.exists()):
                continue
            coords = np.load(proj_file)
            with open(ids_file) as f:
                ids = json.load(f)
            with open(meta_file) as f:
                meta = json.load(f)
            clusters_file = proj_dir / "clusters.json"
            clusters = None
            if clusters_file.exists():
                with open(clusters_file) as f:
                    clusters = json.load(f)
            layers_file = proj_dir / "cluster_layers.json"
            cluster_layers = None
            if layers_file.exists():
                with open(layers_file) as f:
                    cluster_layers = json.load(f)
            # LLM-generated labels (optional, produced by label_clusters.py)
            labels_file = proj_dir / "cluster_labels.json"
            cluster_labels = None
            if labels_file.exists():
                with open(labels_file) as f:
                    cluster_labels = json.load(f)
            layer_labels_file = proj_dir / "cluster_layer_labels.json"
            cluster_layer_labels = None
            if layer_labels_file.exists():
                with open(layer_labels_file) as f:
                    cluster_layer_labels = json.load(f)
            # Archived runs may predate withdrawals: keep only ids still present
            # in the current data JSON, keeping coords/clusters row-aligned.
            keep = [i for i, item_id in enumerate(ids) if item_id in items_by_id]
            if len(keep) < len(ids):
                dropped = [i for i in ids if i not in items_by_id]
                print(f"  {model_dir.name}/{proj_dir.name}: dropping {len(dropped)} withdrawn id(s): {dropped}")
                ids = [ids[i] for i in keep]
                coords = coords[keep]
                if clusters is not None:
                    clusters = [clusters[i] for i in keep]
                if cluster_layers is not None:
                    cluster_layers = [[layer[i] for i in keep] for layer in cluster_layers]
            ordered_items = [items_by_id[i] for i in ids]
            label = f"{meta.get('model_slug', model_dir.name)} / {proj_dir.name}"
            results.append((label, meta, ordered_items, coords, clusters, cluster_layers, cluster_labels, cluster_layer_labels))
    return results


# ── TS writer ────────────────────────────────────────────────────────

def write_ts_projections(ds: Dataset, items_by_id: dict):
    """Write ALL archived projections for this dataset into a single TS file."""
    all_projections = collect_all_projections(ds, items_by_id)

    if not all_projections:
        print("  No projections to write.")
        return

    lines = [
        "// Auto-generated by scripts/embed.py",
        f"// Contains all archived {ds.name} projections for frontend selection.",
        f"// To regenerate: uv run scripts/embed.py --dataset {ds.name}",
        "",
    ]

    if ds.emit_interface:
        lines += [
            "export interface ClusterLabel {",
            "\tlabel: string;",
            "\tdescription: string;",
            "}",
            "",
            "export interface PosterPoint {",
            "\tid: number;",
            "\tx: number;",
            "\ty: number;",
            "\ttheme: string;",
            "\tcluster?: number;",
            "}",
            "",
            "export interface Projection {",
            "\tlabel: string;",
            "\tmodel: string;",
            "\tprojector: string;",
            "\thasClusters: boolean;",
            "\tclusterLayers?: number[][];",
            "\t// LLM-generated cluster names, keyed by cluster id (as string).",
            "\t// clusterLabels → flat `cluster` field; clusterLayerLabels[i] → clusterLayers[i].",
            "\tclusterLabels?: Record<string, ClusterLabel>;",
            "\tclusterLayerLabels?: Record<string, ClusterLabel>[];",
            "\tpoints: PosterPoint[];",
            "}",
            "",
        ]
    else:
        lines += [
            "import type { Projection } from './poster_projections';",
            "",
        ]

    lines.append(f"export const {ds.ts_var}: Projection[] = [")

    for label, meta, ordered_items, coords, clusters, cluster_layers, cluster_labels, cluster_layer_labels in all_projections:
        lines.append("\t{")
        lines.append(f"\t\tlabel: {json.dumps(label)},")
        lines.append(f"\t\tmodel: {json.dumps(meta['model'])},")
        lines.append(f"\t\tprojector: {json.dumps(meta['projector'])},")
        lines.append(f"\t\thasClusters: {'true' if clusters else 'false'},")
        if cluster_layers and len(cluster_layers) > 1:
            lines.append(f"\t\tclusterLayers: {json.dumps(cluster_layers)},")
        if cluster_labels:
            lines.append(f"\t\tclusterLabels: {json.dumps(cluster_labels)},")
        if cluster_layer_labels:
            lines.append(f"\t\tclusterLayerLabels: {json.dumps(cluster_layer_labels)},")
        lines.append("\t\tpoints: [")
        for i, (item, (x, y)) in enumerate(zip(ordered_items, coords)):
            theme = json.dumps(item["theme"])
            cluster_field = f", cluster: {clusters[i]}" if clusters else ""
            lines.append(f"\t\t\t{{ id: {item['id']}, x: {x:.6f}, y: {y:.6f}, theme: {theme}{cluster_field} }},")
        lines.append("\t\t],")
        lines.append("\t},")

    lines.append("];")
    lines.append("")

    with open(ds.ts_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    labels = [label for label, *_ in all_projections]
    print(f"  {ds.ts_path} ({os.path.getsize(ds.ts_path) / 1024:.0f} KB) — {len(labels)} projection(s): {', '.join(labels)}")


# ── Commands ─────────────────────────────────────────────────────────

def cmd_embed(ds: Dataset, model_name: str, projector: str):
    ms = slug_for(model_name)
    items = ds.load_items()
    items_by_id = {p["id"]: p for p in items}
    print(f"Loaded {len(items)} {ds.name}")

    print(f"Loading model {model_name}...")
    embeddings = compute_embeddings(items, model_name)
    print(f"Embedding shape: {embeddings.shape}")

    coords = project(embeddings, projector)
    clusters, cluster_layers = cluster(embeddings, projector)
    archive_run(ds, ms, projector, items, embeddings, coords, model_name, clusters, cluster_layers)

    print("Writing TS files...")
    write_ts_projections(ds, items_by_id)
    print("Done!")


def cmd_reproject(ds: Dataset, model_slug: str, projector: str):
    print(f"Loading archived embeddings for {ds.name}/{model_slug}...")
    embeddings, ids, meta = load_archived_embeddings(ds, model_slug)
    print(f"  Model: {meta['model']}, dim={meta['dim']}, n={meta.get('n_items')}")

    items = ds.load_items()
    items_by_id = {p["id"]: p for p in items}
    # Archived embeddings may include since-withdrawn items: drop those rows.
    keep = [i for i, item_id in enumerate(ids) if item_id in items_by_id]
    if len(keep) < len(ids):
        print(f"  Dropping {len(ids) - len(keep)} withdrawn item(s) from archived embeddings")
        ids = [ids[i] for i in keep]
        embeddings = embeddings[keep]
    ordered_items = [items_by_id[i] for i in ids]

    coords = project(embeddings, projector)
    clusters, cluster_layers = cluster(embeddings, projector)
    archive_run(ds, model_slug, projector, ordered_items, embeddings, coords, meta["model"], clusters, cluster_layers)

    print("Writing TS files...")
    write_ts_projections(ds, items_by_id)
    print("Done!")


def cmd_rebundle(ds: Dataset):
    """Rewrite the TS bundle from archived runs without re-embedding."""
    items = ds.load_items()
    items_by_id = {p["id"]: p for p in items}
    print(f"Loaded {len(items)} {ds.name}")
    write_ts_projections(ds, items_by_id)
    print("Done!")


def cmd_list(ds: Dataset):
    ds_dir = OUTPUTS_DIR / ds.name
    if not ds_dir.exists():
        print("No archived runs.")
        return
    for model_dir in sorted(ds_dir.iterdir()):
        if not model_dir.is_dir():
            continue
        for proj_dir in sorted(model_dir.iterdir()):
            meta_path = proj_dir / "metadata.json"
            if meta_path.exists():
                with open(meta_path) as f:
                    meta = json.load(f)
                label = f"{meta.get('model_slug', model_dir.name)}/{proj_dir.name}"
                print(
                    f"  {label:40s}  model={meta['model']}  dim={meta['dim']}  "
                    f"n={meta.get('n_items')}  {meta['timestamp']}"
                )


def main():
    parser = argparse.ArgumentParser(description="Embed poster/talk abstracts")
    parser.add_argument("--dataset", required=True, choices=DATASETS.keys(), help="Which dataset to process")
    parser.add_argument("--model", default="allenai/specter2", help="HuggingFace model name")
    parser.add_argument("--projector", default="umap", choices=PROJECTORS.keys(), help="2D projection method")
    parser.add_argument("--reproject", metavar="SLUG", help="Re-project from archived embeddings (e.g. specter2)")
    parser.add_argument("--list", action="store_true", help="List archived runs")
    parser.add_argument("--rebundle", action="store_true", help="Rewrite the TS bundle from archived runs without re-embedding")
    args = parser.parse_args()

    ds = DATASETS[args.dataset]

    if args.list:
        cmd_list(ds)
    elif args.rebundle:
        cmd_rebundle(ds)
    elif args.reproject:
        cmd_reproject(ds, args.reproject, args.projector)
    else:
        cmd_embed(ds, args.model, args.projector)


if __name__ == "__main__":
    main()

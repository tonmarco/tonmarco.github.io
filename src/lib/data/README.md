# Program data: where it comes from and how it's built

## IC2S2 2027 public workbook

The 2027 program page reads generated JSON whose source of truth is the editable
`scripts/input/IC2S2_2027_program.xlsx` workbook. Titles, authors, abstracts, dates,
times, rooms, sessions, and tracks are displayed exactly as entered in that file.

After editing the workbook, regenerate the site data with:

```bash
npm run program:import
npm run check
npm run build
```

This writes `src/lib/data/full-program/program-2027.json`. The `program:seed` command
recreates the example workbook and should only be used when intentionally replacing
the whole workbook.

The older pipeline documented below remains available as a reference for processing
the organizer exports used in 2026.

The organizers send us spreadsheets that change shape from one send to the next.
This documents how those raw files become the data the site imports — so next
year's editor can follow the chain.

## The pipeline

```
scripts/input/*  →  build_data.py  →  full-program/*.json  →  index.ts (typed)  →  app
   raw sends        clean + shape       app data             barrel
```

One script does it all: it reads each raw file, cleans and shapes it **in memory**,
and writes the JSON the app imports. There is no on-disk intermediate to manage.

| Layer                                | What                                                                    | Committed?            |
| ------------------------------------ | ----------------------------------------------------------------------- | --------------------- |
| `scripts/input/*`                    | raw files exactly as received (provenance in `scripts/input/README.md`) | no — gitignored (PII) |
| `src/lib/data/full-program/*.json`   | app-shaped data, PII-free                                               | **yes**               |
| `src/lib/data/full-program/index.ts` | one barrel that imports the JSON and re-exports it typed                | **yes**               |

`build_data.py` never hand-writes TypeScript — it builds a data structure and
`json.dumps` it. All data **types live in `types.ts`**; `index.ts` just attaches them.
The embedding scripts read the JSON too.

## Lineage (per output)

```
parallel-sessions.json ←┐
poster.json            ←┤
virtual-day.json       ←┤ build_data.py ← scripts/input/*  (+ program-corrections.json for program)
program.json           ←┘
   ↑ all four imported + typed by full-program/index.ts (parallelSessions, posters, virtualDaySchedule, program)

talk_projections.ts   ← embed.py --dataset talks   ← parallel-sessions.json
poster_projections.ts ← embed.py --dataset posters ← poster.json
keynotes.ts / tutorials.ts — hand-authored data; program-resolver.ts — join logic.
```

Only accepted parallel talks are pulled from the submissions workbook; other
decisions (posters/lightning/waitlist/withdrawn) stay inspectable in the workbook
itself rather than as extra files.

## Regenerate after a new send

```bash
uv run scripts/build_data.py             # diff every module against the committed JSON
uv run scripts/build_data.py --only program
uv run scripts/build_data.py --write     # apply
```

Defaults to a diff, so you always see the change before writing. Drop the new files
in `scripts/input/` (matching the names in `build_data.py`) and re-run.

## Notes / known gaps

- **Two abstract sources.** The submissions workbook has abstracts + session
  assignments but **no keywords**; `...standardized.csv` has keywords + abstracts for
  all submissions but no scheduling. The poster build joins them on submission id
  (`id` in standardized — its `submission` column is garbage), and pulls poster text
  from standardized (clean utf-8) since the POSTERS sheet is cp1252.
- **Poster days come only from `POSTERS (Assigned Days)`** (`Day assigned` = 1/2/3 →
  Wed/Thu/Fri). 206 scheduled (69/65/72); the workbook lists 213 accepted — reconcile
  when a newer poster-day file arrives.
- **`program.ts` is generated.** Everything mechanical (types, times, titles, lightning
  items, parallel-session titles) is derived from the schedule workbook. The few things
  this year's workbook gets wrong or omits — Day 1 (its rows are unparseable),
  plenary-keynote chairs, a couple of speaker spellings — are supplied in
  **`scripts/program-corrections.json`**. These belong fixed at the source; a structured
  **template** next year should let it arrive correct and retire that file. (One cosmetic
  gap vs the old hand-made file: an editorial "and" in the closing-remarks line.)
- **Encoding:** hand-exported CSVs mix cp1252 and utf-8; readers decode per-source with
  `errors="replace"`, so a stray byte may surface as `�` — the diff-first build catches it.

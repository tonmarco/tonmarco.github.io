#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "openpyxl",
#     "python-calamine",
# ]
# ///
"""
Build the app's data JSON straight from the raw files the organizers send us.

    scripts/input/*  →  build_data.py  →  src/lib/data/full-program/*.json  →  *.ts (typed) → app

One step: read each raw source, clean + shape it in memory, and write the JSON the
app imports (typed via the full-program/index.ts barrel; types live in types.ts).
There is no on-disk intermediate — wrangling is purely internal. The few things this
year's program workbook gets wrong or omits live in scripts/program-corrections.json.

Raw sources (in scripts/input/, gitignored — they contain PII):
  IC2S2_2026_with_sessions.xlsx [Submissions]      → parallel-sessions.json
  POSTERS (Assigned Days).xlsx [V2 - Web, Remove]         → poster.json
  Virtual Day ... v1.csv                                  → virtual-day.json
  Volunteer Session Sign Up.xlsx + program-corrections.json → program.json

The embedding scripts (embed_talks.py / embed_posters.py) read the JSON too.

Usage:
    uv run scripts/build_data.py                 # diff every module against committed JSON
    uv run scripts/build_data.py --only program
    uv run scripts/build_data.py --write         # apply
"""

import argparse
import datetime
import difflib
import json
import re
from functools import cache
from pathlib import Path

import openpyxl

INPUT = Path("scripts/input")
OUT = Path("src/lib/data/full-program")

SUBMISSIONS_XLSX = INPUT / "IC2S2_2026_with_sessions.xlsx"
POSTERS_XLSX = INPUT / "POSTERS (Assigned Days).xlsx"
POSTERS_SHEET = "Poster Program V2 - Web"  # the clean copy; "Poster Program" has a junk table at the bottom
POSTERS_REMOVE_SHEET = "Remove"  # withdrawn posters, one per row, no header
STANDARDIZED = INPUT / "IC2S2_2026-06-29_1782754700.xlsx"  # EasyChair submissions export
PROGRAM_XLSX = INPUT / "Volunteer Session Sign Up.xlsx"
VIRTUAL_XLSX = INPUT / "Virtual Day IC2S2, July 21 2026.xlsx"
VIRTUAL_SHEET = "Draft program v2"
CORRECTIONS = Path("scripts/program-corrections.json")


# ── shared readers / cleaners ────────────────────────────────────────

def clean(value) -> str:
    """Collapse runs of whitespace (Excel cells wrap mid-text) to single spaces."""
    return " ".join(str(value or "").split())


def clean_abstract(value) -> str:
    """Like clean(), but keep blank-line paragraph breaks: EasyChair hard-wraps every
    line, yet ~18% of abstracts have real paragraphs. Collapse soft wraps within each
    paragraph; join paragraphs with a blank line (rendered via white-space: pre-line)."""
    paras = re.split(r"\n\s*\n", str(value or ""))
    return "\n\n".join(" ".join(p.split()) for p in paras if p.strip())


def norm_id(value) -> str:
    s = str(value).strip()
    return s[:-2] if s.endswith(".0") else s


def cell(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (datetime.time, datetime.datetime)):  # Excel time cell → "10:30 AM"
        h, m = value.hour, value.minute
        return f"{h % 12 or 12}:{m:02d} {'AM' if h < 12 else 'PM'}"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return value.strip() if isinstance(value, str) else str(value)


def read_xlsx_rows(path: Path, sheet: str, header_key: str) -> list[dict]:
    """Read an .xlsx sheet (openpyxl) into list-of-dicts. The header is the first row
    containing header_key (the export has a blank leading row, sometimes with a stray
    stray cell, so we anchor on a known column name rather than 'first non-empty')."""
    ws = openpyxl.load_workbook(path, read_only=True, data_only=True)[sheet]
    rows = [[cell(c) for c in r] for r in ws.iter_rows(values_only=True)]
    hi = next(i for i, r in enumerate(rows) if header_key in r)
    header = [h.strip() for h in rows[hi]]
    return [dict(zip(header, r)) for r in rows[hi + 1:]]


def col_ci(row: dict, name: str):
    """Case-insensitive column lookup — the sheets' header casing is not stable
    (e.g. 'theme' sits beside 'TITLE'/'AUTHORS')."""
    lname = name.lower()
    return next((v for k, v in row.items() if isinstance(k, str) and k.lower() == lname), None)


# ── parallel-sessions.json  ← submissions xlsx ───────────────────────

SUBMISSIONS_SHEET = "Submissions"
REG_STATUS_COL = 3  # the unnamed 4th column
PARALLEL_DECISION = "Accept: Parallel Session"


@cache  # pure reader over immutable source files; callers must not mutate the result
def read_submissions() -> list[dict]:
    wb = openpyxl.load_workbook(SUBMISSIONS_XLSX, read_only=True, data_only=True)
    if SUBMISSIONS_SHEET not in wb.sheetnames:
        raise SystemExit(f"No '{SUBMISSIONS_SHEET}' sheet in {SUBMISSIONS_XLSX} (found {wb.sheetnames})")
    raw = list(wb[SUBMISSIONS_SHEET].iter_rows(values_only=True))
    header = [h if h is not None else f"col{i}" for i, h in enumerate(raw[0])]
    header[REG_STATUS_COL] = "Reg status"
    rows = []
    for r in raw[1:]:
        rec = {header[i]: cell(r[i] if i < len(r) else None) for i in range(len(header))}
        if rec.get("Submission", "").strip():
            rec["Submission"] = norm_id(rec["Submission"])
            rows.append(rec)
    return rows


@cache  # pure reader over immutable source files; callers must not mutate the result
def standardized_by_id() -> dict:
    """The EasyChair submissions export, keyed by submission id (the `#` column) and
    normalized to {title, authors, keywords, abstract}. This is the authoritative
    source for that text — the assembled scheduling workbook's Abstract column has
    swaps (#534 carried #228's abstract; #574 held only its title), so we don't trust
    it. Read with calamine because EasyChair's xlsx ships malformed style XML that
    openpyxl rejects."""
    from python_calamine import CalamineWorkbook

    rows = CalamineWorkbook.from_path(str(STANDARDIZED)).get_sheet_by_index(0).to_python()
    header = [str(h).strip() for h in rows[0]]
    out = {}
    for r in rows[1:]:
        rec = dict(zip(header, r))
        sid = norm_id(rec.get("#", ""))
        if sid:
            out[sid] = {"title": str(rec.get("Title") or ""), "authors": str(rec.get("Authors") or ""),
                        "keywords": str(rec.get("Keywords") or ""), "abstract": str(rec.get("Abstract") or "")}
    return out


def _sess_norm(t: str) -> str:
    return " ".join(re.sub(r"^#\d+\s*", "", t).rstrip(";").split()).lower()


def _sess_base(t: str) -> str:  # drop the trailing "(...)" disambiguator
    return re.sub(r"\s*\([^)]*\)$", "", _sess_norm(t)).strip()


def _sess_chair(s: str) -> str:  # "Chair: Katie Spoon, kspoon@stanford.edu" → "Katie Spoon"
    return re.sub(r"^\s*chair:?\s*", "", s, flags=re.I).split(",")[0].strip()


def parse_session_rooms() -> tuple[dict, dict]:
    """Room + chair per parallel session, from the program workbook's day sheets.
    A session row has no start time, a title, a room (col 2) and a "Chair: …" (col 4);
    Friday afternoon omits the "#N" prefix, so we key off room+chair, not the prefix.
    Returns (exact, based) lookups keyed by (day, AM/PM, title) — exact wins, base is
    the fallback for rows where the sheet dropped the title's "(n)" disambiguator."""
    wb = openpyxl.load_workbook(PROGRAM_XLSX, read_only=True, data_only=True)
    day_of = {"Wednesday Full Program": 2, "Thursday Full Program": 3, "Friday Full Program": 4}
    exact, based = {}, {}
    for sheet, daynum in day_of.items():
        if sheet not in wb.sheetnames:
            continue
        cur = None
        for r in wb[sheet].iter_rows(values_only=True):
            cells = [" ".join(cell(c).split()) for c in r]
            time = cells[0] if cells else ""
            title = cells[1] if len(cells) > 1 else ""
            room = cells[2] if len(cells) > 2 else ""
            chair = cells[4] if len(cells) > 4 else ""
            if time and time[0].isdigit():
                h = int(re.match(r"(\d{1,2})", time).group(1))
                cur = "AM" if 7 <= h < 12 else "PM"  # bare afternoon hours (1–6) mean PM
            if title and room and "hair" in chair.lower():
                meta = {"room": room, "chair": _sess_chair(chair)}
                exact[(daynum, cur, _sess_norm(title))] = meta
                based.setdefault((daynum, cur, _sess_base(title)), []).append(meta)
    return exact, based


def build_parallel() -> list:
    # only accepted parallel talks; one row per submission. Abstract comes from the
    # standardized export (see standardized_by_id) since the workbook's is unreliable.
    # Papers keep the workbook's row order — that's the speaking order, don't sort it.
    std = standardized_by_id()
    seen, sessions = set(), {}
    for r in read_submissions():
        if r.get("Decision", "").strip() != PARALLEL_DECISION or r["Submission"] in seen:
            continue
        seen.add(r["Submission"])
        key = (int(r["DAY"]), r["TIME"].strip(), r["SESSION"].strip())  # one session per (day, time, track) cell
        s = sessions.setdefault(key, {"title": clean(r["SESSION TITLE"]), "day": key[0],
                                      "time": key[1], "track": key[2], "papers": []})
        s["papers"].append({"submission": int(r["Submission"]), "title": clean(r["Title"]),
                            "authors": clean(r["Authors"]),
                            "abstract": clean_abstract(std.get(r["Submission"], {}).get("abstract") or r["Abstract"])})

    exact, based = parse_session_rooms()  # attach room + chair from the program sheets
    out = []
    for k in sorted(sessions):  # day, then AM<PM, then track A–H
        s = sessions[k]
        meta = exact.get((s["day"], s["time"], _sess_norm(s["title"])))
        if not meta:
            cand = based.get((s["day"], s["time"], _sess_base(s["title"])), [])
            meta = cand[0] if len(cand) == 1 else None
            if cand and not meta:
                print(f"  ! session '{s['title']}' (day {s['day']} {s['time']}): "
                      f"{len(cand)} program rows share the base title — room/chair omitted")
        if meta:
            s["room"], s["chair"] = meta["room"], meta["chair"]
        out.append(s)
    return out


# ── poster.json  ← POSTERS (Assigned Days) + standardized ────────────

POSTER_DATES = {1: "Wednesday, July 29", 2: "Thursday, July 30", 3: "Friday, July 31"}


@cache  # pure reader over immutable source files
def removed_poster_ids() -> set:
    """Withdrawn posters, from the workbook's Remove sheet: one poster per row,
    id in the first column, no header row."""
    ws = openpyxl.load_workbook(POSTERS_XLSX, read_only=True, data_only=True)[POSTERS_REMOVE_SHEET]
    return {norm_id(cell(r[0])) for r in ws.iter_rows(values_only=True) if r and cell(r[0]).strip()}


def build_posters() -> list:
    # Title/authors/keywords/abstract come from the EasyChair export; the poster day
    # comes from the workbook's "V2 - Web" sheet. Withdrawn posters live in the
    # Remove sheet — subtract them explicitly, since a poster the organizers pull
    # may linger in the program sheet for a while.
    std = standardized_by_id()
    corrections = json.loads(CORRECTIONS.read_text(encoding="utf-8"))
    day_fix = corrections.get("poster_days", {})
    author_fix = corrections.get("poster_authors", {})
    removed = removed_poster_ids()
    by_day: dict[int, list] = {}
    seen_sids = set()  # every sheet id encountered, to flag stale correction keys
    for r in read_xlsx_rows(POSTERS_XLSX, POSTERS_SHEET, "Submissions"):
        sid = norm_id(r.get("Submissions", ""))
        seen_sids.add(sid)
        if sid in removed:
            continue
        day = str(day_fix.get(sid, r.get("Day assigned", "").strip()))  # corrections override the sheet
        if day not in {"1", "2", "3"}:  # only posters actually scheduled to a day
            continue
        s = std.get(sid, {})
        by_day.setdefault(int(day), []).append({
            "id": int(sid), "title": clean(s.get("title") or r.get("TITLE")),
            "authors": clean(author_fix.get(sid) or s.get("authors") or r.get("AUTHORS")), "theme": clean(col_ci(r, "theme")),
            "keywords": clean(s.get("keywords")), "abstract": clean_abstract(s.get("abstract")),
        })
    # A correction keyed by an id that matches no sheet row is a silent no-op
    # (renumbered/withdrawn poster) — flag it.
    for k in sorted((set(day_fix) | set(author_fix)) - seen_sids - {"_note"}):
        print(f"  ! poster correction {k!r} matches no sheet row — not applied")
    return [{"day": day, "session": f"Poster Session {day}", "date": POSTER_DATES[day],
             "posters": sorted(by_day[day], key=lambda p: p["id"])}
            for day in sorted(by_day)]


# ── virtual-day.json  ← Virtual Day CSV ──────────────────────────────

def build_virtual() -> list:
    rows = read_xlsx_rows(VIRTUAL_XLSX, VIRTUAL_SHEET, "Submission number")
    sections, cur = [], None
    for r in rows:
        sn = (r.get("Submission number") or "").strip()
        if sn.startswith("Track"):  # header row: "Track 1 | Session 1 | <theme>"
            parts = [p.strip() for p in sn.split("|")]
            try:
                cur = {"track": int(parts[0].split()[1]), "session": int(parts[1].split()[1]),
                       "theme": parts[2], "slot": "", "presentations": []}
            except (IndexError, ValueError) as e:
                raise SystemExit(f"[virtual] malformed Track header row {sn!r} "
                                 f"(expected 'Track N | Session N | <theme>'): {e}") from e
            sections.append(cur)
        elif sn.isdigit() and cur is not None:
            cur["slot"] = clean(r.get("Start of session (ET)"))
            cur["presentations"].append({
                "submission": int(sn), "title": clean(r.get("Title")), "authors": clean(r.get("Authors")),
                "format": clean((r.get("Accepted Format") or "").split(";")[0]),  # 324 is "Parallel; Poster"
                "timeET": clean(r.get("Start of presentation (ET)")),
                "timeLocal": clean(r.get("Start of presentation (local time)")),
                "speakingFrom": clean(r.get("Speaking from (best guess)")),
            })
    slots: dict[str, list] = {}
    for s in sections:
        slots.setdefault(s["slot"], []).append(s)
    return [{"time": time, "sessions": [{"track": s["track"], "session": s["session"],
                                         "theme": s["theme"], "presentations": s["presentations"]}
                                        for s in sorted(slots[time], key=lambda s: s["track"])]}
            for time in slots]


# ── program.json  ← program xlsx + corrections ──────────────────────

# Per-day sheets: a header row (start time | <day> | LOCATION | Volunteers |
# MC/Chair) with data below it. Most sheets prefix a title + blank row, but the
# Thursday sheet puts the header on row 0 — so we locate it by content rather
# than a fixed offset. A row with a start time begins an event; rows with no
# time but a title (the "#N ..." lines) are its sub-items. Dates come from the
# sheet name (the source header cells are unreliable).
PROGRAM_DAYS = {
    "Tuesday Tutorials": ("Day 1", "Tuesday, July 28 — Tutorial Day"),
    "Wednesday Full Program": ("Day 2", "Wednesday, July 29"),
    "Thursday Full Program": ("Day 3", "Thursday, July 30"),
    "Friday Full Program": ("Day 4", "Friday, July 31"),
}


def parse_program_sheets() -> list:
    wb = openpyxl.load_workbook(PROGRAM_XLSX, read_only=True, data_only=True)
    days = []
    for sheet, (day, date) in PROGRAM_DAYS.items():
        if sheet not in wb.sheetnames:
            continue
        rows = list(wb[sheet].iter_rows(values_only=True))
        hdr = next((i for i, r in enumerate(rows)
                    if r and cell(r[0]).strip().lower() == "start time"), -1)
        events = []
        for r in rows[hdr + 1:]:
            cells = [" ".join(cell(c).split()) for c in r]  # collapse cell-wrapping newlines
            if not any(cells):
                continue
            time = cells[0] if cells else ""
            title = cells[1] if len(cells) > 1 else ""
            if time:
                events.append({"time": time, "title": title,
                               "location": cells[2] if len(cells) > 2 else "",
                               "volunteers": cells[3] if len(cells) > 3 else "",
                               "chairs": cells[4] if len(cells) > 4 else "", "items": []})
            elif title and events:  # "#N ..." sub-item under the event above
                events[-1]["items"].append(title)
        days.append({"day": day, "date": date, "events": events})
    return days


def _t(tok: str) -> str:
    """Normalize one time token: '9.00'→'9:00', bare afternoon hours→24h, 'pm'."""
    tok = tok.strip().replace(".", ":").lower()
    pm, am = tok.endswith("pm"), tok.endswith("am")
    tok = tok.replace("pm", "").replace("am", "").strip()
    if not tok:
        return ""
    h, _, m = tok.partition(":")
    h, m = int(h), int(m) if m else 0
    if pm and h < 12:
        h += 12
    elif not am and not pm and h < 7:  # bare afternoon hour (1–6 → 13–18)
        h += 12
    return f"{h}:{m:02d}"


def _time(rng: str) -> str:
    if "-" in rng:
        a, b = rng.split("-", 1)
        return f"{_t(a)}–{_t(b)}"
    return _t(rng)


def _classify(title: str):
    """(type, normalized title) from the sheet's free-text title."""
    t = title.lower()
    if "registration" in t:
        return "registration", "Registration and Coffee"
    if "lightning" in t:
        m = re.search(r'["“]([^"”]+)["”]', title)
        return "lightning", f"“{m.group(1) if m else title}” — Plenary Lightning Talks"
    if "keynote" in t:
        return "keynote", "Keynote"
    if "parallel" in t:
        return "parallel", "Parallel Sessions"
    if "poster" in t:
        m = re.search(r"(\d+)", title)
        return "poster", f"Poster Session {m.group(1)}" if m else "Poster Session"
    if "break" in t:
        return "break", "Coffee Break"
    if "lunch" in t:
        return "lunch", "Lunch"
    if "welcoming remarks" in t:
        return "remarks", "Welcoming Remarks"
    if "closing remarks" in t:
        return "remarks", "Closing Remarks"
    if "reception" in t:
        return "social", "Welcome Reception"
    if "dinner" in t:
        return "social", "Conference Dinner"
    return "remarks", title


def _chairs(vol: str) -> str:
    """Strip the sheet's MC/intro prefix — the wording shifts between edits
    ("Keynote MC:", "Lightning talk Intro:", the "Lighting Intro:" typo, with or
    without the colon), so match loosely rather than enumerate spellings."""
    return re.sub(r"^\s*(?:light\w*(?:\s+talk)?|keynote)?\s*(?:mc|intro)\b\s*:?\s*",
                  "", vol, flags=re.I).strip()


def _loc(loc: str) -> str:
    """Normalize the sheet's 'Davis Center <n>th/first floor …' casing variants,
    preserving the floor number and any suffix (ballroom, lounge)."""
    m = re.fullmatch(r"(?i)davis\s+center\s*,?\s*(\d(?:st|nd|rd|th)?|first|second|third|fourth)\s+floor\s*(.*)",
                     loc.strip())
    if not m:
        return loc.strip()
    words = {"first": "1st", "second": "2nd", "third": "3rd", "fourth": "4th",
             "1": "1st", "2": "2nd", "3": "3rd", "4": "4th"}
    floor = words.get(m.group(1).lower(), m.group(1).lower())
    suffix = " ".join(w.capitalize() for w in m.group(2).split())
    return f"Davis Center, {floor} Floor" + (f" {suffix}" if suffix else "")


def _title_key(t: str) -> str:
    """Loose title key for joining sources: lowercase, drop punctuation/apostrophes."""
    return " ".join(re.sub(r"[^\w\s]", " ", t.replace("’", "'").lower()).split())


def submissions_authors_by_title() -> dict:
    """Full author list per talk, keyed by loose title, from the submissions workbook.
    The program sheet's lightning rows name only the presenting author, so we join by
    title to recover the complete authorship (the workbook is the updated source)."""
    return {_title_key(r["Title"]): clean(r["Authors"]) for r in read_submissions() if r.get("Title")}


def _lightning_items(items: list, start: str, presenter_fixes: dict = {}, authors_by_title: dict = {}) -> list:
    sh, sm = map(int, _t(start.split("-")[0]).split(":"))
    out = []
    for i, raw in enumerate(items):
        s = re.sub(r"^#\d+\s*", "", raw).strip()
        parts = re.split(r"\s*[.\-]?\s*presenters?\s*[:\-]?\s*", s, maxsplit=1, flags=re.I)
        if len(parts) == 1 and " - " in s:  # some rows just use " - <name>" with no "Presenter" keyword
            parts = s.rsplit(" - ", 1)
        title = parts[0].strip().rstrip(".-ª ").strip()
        title = re.sub(r"(\w)'(\w)", r"\1’\2", title)  # straight → curly apostrophe (matches prod style)
        presenters = parts[1].strip() if len(parts) > 1 else ""
        presenters = authors_by_title.get(_title_key(title), presenters)  # full author list from submissions
        presenters = presenter_fixes.get(title, presenters)  # manual override wins over both
        mins = sm + 7 * i
        out.append({"time": f"{sh + mins // 60}:{mins % 60:02d}", "title": title,
                    "presenters": presenters})
    return out


def build_program() -> list:
    sched = parse_program_sheets()
    corr = json.loads(CORRECTIONS.read_text(encoding="utf-8"))
    keynote_keys_seen = set()  # every "Day N|H:MM" key looked up, to flag stale corrections
    ps_by = {}
    for s in build_parallel():  # canonical session titles by (day, AM/PM)
        ps_by.setdefault((s["day"], s["time"]), []).append(s["title"])
    authors_by_title = submissions_authors_by_title()  # lightning talks → full author list

    out = []
    for day in sched:
        if day["day"] == "Day 1":
            out.append({"day": "Day 1", "date": day["date"], "events": corr["day1"]})
            continue
        daynum = int(day["day"].split()[1])
        events = []
        for e in day["events"]:
            typ, title = _classify(e["title"])
            time = _time(e["time"])
            loc = _loc(e["location"])
            chairs = _chairs(e["chairs"])

            if "PLENARY" in e["title"].upper() and typ == "keynote":  # split into per-speaker keynotes
                for raw in e["items"]:
                    m = re.search(r"\(([\d:.\s–-]+)\)", raw)
                    if not m:
                        continue  # e.g. "VIP Dinner 6pm"
                    ktime = _time(m.group(1))
                    keynote_keys_seen.add(f"{day['day']}|{ktime}")
                    fix = corr["keynotes"].get(f"{day['day']}|{ktime}", {})
                    ev = {"time": ktime, "title": "Keynote", "type": "keynote",
                          "location": corr["locations"]["keynote"]}
                    if fix.get("chairs"):
                        ev["chairs"] = fix["chairs"]
                    if fix.get("speakers"):
                        ev["speakers"] = fix["speakers"]
                    events.append(ev)
                continue

            ev = {"time": time, "title": title, "type": typ}
            if typ == "poster":
                ev["title"] = f"Poster Session {daynum - 1}"  # session n == day index; Friday sheet's "1" is a typo
                ev["location"] = corr["locations"]["poster"]
            elif typ == "lunch":
                ev["location"] = corr["locations"]["lunch"]
            elif typ == "parallel":
                ev["parallelSessions"] = ps_by.get((daynum, "AM" if int(time.split(":")[0]) < 12 else "PM"), [])
            elif typ == "social" and "@" in e["title"]:
                ev["location"] = e["title"].split("@", 1)[1].strip()
            elif typ == "remarks" and e["items"]:  # closing remarks: the MC names become the item's presenters
                item = e["items"][0]
                ev["items"] = [{"title": item[:1].upper() + item[1:], "presenters": chairs}]
            else:
                if loc:
                    ev["location"] = loc
                if chairs:
                    ev["chairs"] = chairs
                keynote_keys_seen.add(f"{day['day']}|{time}")
                fix = corr["keynotes"].get(f"{day['day']}|{time}", {})
                if fix.get("speakers"):
                    ev["speakers"] = fix["speakers"]
                if typ == "lightning" and e["items"]:
                    ev["items"] = _lightning_items(e["items"], e["time"], corr.get("presenters", {}), authors_by_title)
            events.append(ev)
        out.append({"day": day["day"], "date": day["date"], "events": events})

    # A keynote correction whose "Day N|H:MM" key matches no program row is a
    # silent no-op (e.g. the sheet shifted a keynote's time) — flag it.
    for k in sorted(set(corr["keynotes"]) - keynote_keys_seen):
        print(f"  ! keynote correction {k!r} matches no program row — speakers/chairs not applied")
    return out


# ── cross-source consistency check ───────────────────────────────────

def check_consistency() -> int:
    """The submissions workbook's Decision column is the source of truth for a
    submission's *status*; the poster/virtual sheets place the details. They are
    maintained by different hands and drift, so a change made in one and not the
    other leaves a talk double-booked or contradicting its status. Catch that.

    Returns the number of hard conflicts (build should fail if > 0)."""
    subs = read_submissions()
    decisions = {r["Submission"]: r.get("Decision", "").strip() for r in subs}
    wb_abstract = {r["Submission"]: " ".join((r.get("Abstract") or "").split()) for r in subs}
    easychair = standardized_by_id()  # abstract source; workbook is fallback/reference
    wb_title = {r["Submission"]: clean(r.get("Title", "")) for r in subs}

    def label(sid: str) -> str:
        t = clean(easychair.get(sid, {}).get("title", "")) or wb_title.get(sid, "")
        return f"#{sid} “{t[:70]}…”" if len(t) > 70 else f"#{sid} “{t}”" if t else f"#{sid}"
    where: dict[str, list] = {}
    for s in build_parallel():
        for p in s["papers"]:
            where.setdefault(str(p["submission"]), []).append("parallel")
    for s in build_posters():
        for p in s["posters"]:
            where.setdefault(str(p["id"]), []).append("poster")
    for slot in build_virtual():
        for sess in slot["sessions"]:
            for p in sess["presentations"]:
                where.setdefault(str(p["submission"]), []).append("virtual")

    expected = {"Accept: Parallel Session": "parallel", "now Virtual": "virtual"}
    errors, warns = [], []
    for sid in sorted(where, key=lambda x: int(x) if x.isdigit() else 0):
        progs = sorted(set(where[sid]))
        dec = decisions.get(sid, "")
        if len(progs) > 1:
            errors.append(f"{label(sid)}: double-booked across {', '.join(progs)}  (workbook: {dec or 'n/a'})")
        elif dec == "Withdrawing":
            errors.append(f"{label(sid)}: workbook says 'Withdrawing' but scheduled in {progs[0]}")
        elif dec in expected and expected[dec] != progs[0]:
            warns.append(f"{label(sid)}: workbook says '{dec}' but scheduled in {progs[0]} (a sheet is lagging)")

    # a "now Virtual" talk removed from in-person but not yet given a Virtual Day
    # slot is scheduled nowhere — the limbo that makes authors email three times.
    scheduled_virtual = {sid for sid, ps in where.items() if "virtual" in ps}
    for sid, dec in sorted(decisions.items(), key=lambda kv: int(kv[0]) if kv[0].isdigit() else 0):
        if dec == "now Virtual" and sid not in scheduled_virtual:
            warns.append(f"{label(sid)}: workbook says 'now Virtual' but not in the Virtual Day (no slot yet)")

    # abstract source health: EasyChair is the source, the workbook is the reference.
    # Surface gaps (using the fallback) and mismatches so they never pass silently —
    # this is the "how many mismatches?" number, on every build.
    missing, mismatches = [], []
    for sid in sorted(where, key=lambda x: int(x) if x.isdigit() else 0):
        if not ({"parallel", "poster"} & set(where[sid])):  # only these display abstracts
            continue
        if sid not in easychair:
            missing.append(sid)
        elif wb_abstract.get(sid) and " ".join(easychair[sid].get("abstract", "").split())[:80] != wb_abstract[sid][:80]:
            mismatches.append(sid)
    for sid in missing:
        warns.append(f"{label(sid)}: not in the EasyChair export — abstract uses the workbook fallback")
    for sid in mismatches:
        warns.append(f"{label(sid)}: abstract differs (EasyChair vs workbook) — using EasyChair")

    print("\n[check] cross-source consistency (workbook Decision vs scheduled program)")
    for e in errors:
        print(f"  ✗ {e}")
    for w in warns:
        print(f"  ! {w}")
    if not errors and not warns:
        print("  ✓ all scheduled submissions agree with the workbook")
    return len(errors)


BUILDERS = {
    "parallel": (build_parallel, OUT / "parallel-sessions.json"),
    "posters": (build_posters, OUT / "poster.json"),
    "virtual": (build_virtual, OUT / "virtual-day.json"),
    "program": (build_program, OUT / "program.json"),
}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", choices=list(BUILDERS), help="Build a single module (default: all)")
    ap.add_argument("--write", action="store_true", help="Write the .json (default: diff only)")
    ap.add_argument("--no-check", action="store_true", help="Skip the cross-source consistency check")
    args = ap.parse_args()

    for name in ([args.only] if args.only else list(BUILDERS)):
        builder, dst = BUILDERS[name]
        text = json.dumps(builder(), indent=2, ensure_ascii=False) + "\n"
        if args.write:
            dst.write_text(text, encoding="utf-8")
            print(f"[{name}] wrote {dst}")
            continue
        current = dst.read_text(encoding="utf-8") if dst.exists() else ""
        if text == current:
            print(f"[{name}] IDENTICAL to {dst}")
        else:
            diff = list(difflib.unified_diff(current.splitlines(), text.splitlines(),
                                             fromfile=f"{dst} (committed)", tofile=f"{name} (generated)", lineterm=""))
            print(f"[{name}] DIFFERS from {dst} — {len(diff)} diff lines (run with --write to apply)")
            print("\n".join(diff[:60]))

    if not args.no_check:
        if check_consistency() > 0:
            raise SystemExit("\nConsistency check failed — fix the conflicting sheet(s) above.")


if __name__ == "__main__":
    main()

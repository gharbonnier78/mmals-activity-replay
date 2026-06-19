#!/usr/bin/env python3
"""Build a portable compact replay from a canonical events JSON/JSONL file."""
from __future__ import annotations
import argparse
import json
from pathlib import Path


def read_events(path: Path):
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".jsonl":
        return [json.loads(line) for line in text.splitlines() if line.strip()]
    payload = json.loads(text)
    return payload if isinstance(payload, list) else payload.get("events", [])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("events", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--max-events", type=int, default=100)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    events = read_events(args.events)
    stride = max(1, (len(events) + args.max_events - 1) // args.max_events)
    compact = {
        "manifest": {**manifest, "bundle_profile": "compact", "derived_from": manifest.get("run_id")},
        "events": events[::stride],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(compact, indent=2), encoding="utf-8")
    print(f"wrote {args.output} with {len(compact['events'])} events")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

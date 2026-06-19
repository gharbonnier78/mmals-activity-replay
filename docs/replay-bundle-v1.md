# MMALS Replay Bundle v1

## Purpose

Replay Bundle v1 binds replay data to a stable run identity. It prevents a collection of CSV or JSON files from being displayed without the experiment, code, dataset, domain, and provenance needed to interpret them.

## Required manifest fields

- `schema_version`: must be `mmals-replay-bundle-v1`;
- `bundle_profile`: `full`, `standard`, or `compact`;
- `run_id`: stable unique identifier;
- `project`, `experiment`, `experiment_version`;
- `domain_pack`;
- `source.repository`, with `source.commit` strongly recommended;
- optional `dataset`, `files`, `checksums`, `provenance`, and scientific boundaries.

## Profiles

### Full

Contains the detailed event stream, routes, metrics, audit traces, configuration, and integrity metadata needed for deep inspection. A full bundle does not automatically guarantee reproducibility; it must still identify code, dependencies, data, and seeds.

### Standard

Contains the main routes, metrics, events, and decision evidence required for scientific inspection. The v0.9 compatibility manifest is a standard bundle.

### Compact

Contains a reduced timeline suitable for GitHub Pages, Diderot pages, documentation, or an iframe. A compact replay is a portable evidence view, not a replacement for the full run.

## Directory convention

```text
replay_bundle/
  run_manifest.json
  data/
    events.jsonl
    routes.csv
    metrics.csv
    audit_trace.jsonl
  compact/
    replay.compact.json
  figures/
  README.md
```

The format allows alternative layouts because file locations are declared in the manifest.

## Provenance states

- `observed`: directly logged in the source evidence;
- `derived`: computed from logged values by a documented transform;
- `interpolated`: generated only to display movement between checkpoints;
- `mixed`: a panel or metric set combines several states.

These labels describe evidence origin, not data quality.

## Local loading

The browser loader accepts a multi-file selection containing `run_manifest.json` and every required file. It matches files by manifest path or basename. No file is uploaded by the static application.

## Hosted loading

A published manifest can reference relative files. The v0.9 compatibility manifest wraps the existing files under `data/demo/` without modifying them.

# Migration from v0.1.1 to v0.2.0

## Preserved

- browser-only static deployment;
- local CSV parsing;
- training and inference/audit modes;
- ecosystem graph;
- route-simplex projection;
- synchronized metric traces;
- A-to-B comparison;
- scientific distinction between observed, derived, and interpolated values;
- compatibility with the public v0.9 CSV filenames under `data/demo/`.

## Added

- Replay Bundle v1 manifest;
- `full`, `standard`, and `compact` profiles;
- hosted and local bundle loading;
- compact JSON loading and export;
- domain-pack descriptors;
- run identity, provenance, and validation panel;
- schema files;
- command-line bundle validation;
- CI tests before GitHub Pages deployment;
- compact/embed entry point.

## Important deployment note

This delivery is an **overlay** for the existing repository. Copy it into the repository root. Files that are not present in the overlay—especially the existing user-manual PDF/TeX and `data/demo/*.csv`—must remain in place.

## Manual validation

1. Open `index.html` through GitHub Pages or a local HTTP server.
2. Select **Load v0.9 compatibility demo**.
3. Confirm the manifest loads the existing `data/demo` files.
4. Load `examples/legacy_csv/minimal_route_trace.csv` with the legacy loader.
5. Load `examples/compact/replay.compact.json` with the compact loader.
6. Switch between full and compact display modes.
7. Pin A and move to B.
8. Confirm validation warnings remain visible rather than silently repaired.

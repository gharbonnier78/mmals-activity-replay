# MMALS Activity Replay

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-2ea44f)](https://gharbonnier78.github.io/mmals-activity-replay/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](CHANGELOG.md)

Interactive browser-based replay and scientific-audit tool for MMALS route-function activity, specialization, drift, regime signals, mutualistic gain, and cost proxies.

**v0.2.0 turns the original player into an extensible replay engine:** versioned Replay Bundle manifests, provenance and validation, domain-pack descriptors, legacy CSV compatibility, and synchronized full/compact views.

## Live application

https://gharbonnier78.github.io/mmals-activity-replay/

The site is static. Selected local files remain in the browser and are not uploaded by the application.

## What v0.2.0 adds

- **Replay Bundle v1** with a stable `run_manifest.json`;
- `full`, `standard`, and `compact` bundle profiles;
- hosted and local bundle loading;
- portable compact JSON loading and export;
- domain packs for generic core and route-function replay;
- explicit run, code, dataset, and provenance cards;
- structural validation report;
- dependency-free command-line validator;
- CI validation before GitHub Pages deployment;
- compact/embed entry point;
- continued local loading of legacy MMALS CSV exports.

## Preserved from v0.1.1

- training and inference/audit replay;
- ecosystem graph separating hosts, fungal medium, heads, and memory;
- route allocation using a documented projection of probability-simplex geometry;
- synchronized loss, accuracy, specialization, entropy, gain, and drift traces;
- A-to-B comparison;
- visual objective lenses with an explicit non-causal warning;
- scientific distinction between observed, derived, and interpolated values;
- compatibility manifest for the public MMALS v0.9 CSV files under `data/demo/`.

## Quick start

### Existing v0.9 public evidence

Open the application and select **Load v0.9 compatibility demo**. The v0.2 manifest binds the existing files in `data/demo/`; it does not modify or duplicate them.

### Compact example

Select **Load compact example**, or load:

```text
examples/compact/replay.compact.json
```

### Legacy CSV

Select **Load legacy CSV** and choose one or more compatible files. A minimal example is provided at:

```text
examples/legacy_csv/minimal_route_trace.csv
```

### Replay Bundle files

Select `run_manifest.json` and all files declared as required in the manifest. Files are matched by path or basename.

## Repository structure

```text
.
├── index.html
├── assets/                         # application JavaScript and CSS
├── embed/                          # compact entry point
├── bundles/                        # published run manifests
├── domains/                        # domain-pack descriptors
├── schemas/                        # Replay Bundle v1 JSON Schemas
├── data/demo/                      # retained public MMALS v0.9 CSV evidence
├── examples/                       # compact and legacy examples
├── tools/                          # validation and compact-builder scripts
├── tests/                          # dependency-free contract tests
├── docs/                           # contracts, migration, fidelity, release checklist
└── .github/workflows/pages.yml     # validation + GitHub Pages deployment
```

## Validation

```bash
python tools/validate_bundle.py examples/compact/replay.compact.json --root .
python -m unittest discover -s tests -v
```

The compatibility manifest references existing `data/demo` files, so validate it after applying this overlay to the complete repository:

```bash
python tools/validate_bundle.py bundles/route-function-v09-compat/run_manifest.json --root .
```

## Scientific interpretation

- route weights are nonnegative and normalized;
- the five-host display is a two-dimensional projection of the probability simplex;
- interpolation between checkpoints is not direct observation;
- routing entropy is not physical carbon consumption;
- gain summaries are not automatically per-host causal contributions;
- an uncalibrated change score is not a probability;
- an objective lens changes emphasis only and does not create a counterfactual execution.

See [scientific fidelity boundaries](docs/scientific-fidelity.md).

## Documentation

- [Replay Bundle v1](docs/replay-bundle-v1.md)
- [Domain-pack contract](docs/domain-pack-contract.md)
- [Scientific fidelity](docs/scientific-fidelity.md)
- [Migration from v0.1.1](docs/migration-v0.1.1-to-v0.2.0.md)
- [Release checklist](docs/release-checklist-v0.2.0.md)
- Existing user-manual PDF and LaTeX source remain in `docs/`.

## Roadmap boundary

v0.2.0 provides the extensible core. It does **not** claim delivery of Goal-Adaptive Control, CAL, TPUT, Geometry G1, or RC2O domain packs. Those are later validated stages.

## License

MIT License.

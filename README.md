# MMALS Route-Function Activity Replay

[![GitHub Pages](https://img.shields.io/badge/live-GitHub%20Pages-2ea44f)](https://gharbonnier78.github.io/mmals-ml-wiki/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)

**Interactive browser-based replay and scientific-audit tool for MMALS route-function activity, specialization, drift, regime changes, mutualistic gain, and cost proxies.**

## Live application

<https://gharbonnier78.github.io/mmals-activity-replay/>

The application is a self-contained static page. It can replay bundled MMALS v0.9 evidence or parse compatible CSV files locally in the browser.

## What it shows

- training and inference/audit replay on a shared time axis;
- an ecosystem graph of hosts, the mediating fungal system, heads, and memory exchanges;
- route allocation on the natural probability-simplex geometry;
- task loss, accuracy, dominance, entropy, mutualistic gain, and drift diagnostics;
- forward and backward exchange cues;
- A-to-B snapshot comparison;
- objective lenses for performance, stability, ecology, efficiency, and balance;
- clear labels distinguishing logged measurements, derived proxies, and interpolation.

## Quick start

### Online

Open the [GitHub Pages application](https://gharbonnier78.github.io/mmals-activity-replay/).

### Local

Open `index.html` in a modern browser. The embedded demo works without a web server. External web fonts may fall back to local system fonts when offline.

### Load private evidence

Use **Load CSV files** in the application. Selected files are parsed locally and are not uploaded by this static site.

## Documentation

- [User manual - PDF](docs/MMALS_Activity_Replay_User_Manual_v0_1.pdf)
- [User manual - LaTeX source](docs/MMALS_Activity_Replay_User_Manual_v0_1.tex)
- [CSV contract](docs/csv-contract.md)
- [Scientific fidelity boundaries](docs/scientific-fidelity.md)
- [Publishing instructions](PUBLISHING.md)
- [Event-level trace schema](data/schemas/mmals_event_trace_schema.csv)

## Repository structure

```text
.
├── index.html                         # self-contained application
├── data/
│   ├── demo/                          # public MMALS v0.9 demonstration traces
│   └── schemas/                       # future event-level trace contract
├── docs/                              # manual and scientific documentation
├── examples/                          # minimal loader examples
├── .github/workflows/pages.yml        # GitHub Pages deployment
├── CITATION.cff
├── CHANGELOG.md
├── LICENSE
└── PUBLISHING.md
```

## Data compatibility

The current viewer detects common MMALS notebook exports by columns:

- training: `task_id`, `epoch`, `task_loss`;
- routing: `host_0`, `host_1`, ...;
- retained-task history: `after_task`, `task_id`, `acc`;
- drift: `route_drift`, `latent_drift`, `output_drift`;
- alternate diagnostics: `route_drift_Dr`, `latent_drift_Dz`, `output_drift_Dy`.

The model identifier can be `model` or `method`.

## Scientific interpretation

The route view is a simplex because route weights are nonnegative and sum to one. A torus is not imposed unless the underlying variables genuinely have periodic topology.

The bundled v0.9 data has important limits:

- training routes are checkpointed, so animation between checkpoints is interpolated;
- routing entropy is a carbon-cost proxy, not physical CO2e;
- logged gain summaries are not automatically per-host causal contributions;
- the change ribbon is a proxy unless a calibrated detector probability is supplied;
- objective lenses reframe observations but do not recompute counterfactual model behavior.

See [scientific fidelity boundaries](docs/scientific-fidelity.md) for the complete interpretation contract.

## GitHub Pages

The included workflow deploys the repository root after a push to `main`. After the first push, select **GitHub Actions** under **Settings -> Pages -> Build and deployment**.

## Citation

Citation metadata is provided in [`CITATION.cff`](CITATION.cff). GitHub will expose a **Cite this repository** control when the file is recognized.

## License

MIT License. See [LICENSE](LICENSE).

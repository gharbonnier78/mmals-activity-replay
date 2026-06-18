# CSV Contract

MMALS Activity Replay supports two complementary trace families.

## 1. Notebook-style checkpoint exports

The viewer identifies files from their columns rather than requiring exact filenames.

| Family | Minimum recognizable fields | Typical role |
|---|---|---|
| Training loss | `task_id`, `epoch`, `task_loss` | Replay optimization checkpoints |
| Routes | one or more `host_0`, `host_1`, ... fields | Display route allocation on the simplex |
| Evaluation history | `after_task`, `task_id`, `acc` | Replay retained-task inference |
| Drift | `route_drift`, `latent_drift`, `output_drift` | Route-function stability audit |
| Newer drift diagnostics | `route_drift_Dr`, `latent_drift_Dz`, `output_drift_Dy` | Compatible alternate naming |

The model identifier may be named `model` or `method`. A `seed` column is recommended.

## 2. Event-level long-format trace

A true activity movie should emit one row per component or exchange event. The reference template is:

[`data/schemas/mmals_event_trace_schema.csv`](../data/schemas/mmals_event_trace_schema.csv)

Core fields include:

- `step`, `wall_time_s`, `mode`, `phase`, and `objective_id`;
- `src_component`, `dst_component`, `direction`, and `signal_type`;
- `exchange_value`, `component_activity`, `host_id`, and `route_weight`;
- `host_gain`, `host_ablation_delta`, and route/function drift fields;
- `regime_prob`, calibration width, latency, active parameters, energy, and CO2e.

## Semantics

- `step` must define a stable global ordering.
- `mode` should be `train` or `inference`.
- `direction` should distinguish forward, backward, memory-read, and memory-write events.
- `regime_prob` must contain the detector's actual output; otherwise omit it.
- Physical energy and CO2e fields must remain separate from entropy or sparsity proxies.
- `objective_id` identifies a real experimental condition, not merely a display preference.

## Local data privacy

CSV files selected through the browser file picker are parsed locally. This static application does not upload them to a server.

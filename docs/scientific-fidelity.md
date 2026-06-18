# Scientific Fidelity Boundaries

The viewer is an observability and audit instrument. It must make the status of each quantity visible.

## Route geometry

A route vector with nonnegative weights summing to one belongs to a probability simplex. The default geometric view therefore uses a simplex. A torus should be used only when the logged state contains independent periodic coordinates or when topology analysis supports that choice.

## Carbon and energy

Routing entropy is a historical MMALS carbon-tax proxy. It is not a physical carbon measurement. Physical claims require an explicit field such as `energy_j`, `energy_kwh`, or `co2e_g` measured with a documented method.

## Phosphorus or mutualistic gain

`gain_mean` and `gain_min` summarize logged mutualistic gain. They do not imply that a per-host causal contribution was measured. Per-host claims require interventions such as host ablation or route swaps.

## Regime change

When no calibrated detector output is present, the viewer may display a clearly labeled change proxy derived from observed transitions. It must not be described as a probability.

## Route checkpoints

The bundled v0.9 traces contain route checkpoints rather than every optimization step. Training animation between checkpoints is interpolation, not direct observation.

## Objective lenses

Changing a display lens changes how evidence is emphasized. It does not recompute the model's route, function, or specialization. Causal objective comparison requires separately logged runs or controlled interventions.

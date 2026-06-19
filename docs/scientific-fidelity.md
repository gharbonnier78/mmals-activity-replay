# Scientific fidelity boundaries

MMALS Activity Replay is an observability and audit interface. It does not convert incomplete telemetry into stronger evidence than the source run provides.

## Route geometry

Route coefficients are nonnegative and normalized to sum to one. The five-host visualization is a documented two-dimensional barycentric projection of a higher-dimensional probability simplex. It is not a claim that the complete route space is planar.

## Checkpoint time

A route observed at a checkpoint is marked `observed`. Any state drawn between checkpoints is `interpolated` and must not be interpreted as a directly logged optimizer event.

## Carbon and resource cost

Routing entropy, active parameter count, latency, energy, and CO2e are distinct quantities. Entropy may be used as a communication or dispersion proxy but is not physical carbon consumption. Physical cost fields require measured or documented estimation procedures and units.

## Gain

An aggregate gain field is not automatically a causal contribution for each host. Per-host causal claims require a declared intervention, such as removal or route ablation, with a documented comparison.

## Regime

A change score is not a probability unless it is produced and calibrated as one. The interface uses neutral wording when calibration is absent.

## Objective lens

A lens changes visual emphasis only. A causal statement that an objective changed the selected route requires separate logged executions or a logged goal vector and decision calculation.

## Compact replay

A compact replay is a selected summary. Its manifest must point back to the source run, and omitted detail must not be interpreted as evidence that no omitted event occurred.

# MMALS Domain Pack Contract v1

A domain pack configures the generic replay player for a particular MMALS research domain. It is not a separate application and must not silently change the scientific meaning of loaded fields.

## Responsibilities

A domain pack may declare:

- required event fields;
- optional metrics;
- accepted aliases for legacy columns;
- available visual lenses;
- domain vocabulary and narrative text;
- scientific warnings;
- panels that may be enabled by a future modular renderer.

A domain pack may not:

- fabricate missing experimental values;
- relabel an uncalibrated score as a probability;
- transform a visual lens into a causal objective change;
- hide provenance labels;
- replace the source run identity.

## v0.2.0 packs

- `core`: generic replay behavior;
- `route-function`: v0.7–v0.9 route/function-memory vocabulary and drift aliases.

Goal-Adaptive Control, CAL, TPUT, Geometry G1, and RC2O remain future packs. They are intentionally not claimed as delivered in v0.2.0.

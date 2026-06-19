# Contributing

## Principles

1. Preserve scientific provenance: observed, derived, and interpolated values must remain distinguishable.
2. Do not label a proxy as a physical measurement or calibrated probability.
3. Keep the core player domain-neutral; domain-specific semantics belong in a domain pack.
4. Maintain legacy CSV compatibility unless a deprecation is documented and tested.
5. Keep GitHub Pages deployable without a backend.

## Validation

Run before opening a pull request:

```bash
python tools/validate_bundle.py examples/compact/replay.compact.json --root .
python -m unittest discover -s tests -v
```

For browser changes, test the compact example, v0.9 compatibility manifest, a local legacy CSV, the full/compact switch, playback, and A-to-B comparison.

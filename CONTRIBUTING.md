# Contributing

Contributions are welcome when they preserve scientific traceability.

## Principles

1. Do not relabel a proxy as a physical or calibrated measurement.
2. Keep hosts, the fungal medium, and mycorrhizal exchange conceptually distinct.
3. Preserve backward compatibility with documented CSV fields when practical.
4. Add a small public example whenever a new trace field or view is introduced.
5. Document whether a visualization is observational, derived, interpolated, or causal.

## Suggested workflow

```bash
git checkout -b feature/short-name
# edit and test
git add .
git commit -m "feat: describe the change"
git push -u origin feature/short-name
```

Open a pull request describing the scientific meaning of the change and the data fields used.

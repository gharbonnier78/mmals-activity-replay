# Release checklist — v0.2.0

## Repository

- [ ] Work starts from tagged `v0.1.1` or current `main` containing the frozen baseline.
- [ ] Existing `data/demo/` CSV files are retained.
- [ ] Existing user-manual PDF and TeX files are retained.
- [ ] Only `.github/workflows/pages.yml` deploys Pages.
- [ ] `README.md`, `CHANGELOG.md`, `CITATION.cff`, application header, and footer show `0.2.0`.

## Automated validation

```bash
python tools/validate_bundle.py bundles/route-function-v09-compat/run_manifest.json --root .
python -m unittest discover -s tests -v
```

The compatibility manifest may warn that checksums are absent, but it must not fail structural validation.

## Browser validation

- [ ] Embedded compact example renders.
- [ ] v0.9 compatibility demo loads from existing CSVs on GitHub Pages.
- [ ] Legacy CSV loader works.
- [ ] Compact JSON loader works.
- [ ] Full and compact modes render the same event values.
- [ ] Play, Step, speed, timeline, and A-to-B comparison work.
- [ ] No causal meaning is attributed to the visual objective lens.
- [ ] Browser console has no uncaught errors.

## Release

- [ ] Merge into `main` after review.
- [ ] Verify GitHub Pages.
- [ ] Create annotated tag `v0.2.0`.
- [ ] Publish GitHub Release.
- [ ] Record SHA-256 for the release archive.

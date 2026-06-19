# Publishing MMALS Activity Replay v0.2.0

1. Apply the overlay to the existing repository root. Do not delete `data/demo/` or the existing manual files under `docs/`.
2. Run:

```bash
python tools/validate_bundle.py examples/compact/replay.compact.json --root .
python tools/validate_bundle.py bundles/route-function-v09-compat/run_manifest.json --root .
python -m unittest discover -s tests -v
```

3. Open the site using a local HTTP server because hosted manifests use `fetch`:

```bash
python -m http.server 8000
```

4. Verify `http://localhost:8000/` and the release checklist.
5. Commit to the v0.2.0 development branch, push, review, then merge into `main`.
6. GitHub Actions validates the contracts before deploying the repository root.
7. Verify the public site before tagging `v0.2.0`.

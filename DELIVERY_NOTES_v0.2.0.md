# Delivery notes — MMALS Activity Replay v0.2.0

This ZIP is an **overlay package**, generated against the public v0.1.1 repository structure. Extract it into the local `mmals-activity-replay` repository root and allow replacement of files listed under **UPDATED / REPLACED** in `MANIFEST.txt`.

Do not start from an empty directory: the overlay intentionally does not duplicate the existing v0.9 CSV evidence, license, 404 page, `.nojekyll`, or compiled user manual.

## Recommended branch

```bash
git checkout main
git pull --ff-only origin main
git checkout -b develop/v0.2.0
```

Then copy the overlay, run the tests, inspect `git diff`, and commit.

## Suggested commit

```text
feat: add Replay Bundle v1 and extensible replay core for v0.2.0

- add versioned run manifests and full/standard/compact profiles
- add hosted, local bundle, compact JSON, and legacy CSV loaders
- add core and route-function domain-pack descriptors
- expose provenance and structural validation in the replay UI
- add schemas, validator, compact builder, tests, and CI checks
- preserve v0.9 public evidence compatibility and scientific boundaries
```

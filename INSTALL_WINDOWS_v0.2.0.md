# Apply v0.2.0 on Windows

The ZIP is an overlay for the existing local repository.

## 1. Prepare the branch

```bat
cd C:\Users\g073038\mmals-activity-replay
git checkout main
git pull --ff-only origin main
git checkout -b develop/v0.2.0
```

## 2. Extract the overlay

Extract the contents of `mmals-activity-replay-v0.2.0-overlay.zip` directly into:

```text
C:\Users\g073038\mmals-activity-replay
```

Allow Windows to replace files with the same names.

Do **not** delete files that are absent from the overlay. In particular, preserve:

```text
data\demo\*.csv
docs\MMALS_Activity_Replay_User_Manual_v0_1.pdf
docs\MMALS_Activity_Replay_User_Manual_v0_1.tex
LICENSE
.nojekyll
404.html
```

## 3. Validate

```bat
python tools\validate_bundle.py examples\compact\replay.compact.json --root .
python tools\validate_bundle.py bundles\route-function-v09-compat\run_manifest.json --root .
python -m unittest discover -s tests -v
```

## 4. Run locally

Do not double-click `index.html` for the hosted manifest test. Start a local server:

```bat
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Check the full list in `docs\release-checklist-v0.2.0.md`.

## 5. Inspect and commit

```bat
git status
git diff --stat
git diff
```

Suggested commit:

```bat
git add -A
git commit -m "feat: add Replay Bundle v1 and extensible replay core for v0.2.0"
git push -u origin develop/v0.2.0
```

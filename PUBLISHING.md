# Publishing to GitHub Pages

Repository name:

```text
mmals-activity-replay
```

Expected public URL:

```text
https://gharbonnier78.github.io/mmals-activity-replay/
```

## 1. Create the repository

Create a new **public** GitHub repository named `mmals-activity-replay`. Do not initialize it with another README, license, or `.gitignore`, because this package already contains them.

## 2. Push this package

From the directory containing this README:

```bash
git init
git branch -M main
git add .
git commit -F COMMIT_MESSAGE.txt
git remote add origin https://github.com/gharbonnier78/mmals-activity-replay.git
git push -u origin main
```

## 3. Enable Pages

In GitHub:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

The included workflow `.github/workflows/pages.yml` deploys the repository root after pushes to `main`.

## 4. Verify

Open the repository's **Actions** tab and wait for `Deploy static site to GitHub Pages` to complete. Then open:

```text
https://gharbonnier78.github.io/mmals-activity-replay/
```

The user manual should be available at:

```text
https://gharbonnier78.github.io/mmals-activity-replay/docs/MMALS_Activity_Replay_User_Manual_v0_1.pdf
```

## 5. Suggested repository metadata

**Description**

```text
Interactive browser-based replay and scientific-audit tool for MMALS route-function activity, specialization, drift, regime changes, mutualistic gain, and cost proxies.
```

**Topics**

```text
continual-learning, scientific-visualization, machine-learning, observability, explainable-ai, modular-learning, github-pages, mmals
```

**Website**

```text
https://gharbonnier78.github.io/mmals-activity-replay/
```

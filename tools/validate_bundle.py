#!/usr/bin/env python3
"""Dependency-free structural validator for MMALS Replay Bundle v1."""
from __future__ import annotations
import argparse
import csv
import json
import math
from pathlib import Path
from typing import Any

REQUIRED = ("schema_version", "bundle_profile", "run_id", "project", "experiment", "domain_pack", "source")
PROFILES = {"full", "standard", "compact"}
FORMATS = {"csv", "json", "jsonl"}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate_manifest(manifest: dict[str, Any], manifest_path: Path, root: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    for field in REQUIRED:
        if field not in manifest:
            errors.append(f"missing required manifest field: {field}")
    if manifest.get("schema_version") != "mmals-replay-bundle-v1":
        errors.append("schema_version must be mmals-replay-bundle-v1")
    if manifest.get("bundle_profile") not in PROFILES:
        errors.append(f"bundle_profile must be one of {sorted(PROFILES)}")
    source = manifest.get("source", {})
    if not isinstance(source, dict) or not source.get("repository"):
        errors.append("source.repository is required")
    if not source.get("commit"):
        warnings.append("source.commit is not supplied")
    if not manifest.get("checksums"):
        warnings.append("no checksums declared")

    for spec in manifest.get("files", []):
        if not isinstance(spec, dict):
            errors.append("each files entry must be an object")
            continue
        for field in ("role", "path", "format"):
            if field not in spec:
                errors.append(f"file entry missing {field}: {spec}")
        if spec.get("format") not in FORMATS:
            errors.append(f"unsupported file format: {spec.get('format')}")
        candidate = (manifest_path.parent / str(spec.get("path", ""))).resolve()
        if not candidate.exists():
            alt = (root / str(spec.get("path", ""))).resolve()
            candidate = alt if alt.exists() else candidate
        if spec.get("required", True) and not candidate.exists():
            errors.append(f"required file does not exist: {spec.get('path')}")
    return errors, warnings


def validate_compact(path: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    payload = load_json(path)
    if not isinstance(payload, dict) or "manifest" not in payload or "events" not in payload:
        return ["compact replay requires manifest and events"], warnings
    manifest = payload["manifest"]
    for field in REQUIRED:
        if field not in manifest:
            errors.append(f"compact manifest missing {field}")
    previous = -math.inf
    for index, event in enumerate(payload["events"]):
        if "step" not in event or "route" not in event:
            errors.append(f"event {index} requires step and route")
            continue
        step = float(event["step"])
        if step < previous:
            warnings.append(f"event {index} is out of order")
        previous = step
        route = [float(value) for value in event["route"]]
        if any(value < 0 for value in route):
            errors.append(f"event {index} has negative route weight")
        if not math.isclose(sum(route), 1.0, rel_tol=1e-6, abs_tol=1e-6):
            errors.append(f"event {index} route sums to {sum(route):.8f}")
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    path = args.path.resolve()
    if not path.exists():
        print(f"ERROR: not found: {path}")
        return 2
    if path.name.endswith("compact.json"):
        errors, warnings = validate_compact(path)
    else:
        manifest = load_json(path)
        errors, warnings = validate_manifest(manifest, path, args.root.resolve())
    for item in warnings:
        print(f"WARNING: {item}")
    for item in errors:
        print(f"ERROR: {item}")
    if errors:
        return 1
    print("OK: replay contract validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

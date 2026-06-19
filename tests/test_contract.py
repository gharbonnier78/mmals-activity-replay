from __future__ import annotations
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("validate_bundle", ROOT / "tools" / "validate_bundle.py")
MOD = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MOD)


class ReplayContractTests(unittest.TestCase):
    def test_compact_example(self):
        path = ROOT / "examples" / "compact" / "replay.compact.json"
        errors, warnings = MOD.validate_compact(path)
        self.assertEqual(errors, [])

    def test_manifest_structure(self):
        path = ROOT / "bundles" / "route-function-v09-compat" / "run_manifest.json"
        manifest = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(manifest["schema_version"], "mmals-replay-bundle-v1")
        self.assertEqual(manifest["bundle_profile"], "standard")
        self.assertEqual(manifest["domain_pack"], "route-function")

    def test_routes_sum_to_one(self):
        payload = json.loads((ROOT / "examples" / "compact" / "replay.compact.json").read_text(encoding="utf-8"))
        for event in payload["events"]:
            self.assertAlmostEqual(sum(event["route"]), 1.0, places=7)
            self.assertTrue(all(value >= 0 for value in event["route"]))

    def test_version_strings(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        citation = (ROOT / "CITATION.cff").read_text(encoding="utf-8")
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        for text in (readme, changelog, citation, index):
            self.assertIn("0.2.0", text)


if __name__ == "__main__":
    unittest.main()

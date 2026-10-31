"""Research-website profile using game-artist's real file/hash/PNG validator.

Pass the installed skill checker explicitly; no machine-private paths are stored.
Unlike a game engine screen, a desktop research document permits reading scroll.
Never rewrite actual measurements or pretend the browser is a different engine.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--root', required=True)
parser.add_argument('--skill-checker', required=True)
args = parser.parse_args()
root = Path(args.root).resolve(strict=True)
spec = importlib.util.spec_from_file_location('game_artist_evidence', args.skill_checker)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
checker = module.Checker(root)
base = root / 'docs/game-artist'
contract_bytes = (base / 'visual-contract.json').read_bytes()
contract = json.loads(contract_bytes)
evidence = json.loads((base / 'visual-evidence.json').read_text(encoding='utf8'))
checker.check(contract.get('profile') == evidence.get('profile') == 'research-website', 'profile', 'expected research-website')
checker.check(evidence.get('contract_sha256') == hashlib.sha256(contract_bytes).hexdigest(), 'contract', 'hash mismatch')
checker.check(evidence.get('visual_review_status') == 'passed', 'inspection', 'current runtime images must be reviewed')
checker.file(evidence.get('inspection'), 'inspection')
assets = {a['id']: a for a in contract['assets']}
manifest = json.loads((base / 'assets.json').read_text(encoding='utf8'))
checker.check(len(assets) == len(contract['assets']) and set(assets) == {a['id'] for a in manifest['assets']}, 'assets', 'expected every registered asset without duplicate IDs')
for asset in assets.values():
    checker.file({'path': asset['path'], 'sha256': asset['sha256']}, 'asset.' + asset['id'])
    checker.check(bool(asset.get('runtime_binding')), asset['id'], 'missing runtime binding')
views = {v['id']: v for v in evidence['views']}
checker.check(set(views) == {v['id'] for v in contract['required_views']}, 'views', 'required views missing or duplicated')
targets = set()
for view in contract['required_views']:
    label = view['id']
    target_hash, _ = checker.file(view['target'], label + '.target', png=True)
    targets.add(target_hash)
for expected in contract['required_views']:
    view = views.get(expected['id'])
    if not view:
        continue
    label = view['id']
    capture_hash, size = checker.file(view['capture'], label + '.capture', png=True)
    checker.check(capture_hash not in targets, label, 'runtime capture duplicates a target')
    viewport = expected['viewport']
    checker.check(size == (viewport['width'], viewport['height']), label, 'capture does not match viewport')
    checker.check(view['build_id'] == evidence['build_id'], label, 'stale build')
    checker.check(view['runtime_origin']['kind'] == 'browser_runtime', label, 'must preserve true browser origin')
    checker.check(bool(view['runtime_origin']['steps']), label, 'missing reproduction steps')
    checker.check(view['status'] == 200 and view['errors'] == [], label, 'route or runtime error')
    checker.check(set(expected['required_assets']).issubset(view['visible_asset_ids']), label, 'required scene art missing')
    layout = view['layout_measurements']
    checker.check(layout['root_scroll_extent'][0] == 0, label, 'horizontal document overflow')
    if expected['platform'] == 'phone':
        checker.check(layout['root_scroll_extent'] == [0, 0], label, 'phone task page scrolls')
        checker.check(layout['fullscreen_nested_scroll'] is False, label, 'phone task uses fullscreen nested scroll')
checks = evidence['assetChecks']
checker.check({c['id'] for c in checks} == set(assets), 'served assets', 'incomplete served-asset checks')
for item in checks:
    checker.check(item['status'] == 200 and item['hashMatches'], item['id'], 'served bytes differ from reviewed asset')
report = {'profile': 'research-website', 'buildId': evidence['build_id'], 'views': len(views), 'assets': len(assets), 'errors': checker.errors}
(base / 'evidence-check.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8', newline='\n')
print(json.dumps(report, ensure_ascii=False))
raise SystemExit(1 if checker.errors else 0)

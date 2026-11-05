"""Check manifest-listed practice forms and readable fallbacks under script failures.

Models and non-form controls still require their subject-specific browser checks.
Use synthetic responses only; this does not assess private-source separation.
"""
import argparse, functools, hashlib, json, os, tempfile, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
parser.add_argument('--output', type=Path)
parser.add_argument('--browser', default=os.environ.get('LESSON_BROWSER'))
parser.add_argument('--base-url', help='Optional deployed library root, after check-live.py verifies its bytes')
args = parser.parse_args()
repo = args.repo.resolve()
output = args.output.resolve() if args.output else Path(tempfile.mkdtemp(prefix='lesson-practice-')).resolve()
if output.is_relative_to(repo):
    parser.error('Evidence must be outside the candidate')
output.mkdir(parents=True, exist_ok=True)
lessons = json.loads((repo/'lessons.json').read_text(encoding='utf-8'))['lessons']
selected = {'lessons.json', 'subjects.json', 'index.html', 'scripts/check-practice-browser.py'}
for lesson in lessons:
    selected.add('lessons/' + lesson['file'])
    selected.update(lesson['review'].get('dependencies', {}))
    selected.update(lesson['review'].get('contract', {}))
for name in selected:
    if '\\' in name or any(part in ('', '.', '..') for part in name.split('/')) or not (repo/name).resolve().is_relative_to(repo):
        parser.error('Unsafe manifest path: ' + name)
def inventory():
    return {name: hashlib.sha256((repo/name).read_bytes()).hexdigest() for name in sorted(selected)}
before = inventory()
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = thread = None
if args.base_url:
    address = urlparse(args.base_url)
    if address.scheme not in ('http', 'https') or not address.hostname or address.query or address.fragment:
        parser.error('base-url must be an HTTP(S) library root without query or fragment')
    base = args.base_url.rstrip('/') + '/'
else:
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(repo)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}/'
results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.browser, headless=True)
        try:
            for lesson in lessons:
                scripts = sorted(path for path in lesson['review']['dependencies'] if path.endswith('.js'))
                for mode in ['active', 'no-js', *scripts]:
                    context = browser.new_context(java_script_enabled=mode != 'no-js', reduced_motion='reduce')
                    page = context.new_page()
                    page.set_default_timeout(4000)
                    requests, errors = [], []
                    page.on('request', lambda r: requests.append({'url': r.url, 'body': r.post_data or ''}))
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    if mode not in ('active', 'no-js'):
                        page.route('**/' + mode + '*', lambda route: route.abort())
                    url = base + 'lessons/' + lesson['file']
                    page.goto(url, wait_until='networkidle')
                    assert not errors, (lesson['file'], mode, errors)
                    page.evaluate("() => document.querySelectorAll('details').forEach(d => { d.removeAttribute('name'); d.open = true; })")
                    form_results = []
                    for form in page.locator('form').all():
                        numeric = form.get_attribute('data-practice') is not None
                        submit = form.locator('button[type="submit"]')
                        assert submit.count() == 1
                        disabled = submit.is_disabled()
                        if not numeric and not form.locator('input[type="radio"]').count():
                            raise AssertionError((lesson['file'], 'Unsupported form: add an explicit subject-specific check'))
                        if mode == 'active':
                            assert not disabled, (lesson['file'], 'Practice unavailable with all scripts loaded')
                        if mode == 'no-js':
                            assert disabled, (lesson['file'], 'Native submit available without scripts')
                        if disabled:
                            fallback = form.locator('xpath=following-sibling::*[1][self::details]')
                            assert fallback.count() and fallback.is_visible(), (lesson['file'], mode, 'missing visible fallback')
                            assert fallback.inner_text().strip(), 'Empty fallback'
                        # Expose failed controls only for a synthetic native-submission diagnostic.
                        form.evaluate('f => { f.hidden = false; }')
                        for reflection in form.locator('textarea').all():
                            reflection.fill('Synthetic reasoning probe; no learner response.')
                        requests.clear()
                        if numeric:
                            control = form.locator('input[type="number"]')
                            control.fill('12345')
                            control.press('Enter')
                            if not disabled:
                                expect(form.locator('[data-feedback]')).not_to_have_text('')
                                control.fill(form.get_attribute('data-expected'))
                                control.press('Enter')
                                expect(form.locator('[data-feedback]')).to_have_text(form.get_attribute('data-success'))
                        else:
                            radio = form.locator('input[type="radio"]').first
                            if radio.is_enabled():
                                radio.check()
                                radio.press('Enter') if disabled else submit.click()
                            else:
                                assert disabled, 'Enabled submit with unavailable answer control'
                            if not disabled:
                                expect(form.locator('[role="status"]')).not_to_have_text('')
                        assert page.url == url, (lesson['file'], mode, 'response navigation')
                        assert not requests, (lesson['file'], mode, 'response request', requests)
                        form_results.append({'numeric': numeric, 'disabled': disabled, 'feedback_or_fallback': True})
                    state = page.evaluate("async()=>({local:localStorage.length,session:sessionStorage.length,caches:(await caches.keys()).length,databases:(await indexedDB.databases()).length,cookie:document.cookie})")
                    assert state == {'local': 0, 'session': 0, 'caches': 0, 'databases': 0, 'cookie': ''}, state
                    results.append({'lesson': lesson['file'], 'mode': mode, 'forms': form_results, 'passed': True})
                    context.close()
        finally:
            browser.close()
finally:
    if server:
        server.shutdown(); server.server_close(); thread.join()
after = inventory()
assert before == after, 'Candidate changed during checks'
(output/'results.json').write_text(json.dumps({'results': results, 'reviewed_input_hashes': before, 'reduced_motion': True, 'scope': 'Manifest-listed form feedback, adjacent details fallback and response privacy. Models, non-form controls and animation need subject-specific checks. This is not a whole-archive receipt.', 'passed': True}, indent=2), encoding='utf-8')
print(json.dumps({'page_mode_cases': len(results), 'form_cases': sum(len(r['forms']) for r in results), 'reviewed_inputs': len(before), 'evidence': str(output), 'passed': True}))

"""Verify reviewed public bytes and keyboard library navigation after deployment."""
import argparse
import hashlib
import json
import os
import re
from pathlib import Path
from urllib.parse import quote, urljoin, urlparse

from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', required=True, help='Verified authorized library root URL')
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--browser', default=os.environ.get('LESSON_BROWSER'),
                        help='Optional installed Chromium-compatible browser executable')
    args = parser.parse_args()
    base = args.base_url.rstrip('/') + '/'
    parsed = urlparse(base)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.query or parsed.fragment:
        parser.error('base-url must be an HTTP(S) library root without a query or fragment')
    repo = args.repo.resolve()
    manifest = json.loads((repo / 'lessons.json').read_text(encoding='utf-8'))
    subjects = json.loads((repo / 'subjects.json').read_text(encoding='utf-8'))
    expected = {}

    def add(path, digest):
        target = (repo / path).resolve()
        if not target.is_relative_to(repo) or path.startswith('/') or '\\' in path:
            raise ValueError(f'Unsafe publication path: {path}')
        actual = hashlib.sha256(target.read_bytes()).hexdigest()
        if actual != digest:
            raise ValueError(f'Local reviewed bytes changed: {path}')
        if path in expected and expected[path] != digest:
            raise ValueError(f'Conflicting reviewed hashes: {path}')
        expected[path] = digest

    add('index.html', hashlib.sha256((repo / 'index.html').read_bytes()).hexdigest())
    for lesson in manifest['lessons']:
        add('lessons/' + lesson['file'], lesson['review']['sha256'])
        for path, digest in lesson['review'].get('dependencies', {}).items():
            add(path, digest)

    with sync_playwright() as p:
        options = {'headless': True}
        if args.browser:
            options['executable_path'] = args.browser
        browser = p.chromium.launch(**options)
        try:
            page = browser.new_page(viewport={'width': 1280, 'height': 900})
            for path, digest in expected.items():
                response = page.request.get(urljoin(base, quote(path, safe='/')))
                if response.status != 200 or hashlib.sha256(response.body()).hexdigest() != digest:
                    raise AssertionError(f'Published bytes do not match reviewed bytes: {path} (HTTP {response.status})')
            for lesson in manifest['lessons']:
                response = page.goto(urljoin(base, 'lessons/' + quote(lesson['file'])), wait_until='networkidle')
                if response is None or response.status != 200:
                    raise AssertionError(f'Lesson did not load: {lesson["file"]}')
                link = page.get_by_role('link', name=re.compile(r'\bLesson library\b', re.I)).first
                if not link.is_visible():
                    raise AssertionError(f'Library link is not visible: {lesson["file"]}')
                link.focus()
                page.keyboard.press('Enter')
                page.wait_for_url(urljoin(base, 'index.html'))
                if page.locator('.lesson-link').count() != len(manifest['lessons']):
                    raise AssertionError('Published library has the wrong lesson count')
            nav = page.get_by_role('navigation', name='Lesson subjects')
            for subject in subjects:
                nav.get_by_role('link', name=subject['label'], exact=True).click()
                if not page.url.endswith('#subject-' + subject['id']):
                    raise AssertionError(f'Subject navigation failed: {subject["id"]}')
        finally:
            browser.close()
    print(json.dumps({'verified_public_files': len(expected),
                      'keyboard_library_returns': len(manifest['lessons']),
                      'subject_links': len(subjects), 'passed': True}))


if __name__ == '__main__':
    main()

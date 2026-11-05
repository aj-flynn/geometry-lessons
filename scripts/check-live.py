"""Verify reviewed public bytes and library and reference navigation after deployment."""
import argparse
import hashlib
import json
import os
import re
from pathlib import Path
from urllib.parse import quote, unquote, urldefrag, urljoin, urlparse

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, sync_playwright


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def reviewed_files(repo, manifest, publication=None):
    expected = {}

    def add(path, digest):
        target = (repo / path).resolve()
        if not target.is_relative_to(repo) or any(part in ('', '.', '..') for part in path.split('/')) or '\\' in path:
            raise ValueError(f'Unsafe publication path: {path}')
        if digest is None:
            digest = sha256(target.read_bytes())
        if path in expected:
            if expected[path] != digest:
                raise ValueError(f'Conflicting reviewed hashes: {path}')
        else:
            if sha256(target.read_bytes()) != digest:
                raise ValueError(f'Local reviewed bytes changed: {path}')
            expected[path] = digest

    for path in ('index.html', 'lessons.json', 'subjects.json'):
        add(path, sha256((repo / path).read_bytes()))
    for subject in json.loads((repo / 'subjects.json').read_text(encoding='utf-8')):
        if subject.get('skill'):
            add(subject['skill'], None)
    for lesson in manifest['lessons']:
        add('lessons/' + lesson['file'], lesson['review']['sha256'])
        for path, digest in lesson['review'].get('dependencies', {}).items():
            add(path, digest)
        for path, digest in lesson['review'].get('contract', {}).items():
            add(path, digest)
    if publication is not None:
        files = publication.get('files')
        if publication.get('version') != 1 or publication.get('kind') != 'publication-envelope' or not isinstance(files, dict):
            raise ValueError('Expected a private publication envelope from review-candidate.mjs verify')
        tree = sha256(json.dumps(files, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))
        if tree != publication.get('treeSha256') or not set(expected).issubset(files):
            raise ValueError('Publication envelope identity or required file membership is invalid')
        for path, entry in files.items():
            add(path, entry['sha256'])
            if (repo / path).stat().st_size != entry['bytes']:
                raise ValueError(f'Local publication size changed: {path}')
    return expected


def load_page(page, url):
    same_document = urldefrag(page.url).url == url
    response = page.goto(url)
    loaded = same_document if response is None else response.status == 200
    if not loaded or page.url != url:
        raise AssertionError(f'Expected document did not load: {url}')


def assert_fragment(page, url):
    fragment = unquote(urlparse(url).fragment)
    if fragment and not page.evaluate('(id) => Boolean(document.getElementById(id))', fragment):
        raise AssertionError(f'Navigation fragment does not exist: {url}')


def verify_reference_links(page, base, lesson_urls, reference_urls, index_url):
    # Use only indexed lessons and HTML references named in their reviewed dependency maps.
    known_pages = set(lesson_urls) | set(reference_urls) | {index_url, base}
    count = 0
    for source in [*lesson_urls, *reference_urls]:
        load_page(page, source)
        anchors = page.locator('a[href]')
        for position, target in enumerate(anchors.evaluate_all('(links) => links.map(link => link.href)')):
            parsed = urlparse(target)
            document = parsed._replace(query='', fragment='').geturl()
            if document not in reference_urls and not (source in reference_urls and document.startswith(base)):
                continue
            if document not in known_pages:
                raise AssertionError(f'Reference link is outside reviewed pages: {source} -> {target}')
            if page.url != source:
                load_page(page, source)
            anchor = anchors.nth(position)
            try:
                anchor.focus()
                if not anchor.is_visible():
                    raise AssertionError(f'Reference link is not visible: {source} -> {target}')
                if urldefrag(target).url != source:
                    with page.expect_response(lambda response: response.request.is_navigation_request()
                                              and response.frame == page.main_frame) as navigation:
                        page.keyboard.press('Enter')
                    if navigation.value.status != 200:
                        raise AssertionError(f'Reference destination did not load: {source} -> {target}')
                else:
                    page.keyboard.press('Enter')
                page.wait_for_url(target)
            except PlaywrightTimeoutError as error:
                raise AssertionError(f'Reference link did not navigate: {source} -> {target}') from error
            assert_fragment(page, target)
            count += 1
    return count


def verify_publication(page, base, manifest, subjects, expected):
    urls = {path: urljoin(base, quote(path, safe='/')) for path in expected}
    for path, digest in expected.items():
        response = page.request.get(urls[path], max_redirects=0)
        if response.status != 200 or sha256(response.body()) != digest:
            raise AssertionError(f'Published bytes do not match reviewed bytes: {path} (HTTP {response.status})')

    index_url = urls['index.html']
    lesson_urls = [urls['lessons/' + lesson['file']] for lesson in manifest['lessons']]
    load_page(page, index_url)
    if page.locator('.lesson-link').count() != len(lesson_urls):
        raise AssertionError('Published library has the wrong lesson count')
    nav = page.get_by_role('navigation', name='Lesson subjects')
    for subject in subjects:
        nav.get_by_role('link', name=subject['label'], exact=True).click()
        target = index_url + '#subject-' + subject['id']
        if page.url != target:
            raise AssertionError(f'Subject navigation failed: {subject["id"]}')
        assert_fragment(page, target)

    for url in lesson_urls:
        load_page(page, url)
        link = page.get_by_role('link', name=re.compile(r'\bLesson library\b', re.I)).first
        if not link.is_visible():
            raise AssertionError(f'Library link is not visible: {url}')
        link.focus()
        page.keyboard.press('Enter')
        page.wait_for_url(index_url)
        if page.locator('.lesson-link').count() != len(lesson_urls):
            raise AssertionError('Library return did not reach the lesson shelf')

    reference_urls = [url for path, url in urls.items() if path.startswith('reference/') and path.endswith('.html')]
    reference_links = verify_reference_links(page, base, lesson_urls, reference_urls, index_url) if reference_urls else 0
    return {'verified_public_files': len(expected), 'keyboard_library_returns': len(lesson_urls),
            'subject_links': len(subjects), 'reference_links': reference_links, 'passed': True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', required=True, help='Verified authorized library root URL')
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--browser', default=os.environ.get('LESSON_BROWSER'),
                        help='Optional installed Chromium-compatible browser executable')
    parser.add_argument('--publication-envelope', type=Path,
                        help='Private verified envelope to check every selected public file, including review reports and licenses')
    args = parser.parse_args()
    parsed = urlparse(args.base_url)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.query or parsed.fragment:
        parser.error('base-url must be an HTTP(S) library root without a query or fragment')
    base = args.base_url.rstrip('/') + '/'
    repo = args.repo.resolve()
    manifest = json.loads((repo / 'lessons.json').read_text(encoding='utf-8'))
    subjects = json.loads((repo / 'subjects.json').read_text(encoding='utf-8'))
    publication = json.loads(args.publication_envelope.read_text(encoding='utf-8')) if args.publication_envelope else None
    expected = reviewed_files(repo, manifest, publication)

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.browser, headless=True)
        try:
            page = browser.new_page(viewport={'width': 1280, 'height': 900})
            result = verify_publication(page, base, manifest, subjects, expected)
        finally:
            browser.close()
    print(json.dumps(result))


if __name__ == '__main__':
    main()

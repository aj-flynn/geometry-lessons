"""Browser checks against a synthetic local publication with no learner material."""
import importlib.util
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import tempfile
from threading import Thread
import unittest

try:
    from playwright.sync_api import sync_playwright
except ModuleNotFoundError as error:
    if error.name != 'playwright':
        raise
    raise unittest.SkipTest('Install Python Playwright to run the live-browser fixtures') from error

script = Path(__file__).resolve().parents[1] / 'scripts/check-live.py'
spec = importlib.util.spec_from_file_location('check_live', script)
check_live = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check_live)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class LivePublicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        playwright = sync_playwright().start()
        cls.addClassCleanup(playwright.stop)
        browser_path = os.environ.get('LESSON_BROWSER')
        if not browser_path and not Path(playwright.chromium.executable_path).is_file():
            raise unittest.SkipTest('Install Playwright Chromium or set LESSON_BROWSER')
        cls.browser = playwright.chromium.launch(executable_path=browser_path, headless=True)
        cls.addClassCleanup(cls.browser.close)

    def setUp(self):
        temp = tempfile.TemporaryDirectory(prefix='geometry-live-', dir=os.environ.get('GEOMETRY_QA_TEMP'))
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name).resolve()
        self.repo = self.root / 'candidate'
        self.deployed = self.root / 'served' / 'library'
        handler = partial(QuietHandler, directory=self.deployed.parent)
        server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
        self.addCleanup(server.server_close)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(thread.join)
        self.addCleanup(server.shutdown)
        self.base = f'http://127.0.0.1:{server.server_port}/library/'
        self.page = self.browser.new_page()
        self.page.set_default_timeout(2000)
        self.addCleanup(self.page.close)
        self.subjects = [{'label': 'Geometry', 'id': 'geometry'}]
        self.manifest = {'lessons': []}
        self.index = ('<!doctype html><nav aria-label="Lesson subjects">'
                      '<a href="#subject-geometry">Geometry</a></nav>'
                      '<h1 id="subject-geometry">Geometry</h1>')
        self.publish('index.html', self.index)
        self.publish_metadata()

    def publish_metadata(self):
        self.publish('lessons.json', json.dumps(self.manifest))
        self.publish('subjects.json', json.dumps(self.subjects))

    def publish(self, name, html):
        data = html.encode('utf-8')
        for root in (self.repo, self.deployed):
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        return check_live.sha256(data)

    def setup_reference(self, lesson_script=''):
        self.publish('index.html', self.index + '<a class="lesson-link" href="lessons/0001-example.html">Example</a>')
        lesson = self.publish('lessons/0001-example.html', '<!doctype html><a href="../index.html">Lesson library</a>'
                              '<a id="guide" href="../reference/guide.html?mode=print#topic">Guide</a>'
                              '<h1 id="method">Example</h1>' + lesson_script)
        guide = self.publish('reference/guide.html', '<!doctype html><a href="#topic">Skip to the topic</a>'
                             '<h1 id="topic">Guide</h1><a href="../lessons/0001-example.html#method">Example</a>'
                             '<a href="https://example.invalid/resource">External reading</a>')
        self.manifest['lessons'].append({'file': '0001-example.html', 'review': {
            'sha256': lesson, 'dependencies': {'reference/guide.html': guide}
        }})
        self.publish_metadata()

    def verify(self):
        expected = check_live.reviewed_files(self.repo, self.manifest)
        return check_live.verify_publication(self.page, self.base, self.manifest, self.subjects, expected)

    def test_empty_library_loads_index_and_activates_subject_link(self):
        self.assertEqual(self.verify()['subject_links'], 1)
        self.assertEqual(self.page.url, self.base + 'index.html#subject-geometry')

    def test_reference_navigation_activates_lesson_guide_and_fragment_links(self):
        self.setup_reference()
        result = self.verify()
        self.assertEqual(result['reference_links'], 3)
        self.assertEqual(result['keyboard_library_returns'], 1)
        self.assertEqual(self.page.url, self.base + 'lessons/0001-example.html#method')

    def test_reference_click_must_navigate_even_when_reviewed_bytes_match(self):
        self.setup_reference("<script>document.querySelector('#guide').addEventListener('click', e => e.preventDefault())</script>")
        with self.assertRaisesRegex(AssertionError, 'Reference link did not navigate'):
            self.verify()

    def test_deployed_reference_with_mismatched_hash_fails_before_navigation(self):
        self.setup_reference()
        (self.deployed / 'reference/guide.html').write_text('<h1>Different guide</h1>', encoding='utf-8')
        with self.assertRaisesRegex(AssertionError, 'Published bytes do not match reviewed bytes: reference/guide.html'):
            self.verify()
        self.assertEqual(self.page.url, 'about:blank')

    def test_deployed_skill_must_match_reviewed_contract(self):
        self.setup_reference()
        skill = '.agents/skills/example/SKILL.md'
        digest = self.publish(skill, '# Synthetic teaching contract\n')
        self.manifest['lessons'][0]['review']['contract'] = {skill: digest}
        self.publish_metadata()
        self.assertTrue(self.verify()['passed'])
        (self.deployed / skill).write_text('# Older teaching contract\n', encoding='utf-8')
        with self.assertRaisesRegex(AssertionError, 'Published bytes do not match reviewed bytes: .agents/'):
            self.verify()

    def test_deployed_manifest_and_registry_must_match(self):
        for name in ('lessons.json', 'subjects.json'):
            with self.subTest(path=name):
                (self.deployed / name).write_text('{}', encoding='utf-8')
                with self.assertRaisesRegex(AssertionError, 'Published bytes do not match reviewed bytes: ' + name):
                    self.verify()
                (self.deployed / name).write_bytes((self.repo / name).read_bytes())

    def test_registered_skill_without_lessons_is_verified(self):
        skill = '.agents/skills/geometry/SKILL.md'
        self.subjects[0]['skill'] = skill
        self.publish(skill, '# Synthetic subject contract\n')
        self.publish_metadata()
        self.assertTrue(self.verify()['passed'])
        (self.deployed / skill).write_text('# Stale contract\n', encoding='utf-8')
        with self.assertRaisesRegex(AssertionError, 'Published bytes do not match reviewed bytes: .agents/'):
            self.verify()

    def test_publication_envelope_verifies_ancillary_files_and_identity(self):
        self.publish('LICENSE', 'Synthetic license fixture\n')
        self.publish('docs/record.md', 'Synthetic reviewed record\n')
        files = {p.relative_to(self.repo).as_posix(): {'bytes': p.stat().st_size, 'sha256': check_live.sha256(p.read_bytes())}
                 for p in sorted(self.repo.rglob('*')) if p.is_file()}
        envelope = {'version': 1, 'kind': 'publication-envelope', 'files': files,
                    'treeSha256': check_live.sha256(json.dumps(files, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))}
        expected = check_live.reviewed_files(self.repo, self.manifest, envelope)
        self.assertTrue(check_live.verify_publication(self.page, self.base, self.manifest, self.subjects, expected)['passed'])
        (self.deployed / 'docs/record.md').write_text('Stale record', encoding='utf-8')
        with self.assertRaisesRegex(AssertionError, 'Published bytes do not match reviewed bytes: docs/record.md'):
            check_live.verify_publication(self.page, self.base, self.manifest, self.subjects, expected)
        envelope['treeSha256'] = '0' * 64
        with self.assertRaisesRegex(ValueError, 'envelope identity'):
            check_live.reviewed_files(self.repo, self.manifest, envelope)

    def test_shared_print_keeps_closed_nested_explanations_readable(self):
        self.publish('assets/site.css', (script.parents[1] / 'assets/site.css').read_text(encoding='utf-8'))
        self.publish('print.html', '<!doctype html><link rel="stylesheet" href="assets/site.css">'
                     '<main class="lesson"><details><summary>Compare your reasoning</summary>'
                     '<p id="reason">A readable static explanation.</p><details><summary>Retry</summary>'
                     '<p id="retry">A fresh retry comparison.</p></details></details></main>')
        self.page.goto(self.base + 'print.html')
        self.assertFalse(self.page.locator('#reason').is_visible())
        self.assertFalse(self.page.locator('#retry').is_visible())
        self.page.emulate_media(media='print')
        self.assertTrue(self.page.locator('#reason').is_visible())
        self.assertTrue(self.page.locator('#retry').is_visible())
        self.assertEqual(self.page.locator('details[open]').count(), 0)
        self.page.emulate_media(media='screen')
        self.assertFalse(self.page.locator('#reason').is_visible())

    def test_geometry_preserves_unready_component_comparisons(self):
        for name in ('lesson.js', 'similarity.js', 'similarity-model.js'):
            self.publish('assets/' + name, (script.parents[1] / 'assets' / name).read_text(encoding='utf-8'))
        self.publish('components.html', '''<!doctype html><script type="module" src="assets/similarity.js"></script>
          <section data-similarity-explorer><p id="static-explorer">Static diagram explanation remains.</p></section>
          <form id="broken" data-practice data-interactive-only hidden><input type="number"><button type="submit" disabled>Check</button></form>
          <details id="broken-fallback" data-static-only><summary>Compare</summary><p>Static reasoning remains.</p></details>
          <form id="bad-expected" data-practice data-expected="unknown" data-interactive-only hidden><input type="number"><button type="submit" disabled>Check</button><p data-feedback></p></form>
          <details id="bad-expected-fallback" data-static-only><summary>Compare</summary><p>Authored comparison remains.</p></details>
          <form id="working" data-practice data-expected="6" data-success="Reasoning checked." data-interactive-only hidden><input type="number"><button type="submit" disabled>Check</button><p data-feedback></p></form>
          <details id="working-fallback" data-static-only><summary>Compare</summary><p>Static reasoning.</p></details>
          <div id="bad-choice" data-choice-quiz><div data-interactive-only hidden><button data-choice="a" type="button">A</button></div><details data-static-only><summary>Compare</summary><p>Choice reasoning remains.</p></details></div>
          <div id="good-choice" data-choice-quiz data-correct="a" data-success="Choice checked."><div data-interactive-only hidden><button data-choice="a" type="button">A</button></div><p data-choice-feedback></p><details data-static-only><summary>Compare</summary><p>Choice reasoning.</p></details></div>''')
        self.page.goto(self.base + 'components.html', wait_until='networkidle')
        self.assertFalse(self.page.locator('#broken').is_visible())
        self.assertTrue(self.page.locator('#broken button').is_disabled())
        self.assertTrue(self.page.locator('#broken-fallback').is_visible())
        self.assertTrue(self.page.locator('#static-explorer').is_visible())
        self.assertTrue(self.page.locator('#bad-expected button').is_disabled())
        self.assertTrue(self.page.locator('#bad-expected-fallback').is_visible())
        self.assertFalse(self.page.locator('#bad-expected').is_visible())
        self.assertTrue(self.page.locator('#working').is_visible())
        self.assertFalse(self.page.locator('#working-fallback').is_visible())
        self.page.locator('#working input').fill('6')
        self.page.locator('#working input').press('Enter')
        self.assertEqual(self.page.locator('#working [data-feedback]').inner_text(), 'Reasoning checked.')
        self.assertFalse(self.page.locator('#bad-choice button').is_visible())
        self.assertTrue(self.page.locator('#bad-choice details').is_visible())
        self.page.locator('#good-choice button').click()
        self.assertEqual(self.page.locator('#good-choice [data-choice-feedback]').inner_text(), 'Choice checked.')
        self.assertFalse(self.page.locator('#good-choice details').is_visible())


class ChemistrySelectionTests(unittest.TestCase):
    """Selection fixtures contain only synthetic public markup, never learner material."""

    @classmethod
    def setUpClass(cls):
        helper = script.parent / 'check-chemistry-browser.py'
        spec = importlib.util.spec_from_file_location('check_chemistry_browser', helper)
        cls.helper = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.helper)

    def setUp(self):
        temp = tempfile.TemporaryDirectory(prefix='chemistry-selection-', dir=os.environ.get('GEOMETRY_QA_TEMP'))
        self.addCleanup(temp.cleanup)
        self.repo = Path(temp.name).resolve()
        registry = [{'id': subject, 'label': subject.title(),
                     'skill': f'.agents/skills/{subject}-teach/SKILL.md'}
                    for subject in ('chemistry', 'science')]
        self.write('subjects.json', json.dumps(registry))
        self.manifest = {'version': 2, 'lessons': [self.lesson('0042-new-topic.html', 'Chemistry'),
                                                 self.lesson('0003-other-topic.html', 'Science')]}
        self.write('lessons/0042-new-topic.html', '<h1>New topic</h1><a href="../reference/first.html">Guide</a>')
        self.write('lessons/0003-other-topic.html', '<h1>Different subject</h1>')
        self.write('lessons/0004-unlisted-topic.html', '<h1>Not registered</h1>')
        self.write('reference/first.html', '<h1>Guide</h1><a href="nested/second.html">Continuation</a>')
        self.write('reference/nested/second.html', '<h1>Continuation</h1><a href="../first.html">Return</a>'
                   '<script type="module" src="../../assets/example.js"></script>')
        self.write('assets/example.js', "import { sample } from './shared.js';\n")
        self.write('assets/shared.js', 'export const sample = 1;\n')
        self.save_manifest()

    @staticmethod
    def lesson(filename, subject):
        # Synthetic shape-valid metadata exercises discovery, not review certification.
        return {'file': filename, 'subject': subject, 'title': 'Synthetic topic',
                'summary': 'Synthetic selection fixture.', 'topics': ['Example'],
                'review': {'privacy': True, 'homeworkSeparation': True, 'accuracy': True,
                           'accessibility': True, 'sha256': '0' * 64, 'dependencies': {}, 'contract': {}}}

    def write(self, name, text):
        path = self.repo / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')

    def save_manifest(self):
        self.write('lessons.json', json.dumps(self.manifest))

    def test_new_number_and_recursive_references_are_selected(self):
        pages, resources = self.helper.discover_chemistry(self.repo)
        self.assertEqual({path.relative_to(self.repo).as_posix() for path in pages},
                         {'lessons/0042-new-topic.html', 'reference/first.html', 'reference/nested/second.html'})
        self.assertEqual({path.relative_to(self.repo).as_posix() for path in resources},
                         {'lessons.json', 'subjects.json', 'lessons/0042-new-topic.html',
                          'reference/first.html', 'reference/nested/second.html',
                          'assets/example.js', 'assets/shared.js'})

    def test_manifest_schema_and_traversal_are_rejected(self):
        for mutation, message in [(lambda: self.manifest.update(version=99), 'Unsupported lesson manifest'),
                                  (lambda: self.manifest['lessons'][0].update(file='../outside.html'), 'Lesson filenames')]:
            with self.subTest(message=message):
                self.manifest['version'] = 2
                self.manifest['lessons'][0]['file'] = '0042-new-topic.html'
                mutation()
                self.save_manifest()
                with self.assertRaisesRegex(ValueError, message):
                    self.helper.discover_chemistry(self.repo)

    def test_missing_selected_lesson_or_reference_is_rejected(self):
        for name in ('lessons/0042-new-topic.html', 'reference/nested/second.html'):
            with self.subTest(path=name):
                path = self.repo / name
                content = path.read_bytes()
                path.unlink()
                with self.assertRaisesRegex(ValueError, 'Missing|missing'):
                    self.helper.discover_chemistry(self.repo)
                path.write_bytes(content)

    def test_empty_chemistry_selection_is_not_success(self):
        self.manifest['lessons'] = [self.manifest['lessons'][1]]
        self.save_manifest()
        with self.assertRaisesRegex(ValueError, 'No registered Chemistry lessons'):
            self.helper.discover_chemistry(self.repo)


if __name__ == '__main__':
    unittest.main()

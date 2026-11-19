import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const subjectOf = lesson => lesson.subject ?? 'Geometry';
export const lessonFilename = /^[0-9]{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
export const dependencyPath = /^assets\/(?:[\w-]+\/)*[\w.-]+\.[a-z0-9]+$/i;
export const referenceDependencyPath = /^reference\/(?:[\w-][\w.-]*\/)*[\w.-]+\.html$/;
export const reviewContractCoreFiles = Object.freeze([
  'AGENTS.md', 'README.md', 'docs/REVIEW-RUBRIC.md', 'subjects.json', 'package.json', 'package-lock.json',
  '.agents/skills/homework-teach/scripts/read-docx.py',
  'scripts/build-index.mjs', 'scripts/check.mjs', 'scripts/check-live.py',
  'scripts/check-chemistry-browser.py', 'scripts/check-practice-browser.py', 'scripts/review-candidate.mjs',
  'templates/index.html', 'templates/lesson.html',
  'tests/chemistry.test.mjs',
  'tests/interactions.test.mjs',
  'tests/subjects.test.mjs', 'tests/test_docx.py', 'tests/test_live.py', 'tests/workflow.test.mjs'
]);
export const isReviewContractPath = name => reviewContractCoreFiles.includes(name) ||
  /^\.agents\/skills\/(?:[a-z]+(?:-[a-z0-9]+)*-teach\/SKILL\.md|homework-teach\/references\/(?:[\w-][\w.-]*\/)*[\w.-]+\.md)$/.test(name);
const sha256 = /^[a-f0-9]{64}$/i;

export function validateSubjectRegistry(registry) {
  if (!Array.isArray(registry) || !registry.length) throw new Error('Supply a nonempty subject registry.');
  const ids = new Set();
  const labels = new Set();
  for (const entry of registry) {
    const { id, label, skill } = entry ?? {};
    if (typeof id !== 'string' || !/^[a-z]+(?:-[a-z0-9]+)*$/.test(id) || id !== id.trim() || id === 'homework') {
      throw new Error('Supply a valid subject ID using lowercase letters and hyphen-separated words.');
    }
    if (typeof label !== 'string' || label.length > 60 || !/^\p{L}[\p{L}\p{M}\p{N} &'’-]*$/u.test(label) || label !== label.trim()) {
      throw new Error('Supply a short subject label.');
    }
    if (skill !== `.agents/skills/${id}-teach/SKILL.md`) throw new Error(`Invalid skill path for subject ${id}.`);
    const labelKey = label.normalize('NFC').toLowerCase();
    if (ids.has(id) || labels.has(labelKey)) throw new Error('Subject IDs and labels must be unique.');
    ids.add(id);
    labels.add(labelKey);
  }
  return registry;
}

export function loadSubjectRegistry(base = root) {
  const file = resolve(base, 'subjects.json');
  return validateSubjectRegistry(JSON.parse(readFileSync(file, 'utf8')));
}

const defaultRegistry = Object.freeze(loadSubjectRegistry().map(entry => Object.freeze(entry)));
export const subjects = Object.freeze(defaultRegistry.map(({ label }) => label));

function validateHashMap(file, kind, hashes, acceptsPath) {
  if (!hashes || Object.getPrototypeOf(hashes) !== Object.prototype) {
    throw new Error(`${file}: missing reviewed ${kind} SHA-256 map.`);
  }
  for (const [name, hash] of Object.entries(hashes)) {
    if (!acceptsPath(name) || typeof hash !== 'string' || !sha256.test(hash)) {
      throw new Error(`${file}: invalid reviewed ${kind} path or SHA-256.`);
    }
  }
}

export function validateManifest(manifest, registry = defaultRegistry) {
  const labels = validateSubjectRegistry(registry).map(({ label }) => label);
  if (![1,2].includes(manifest.version) || !Array.isArray(manifest.lessons)) throw new Error('Unsupported lesson manifest.');
  const seen = new Set();
  for (const lesson of manifest.lessons) {
    if (typeof lesson.file !== 'string' || !lessonFilename.test(lesson.file)) throw new Error('Lesson filenames must be NNNN-concept-name.html.');
    const number = lesson.file.slice(0, 4);
    if (seen.has(number)) throw new Error('Lesson identifiers must be unique.');
    seen.add(number);
    if ((manifest.version === 2 && !lesson.subject) || !labels.includes(subjectOf(lesson))) throw new Error(`Supply a supported lesson subject from subjects.json (${labels.join(', ')}).`);
    if (manifest.version === 1 && subjectOf(lesson) !== 'Geometry') throw new Error('Non-geometry lessons require manifest version 2.');
    if (typeof lesson.title !== 'string' || !lesson.title.trim() || lesson.title.length > 85) throw new Error('Supply a short public lesson title.');
    if (typeof lesson.summary !== 'string' || !lesson.summary.trim() || lesson.summary.length > 260) throw new Error('Supply a short public lesson summary.');
    if (!Array.isArray(lesson.topics) || !lesson.topics.length || lesson.topics.some(t => typeof t !== 'string' || !t.trim() || t.length > 60)) throw new Error('Supply public concept topics.');
    const accuracyCheck = manifest.version === 1 ? 'math' : 'accuracy';
    for (const check of ['privacy','homeworkSeparation',accuracyCheck]) {
      if (lesson.review?.[check] !== true) throw new Error(`${lesson.file}: missing ${check} review.`);
    }
    // A scoped usability pass is not a claim of complete accessibility conformance.
    if (lesson.review.accessibility !== true && !(lesson.review.coreUsability === true &&
        Array.isArray(lesson.review.limitations) && lesson.review.limitations.length > 0 &&
        lesson.review.limitations.every(item => typeof item === 'string' && item.trim()))) {
      throw new Error(`${lesson.file}: missing scoped accessibility/usability review.`);
    }
    validatePublished(lesson);
    if (typeof lesson.review.sha256 !== 'string' || !sha256.test(lesson.review.sha256)) {
      throw new Error(`${lesson.file}: missing final HTML SHA-256.`);
    }
    if (manifest.version === 2) {
      validateHashMap(lesson.file, 'dependency', lesson.review.dependencies, name => dependencyPath.test(name) || referenceDependencyPath.test(name));
      validateHashMap(lesson.file, 'contract', lesson.review.contract, isReviewContractPath);
    }
  }
  return manifest;
}

export const siteUrl = 'https://aj-flynn.github.io/geometry-lessons/';
export const feedFile = 'feed.xml';
const displayZone = 'America/Indiana/Indianapolis';
const publishedPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function validatePublished(lesson) {
  if (lesson.published === undefined) return;
  if (typeof lesson.published !== 'string' || !publishedPattern.test(lesson.published) || Number.isNaN(Date.parse(lesson.published))) {
    throw new Error(`${lesson.file}: published must be an ISO 8601 date and time with a time zone.`);
  }
}

// Newest first. Lessons without a publication time fall back to their library number.
export function feedOrder(manifest) {
  return [...manifest.lessons].sort((a, b) => {
    const at = a.published ? Date.parse(a.published) : -Infinity;
    const bt = b.published ? Date.parse(b.published) : -Infinity;
    if (at !== bt) return bt - at;
    return b.file.localeCompare(a.file);
  });
}

const dayFormat = new Intl.DateTimeFormat('en-US', { timeZone: displayZone, month: 'short', day: 'numeric', year: 'numeric' });
const isoDay = new Intl.DateTimeFormat('en-CA', { timeZone: displayZone, year: 'numeric', month: '2-digit', day: '2-digit' });
const shortDay = value => dayFormat.format(new Date(value));

const subjectKey = lesson => subjectOf(lesson).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function renderItem(lesson, featured = false) {
  const href = `lessons/${escape(lesson.file)}`;
  const when = lesson.published ? `<time datetime="${escape(isoDay.format(new Date(lesson.published)))}">${escape(shortDay(lesson.published))}</time>` : '';
  const meta = `<p class="feed-meta">${when}<span class="feed-subject">${escape(subjectOf(lesson))}</span></p>`;
  const topics = `<p class="topic-line">${lesson.topics.map(escape).join(' · ')}</p>`;
  const subject = `data-subject="${escape(subjectKey(lesson))}"`;
  if (featured) {
    return `<article class="feed-latest" ${subject} aria-labelledby="latest-title"><p class="feed-flag">Newest lesson</p>${meta}<h3 id="latest-title"><a href="${href}">${escape(lesson.title)}</a></h3><p class="feed-summary">${escape(lesson.summary)}</p>${topics}<a class="button" href="${href}">Start this lesson <span aria-hidden="true">→</span></a></article>`;
  }
  return `<li class="feed-item" ${subject}>${meta}<h3><a href="${href}">${escape(lesson.title)}</a></h3><p class="feed-summary">${escape(lesson.summary)}</p>${topics}</li>`;
}
export function renderIndex(manifest, template, registry = defaultRegistry) {
  validateManifest(manifest, registry);
  const count = manifest.lessons.length;
  const ordered = feedOrder(manifest);
  const [latest, ...earlier] = ordered;
  const content = !latest
    ? '<p class="feed-empty">No lessons yet. The first lesson will appear here when it is published.</p>'
    : `${renderItem(latest, true)}\n      ${earlier.length ? `<h3 class="feed-earlier-heading">Earlier lessons</h3>\n      <ol class="feed" reversed>\n${earlier.map(lesson => `        ${renderItem(lesson)}`).join('\n')}\n      </ol>` : ''}`;
  const subjectNav = registry.map(({ label }) => {
    const n = manifest.lessons.filter(lesson => subjectOf(lesson) === label).length;
    return n ? `<li>${escape(label)} <span>${n}</span></li>` : '';
  }).join('');
  return template.replace('{{COUNT}}', `${count} ${count === 1 ? 'lesson' : 'lessons'} to revisit`)
    .replace('{{SUBJECT_NAV}}', () => subjectNav)
    .replace('{{FEED_URL}}', () => escape(siteUrl + feedFile))
    .replace('{{LESSONS}}', () => content);
}

const rfc822 = value => new Date(value).toUTCString().replace(/GMT$/, '+0000');
const xml = value => escape(value).replace(/&#39;/g, '&apos;');

export function renderFeed(manifest, registry = defaultRegistry) {
  validateManifest(manifest, registry);
  const ordered = feedOrder(manifest).filter(lesson => lesson.published);
  const items = ordered.map(lesson => {
    const link = siteUrl + 'lessons/' + lesson.file;
    const categories = [subjectOf(lesson), ...lesson.topics].map(c => `      <category>${xml(c)}</category>`).join('\n');
    return `    <item>
      <title>${xml(lesson.title)}</title>
      <link>${xml(link)}</link>
      <guid isPermaLink="true">${xml(link)}</guid>
      <pubDate>${rfc822(lesson.published)}</pubDate>
      <description>${xml(lesson.summary)}</description>
${categories}
    </item>`;
  }).join('\n');
  const built = ordered.length ? `\n    <lastBuildDate>${rfc822(ordered[0].published)}</lastBuildDate>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Homework lessons</title>
    <link>${xml(siteUrl)}</link>
    <atom:link href="${xml(siteUrl + feedFile)}" rel="self" type="application/rss+xml"/>
    <description>New concept lessons, newest first. Each lesson teaches the idea with fresh examples and leaves the assigned work to the learner.</description>
    <language>en-us</language>${built}
    <ttl>60</ttl>
${items}
  </channel>
</rss>
`;
}

export function generateFeed(base = root) {
  const registry = loadSubjectRegistry(base);
  return renderFeed(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')), registry);
}

export function generateIndex(base = root) {
  const registry = loadSubjectRegistry(base);
  return renderIndex(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')), readFileSync(resolve(base,'templates/index.html'),'utf8'), registry);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  writeFileSync(resolve(root,'index.html'), generateIndex());
  writeFileSync(resolve(root,feedFile), generateFeed());
  console.log(`Updated root index.html and ${feedFile} from lessons.json and subjects.json.`);
}

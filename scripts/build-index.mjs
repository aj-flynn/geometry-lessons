import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const subjectOf = lesson => lesson.subject ?? 'Geometry';
export const lessonFilename = /^[0-9]{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
export const dependencyPath = /^assets\/(?:[\w-]+\/)*[\w.-]+\.[a-z0-9]+$/i;
export const referenceDependencyPath = /^reference\/(?:[\w-][\w.-]*\/)*[\w.-]+\.html$/;
export const contractPath = /^(?:docs\/REVIEW-RUBRIC\.md|\.agents\/skills\/(?:[a-z]+(?:-[a-z0-9]+)*-teach\/SKILL\.md|homework-teach\/references\/(?:[\w-][\w.-]*\/)*[\w.-]+\.md))$/;
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
    for (const check of ['privacy','homeworkSeparation',accuracyCheck,'accessibility']) {
      if (lesson.review?.[check] !== true) throw new Error(`${lesson.file}: missing ${check} review.`);
    }
    if (typeof lesson.review.sha256 !== 'string' || !sha256.test(lesson.review.sha256)) {
      throw new Error(`${lesson.file}: missing final HTML SHA-256.`);
    }
    if (manifest.version === 2) {
      validateHashMap(lesson.file, 'dependency', lesson.review.dependencies, name => dependencyPath.test(name) || referenceDependencyPath.test(name));
      validateHashMap(lesson.file, 'contract', lesson.review.contract, name => contractPath.test(name));
    }
  }
  return manifest;
}

export function renderIndex(manifest, template, registry = defaultRegistry) {
  validateManifest(manifest, registry);
  const count = manifest.lessons.length;
  const content = registry.map(({ id, label }) => {
    const lessons = manifest.lessons.filter(lesson=>subjectOf(lesson)===label).sort((a,b)=>b.file.localeCompare(a.file));
    const headingId = 'subject-'+id;
    const entries = lessons.length ? `<ul class="lesson-list">\n${lessons.map(lesson => `        <li><a class="lesson-link" href="lessons/${escape(lesson.file)}"><div><h4>${escape(lesson.title)}</h4><span class="topic-line">${lesson.topics.map(escape).join(' · ')}</span></div><p>${escape(lesson.summary)} <span aria-hidden="true">↗</span></p></a></li>`).join('\n')}\n      </ul>` : `<p class="subject-empty">No ${escape(label.toLowerCase())} lessons yet. A concept lesson will appear here when one is added.</p>`;
    return `<section class="subject-group" aria-labelledby="${headingId}"><div class="subject-heading"><h3 id="${headingId}">${escape(label)}</h3><p>${lessons.length} ${lessons.length===1?'lesson':'lessons'}</p></div>${entries}</section>`;
  }).join('\n      ');
  const subjectNav = registry.map(({ id, label }) => `<a href="#subject-${id}">${escape(label)}</a>`).join('');
  return template.replace('{{COUNT}}', `${count} ${count === 1 ? 'lesson' : 'lessons'} to revisit`)
    .replace('{{SUBJECT_NAV}}', () => subjectNav)
    .replace('{{LESSONS}}', () => content);
}

export function generateIndex(base = root) {
  const registry = loadSubjectRegistry(base);
  return renderIndex(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')), readFileSync(resolve(base,'templates/index.html'),'utf8'), registry);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  writeFileSync(resolve(root,'index.html'), generateIndex());
  console.log('Updated root index.html from lessons.json and subjects.json.');
}

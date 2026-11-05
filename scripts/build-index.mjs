import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const subjects = Object.freeze(['Geometry', 'Science', 'English']);
export const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const subjectOf = lesson => lesson.subject ?? 'Geometry';

export function validateManifest(manifest) {
  if (![1,2].includes(manifest.version) || !Array.isArray(manifest.lessons)) throw new Error('Unsupported lesson manifest.');
  const seen = new Set();
  for (const lesson of manifest.lessons) {
    if (!/^[0-9]{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(lesson.file)) throw new Error('Lesson filenames must be NNNN-concept-name.html.');
    const number = lesson.file.slice(0, 4);
    if (seen.has(number)) throw new Error('Lesson identifiers must be unique.');
    seen.add(number);
    if ((manifest.version === 2 && !lesson.subject) || !subjects.includes(subjectOf(lesson))) throw new Error('Supply a supported lesson subject: Geometry, Science, or English.');
    if (manifest.version === 1 && subjectOf(lesson) !== 'Geometry') throw new Error('Non-geometry lessons require manifest version 2.');
    if (typeof lesson.title !== 'string' || !lesson.title.trim() || lesson.title.length > 85) throw new Error('Supply a short public lesson title.');
    if (typeof lesson.summary !== 'string' || !lesson.summary.trim() || lesson.summary.length > 260) throw new Error('Supply a short public lesson summary.');
    if (!Array.isArray(lesson.topics) || !lesson.topics.length || lesson.topics.some(t => typeof t !== 'string' || !t.trim() || t.length > 60)) throw new Error('Supply public concept topics.');
    const accuracyCheck = manifest.version === 1 ? 'math' : 'accuracy';
    for (const check of ['privacy','homeworkSeparation',accuracyCheck,'accessibility']) {
      if (lesson.review?.[check] !== true) throw new Error(`${lesson.file}: missing ${check} review.`);
    }
    if (!/^[a-f0-9]{64}$/i.test(lesson.review.sha256)) throw new Error(`${lesson.file}: missing final HTML SHA-256.`);
  }
  return manifest;
}

export function renderIndex(manifest, template) {
  validateManifest(manifest);
  const count = manifest.lessons.length;
  const content = subjects.map(subject => {
    const lessons = manifest.lessons.filter(lesson=>subjectOf(lesson)===subject).sort((a,b)=>b.file.localeCompare(a.file));
    const id = 'subject-'+subject.toLowerCase();
    const entries = lessons.length ? `<ul class="lesson-list">\n${lessons.map(lesson => `        <li><a class="lesson-link" href="lessons/${escape(lesson.file)}"><div><h4>${escape(lesson.title)}</h4><span class="topic-line">${lesson.topics.map(escape).join(' · ')}</span></div><p>${escape(lesson.summary)} <span aria-hidden="true">↗</span></p></a></li>`).join('\n')}\n      </ul>` : `<p class="subject-empty">No ${subject.toLowerCase()} lessons yet. A concept lesson will appear here when one is added.</p>`;
    return `<section class="subject-group" aria-labelledby="${id}"><div class="subject-heading"><h3 id="${id}">${subject}</h3><p>${lessons.length} ${lessons.length===1?'lesson':'lessons'}</p></div>${entries}</section>`;
  }).join('\n      ');
  return template.replace('{{COUNT}}', `${count} ${count === 1 ? 'lesson' : 'lessons'} to revisit`).replace('{{LESSONS}}', content);
}

export function generateIndex(base = root) {
  return renderIndex(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')), readFileSync(resolve(base,'templates/index.html'),'utf8'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  writeFileSync(resolve(root,'index.html'), generateIndex());
  console.log('Updated root index.html from lessons.json.');
}

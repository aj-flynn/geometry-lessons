import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function validateManifest(manifest) {
  if (manifest.version !== 1 || !Array.isArray(manifest.lessons)) throw new Error('Unsupported lesson manifest.');
  const seen = new Set();
  for (const lesson of manifest.lessons) {
    if (!/^[0-9]{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(lesson.file)) throw new Error('Lesson filenames must be NNNN-concept-name.html.');
    const number = lesson.file.slice(0, 4);
    if (seen.has(number)) throw new Error('Lesson identifiers must be unique.');
    seen.add(number);
    if (typeof lesson.title !== 'string' || !lesson.title.trim() || lesson.title.length > 85) throw new Error('Supply a short public lesson title.');
    if (typeof lesson.summary !== 'string' || !lesson.summary.trim() || lesson.summary.length > 260) throw new Error('Supply a short public lesson summary.');
    if (!Array.isArray(lesson.topics) || !lesson.topics.length || lesson.topics.some(t => typeof t !== 'string' || !t.trim() || t.length > 60)) throw new Error('Supply public concept topics.');
    for (const check of ['privacy','homeworkSeparation','math','accessibility']) {
      if (lesson.review?.[check] !== true) throw new Error(`${lesson.file}: missing ${check} review.`);
    }
    if (!/^[a-f0-9]{64}$/i.test(lesson.review.sha256)) throw new Error(`${lesson.file}: missing final HTML SHA-256.`);
  }
  return manifest;
}

export function renderIndex(manifest, template) {
  validateManifest(manifest);
  const count = manifest.lessons.length;
  const content = count ? `<ul class="lesson-list">\n${[...manifest.lessons].sort((a,b)=>b.file.localeCompare(a.file)).map(lesson => `        <li><a class="lesson-link" href="lessons/${escape(lesson.file)}"><div><h3>${escape(lesson.title)}</h3><span class="topic-line">${lesson.topics.map(escape).join(' · ')}</span></div><p>${escape(lesson.summary)} <span aria-hidden="true">↗</span></p></a></li>`).join('\n')}\n      </ul>` : `<div class="empty-shelf"><strong>Your first lesson<br>starts with a question.</strong><div><p>No lessons yet. When a concept needs a closer look, its lesson will appear here.</p><p>Open a lesson link from your chat, or come back here to revisit an idea.</p></div></div>`;
  return template.replace('{{COUNT}}', `${count} ${count === 1 ? 'lesson' : 'lessons'} to revisit`).replace('{{LESSONS}}', content);
}

export function generateIndex(base = root) {
  return renderIndex(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')), readFileSync(resolve(base,'templates/index.html'),'utf8'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  writeFileSync(resolve(root,'index.html'), generateIndex());
  console.log('Updated root index.html from lessons.json.');
}


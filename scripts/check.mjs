import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { resolve, relative, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root, generateIndex, validateManifest } from './build-index.mjs';

export function inspectPublicCode(source, name) {
  const findings = [];
  const rules = [
    [/data:|blob:/i, 'Embedded data/blob payload'],
    [/<(?:img|iframe|object|embed)\b/i, 'Input-capable embedded media; use reviewed inline SVG'],
    [/<(?:script|link)\b[^>]*(?:src|href)\s*=\s*["'](?:https?:)?\/\//i, 'External script or stylesheet'],
    [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/, 'Network request'],
    [/\b(?:localStorage|sessionStorage|indexedDB)\b|document\.cookie/, 'Persistent browser data'],
    [/<form\b[^>]*\baction\s*=/i, 'Form submission destination'],
    [/url\(\s*["']?(?:https?:)?\/\//i, 'External CSS resource'],
    [/\bAUTHOR:|\{\{[A-Z_]+\}\}/, 'Unfinished authoring scaffold'],
    [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, 'Email-like personal identifier']
  ];
  for (const [pattern, message] of rules) if (pattern.test(source)) findings.push(`${name}: ${message}`);
  return findings;
}

// Enforce the shared authoring convention. Browser review still checks visibility
// and activation: source inspection cannot determine inherited CSS behavior.
export function hasLibraryLink(html) {
  const content = html.replace(/<!--[\s\S]*?-->|<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  return [...content.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)].some(([, attrs, body]) => {
    const href = attrs.match(/(?:^|\s)href\s*=\s*(["'])(.*?)\1/i)?.[2];
    const hidden = /(?:^|\s)hidden(?:\s|=|$)|\baria-hidden\s*=\s*["']true["']/i.test(attrs);
    const label = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return !hidden && href === '../index.html' && /\blesson library\b/i.test(label);
  });
}

export function check(base = root) {
  const errors = [];
  const manifest = validateManifest(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')));
  if (readFileSync(resolve(base,'index.html'),'utf8') !== generateIndex(base)) errors.push('Root index is stale; run node scripts/build-index.mjs.');
  const lessonDir = resolve(base,'lessons');
  const actual = existsSync(lessonDir) ? readdirSync(lessonDir) : [];
  if (actual.some(name => !manifest.lessons.some(lesson => lesson.file === name))) errors.push('Every file in lessons/ must be reviewed and indexed.');
  for (const lesson of manifest.lessons) {
    const file = resolve(lessonDir,lesson.file);
    if (!existsSync(file)) { errors.push(`Missing lesson ${lesson.file}`); continue; }
    const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
    if (sha !== lesson.review.sha256.toLowerCase()) errors.push(`${lesson.file}: changed since review; review again and update hash.`);
    const html = readFileSync(file,'utf8');
    if (!hasLibraryLink(html)) errors.push(`${lesson.file}: needs a visible Lesson library link to ../index.html.`);
    if (manifest.version === 2 && (!/\bid="glossary"/.test(html) || !/<dl[\s>]/i.test(html) || !/href="#glossary"/.test(html))) errors.push(`${lesson.file}: needs a linked glossary with a definition list.`);
    if (!/<svg\b/i.test(html) || !/<desc[\s>]/i.test(html)) errors.push(`${lesson.file}: needs a reviewed SVG diagram with a text equivalent.`);
    if (!/prefers-reduced-motion/.test(readFileSync(resolve(base,'assets/site.css'),'utf8'))) errors.push('Shared style needs reduced-motion support.');
  }
  const collect = directory => existsSync(resolve(base,directory)) ? readdirSync(resolve(base,directory),{withFileTypes:true}).flatMap(entry => entry.isDirectory() ? collect(directory+'/'+entry.name) : [directory+'/'+entry.name]) : [];
  const publicFiles = ['index.html', ...actual.map(name=>'lessons/'+name), ...collect('assets'), ...collect('reference')];
  for (const name of publicFiles) {
    const path = resolve(base,name);
    if (!existsSync(path)) continue;
    const source = readFileSync(path,'utf8');
    errors.push(...inspectPublicCode(source,name));
    if (extname(path) === '.html') {
      if (!/<html\b[^>]*lang="en"/.test(source) || !/<meta\b[^>]*name="viewport"/.test(source)) errors.push(`${name}: missing language or responsive viewport.`);
      if ((source.match(/<h1[\s>]/g)||[]).length !== 1) errors.push(`${name}: needs one h1.`);
      for (const match of source.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
        const url = match[1];
        if (/^https:\/\//.test(url)) continue;
        if (/^#/.test(url)) {
          if (!source.includes(`id="${url.slice(1)}"`)) errors.push(`${name}: missing anchor ${url}`);
          continue;
        }
        if (/^[a-z]+:|^\/\//i.test(url)) { errors.push(`${name}: unsupported URL scheme.`); continue; }
        const [pathAndQuery,anchor] = url.split('#');
        const local = pathAndQuery.split('?')[0];
        const target = resolve(dirname(path),local);
        const rel = relative(base,target);
        if (rel.startsWith('..') || !existsSync(target)) errors.push(`${name}: invalid local link ${url}`);
        else if (anchor && !readFileSync(target,'utf8').includes(`id="${anchor}"`)) errors.push(`${name}: missing linked anchor ${url}`);
      }
    }
  }
  // Inspect all Git candidates, including force-added ignored files. Without Git,
  // inspect the source tree. Private data must never enter either path.
  let candidates;
  try { candidates = execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:base,encoding:'utf8',stdio:['ignore','pipe','ignore']}).split('\0').filter(Boolean); }
  catch {
    const walk = (dir,prefix='') => readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
      const name = prefix+entry.name;
      if (['.git','.taste-skill','.qa','node_modules','__pycache__','dist'].includes(entry.name)) return [];
      return entry.isDirectory() ? walk(resolve(dir,entry.name),name+'/') : [name];
    });
    candidates = walk(base);
  }
  const allowedRoots = new Set(['.gitignore','.gitattributes','.nojekyll','package.json','lessons.json','index.html','AGENTS.md','README.md','MISSION.md','RESOURCES.md']);
  for (const file of candidates) {
    if (!allowedRoots.has(file) && !/^(?:assets|lessons|reference|templates|scripts|skills\/(?:geometry-teach|homework-teach)|\.agents\/skills\/(?:geometry-teach|homework-teach)|tests|docs)\//.test(file)) errors.push(`Unexpected public repository path: ${file}`);
    if (!/\.(?:html|css|js|mjs|json|md|txt|py)$/.test(file) && !allowedRoots.has(file)) errors.push(`Unsafe repository file type: ${file}`);
    if (existsSync(resolve(base,file)) && lstatSync(resolve(base,file)).isSymbolicLink()) errors.push(`Symlink is not publishable: ${file}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { lessons: manifest.lessons.length, checkedFiles: publicFiles.length, repositoryFiles: candidates.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log('Checks passed:', check()); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}


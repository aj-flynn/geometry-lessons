import { readFileSync, readdirSync, lstatSync, existsSync, realpathSync } from 'node:fs';
import { resolve, relative, extname, dirname, isAbsolute, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse } from 'parse5';
import { root, renderIndex, loadSubjectRegistry, subjectOf, validateManifest, dependencyPath, referenceDependencyPath, isReviewContractPath, reviewContractCoreFiles, lessonFilename } from './build-index.mjs';

const textExtension = /\.(?:html|css|js|mjs|json|md|txt|py)$/;
const hashBytes = bytes => createHash('sha256').update(bytes).digest('hex');
const sharedSkill = '.agents/skills/homework-teach/SKILL.md';
const sharedReferences = '.agents/skills/homework-teach/references';
const auxiliaryDirectories = new Set(['node_modules', '__pycache__', 'dist']);
const unexpectedAuxiliaryPath = path => path.split('/').some((part, index) =>
  auxiliaryDirectories.has(part) || (part.startsWith('.') && !(index === 0 && part === '.agents'))
);

export function inspectPrivateIdentifiers(source, name) {
  const findings = [];
  const addresses = source.matchAll(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/gi);
  const exampleDomain = /(?:^|\.)example\.(?:com|net|org)$|\.(?:example|invalid|test)$/i;
  const spelledAddresses = source.matchAll(/\b[A-Z0-9._%+-]+\s+(?:at|\[at\]|\(at\))\s+([A-Z0-9.-]+)\s+(?:dot|\[dot\]|\(dot\))\s+(com|org|net|edu|gov|test|example|invalid)\b/gi);
  if ([...addresses].some(([, domain]) => !exampleDomain.test(domain)) ||
      [...spelledAddresses].some(([, domain, suffix]) => !exampleDomain.test(domain + '.' + suffix))) {
    findings.push(`${name}: Email-like personal identifier`);
  }
  const phone = /(?:^|[^\w])(?:\+1[ .-]?)?(?:\([2-9]\d{2}\)[ .-]?|[2-9]\d{2}[ .-])[2-9]\d{2}[ .-]\d{4}(?!\w)/;
  const learner = /^\s*(?:[-*]\s+)?(?:student|learner|pupil)[ -]+(?:name|id|number)\s*[:=]\s*(?=[\p{L}\p{N}])[\p{L}\p{N}_.-]{2,}/imu;
  if (phone.test(source)) findings.push(`${name}: Phone-like personal identifier`);
  if (learner.test(source)) findings.push(`${name}: Labeled learner identifier`);
  const windowsHome = /\b[A-Z]:[\\/]+(?:Users|Documents and Settings)[\\/]+[^\\/\s"'<>]+/i;
  const unixHome = /(?:^|[\s"'<>=(]|file:\/\/)\/(?:Users|home)\/[^/\s"'<>]+/i;
  const homeworkPath = /(?:\b[A-Z]:[\\/]+|(?:^|[\s"'<>=(])(?:\/|\\\\)|file:\/\/\/)(?:[^\\/\r\n"'<>]+[\\/]+)*(?:private[ _-]+homework|homework[ _-]+(?:assignments?|inputs?|submissions?|uploads?))[\\/]/i;
  if (windowsHome.test(source) || unixHome.test(source)) findings.push(`${name}: Absolute private home path`);
  if (homeworkPath.test(source)) findings.push(`${name}: Absolute private homework path`);
  return findings;
}

export function inspectPublicCode(source, name) {
  const findings = inspectPrivateIdentifiers(source, name);
  const rules = [
    [/data:|blob:/i, 'Embedded data/blob payload'],
    [/<(?:img|iframe|object|embed)\b/i, 'Input-capable embedded media; use reviewed inline SVG'],
    [/<(?:script|link)\b[^>]*(?:src|href)\s*=\s*["'](?:https?:)?\/\//i, 'External script or stylesheet'],
    [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/, 'Network request'],
    [/\b(?:localStorage|sessionStorage|indexedDB|caches|CacheStorage|cookieStore)\b|document\s*(?:\.\s*cookie\b|\[\s*["'\x60]cookie["'\x60]\s*\])|navigator\s*(?:\.\s*storage\b|\[\s*["'\x60]storage["'\x60]\s*\])/, 'Persistent browser data'],
    [/<form\b[^>]*\baction\s*=/i, 'Form submission destination'],
    [/url\(\s*["']?(?:https?:)?\/\//i, 'External CSS resource'],
    [/\bAUTHOR:|\{\{[A-Z_]+\}\}/, 'Unfinished authoring scaffold']
  ];
  for (const [pattern, message] of rules) if (pattern.test(source)) findings.push(`${name}: ${message}`);
  return findings;
}

function isRegularLocalFile(file, expectedPath) {
  return existsSync(file) && lstatSync(file).isFile() && realpathSync(file) === expectedPath;
}

function cssReferences(css) {
  if (/\\|@import\b/i.test(css)) {
    throw new Error('CSS must avoid escapes and @import. Link each stylesheet directly in the lesson HTML.');
  }
  if (/\b(?:image|image-set|src|cross-fade|paint|element)\s*\(/i.test(css)) {
    throw new Error('CSS resource references must use a literal local url(...).');
  }
  const tokens = /\b(url)\((?:\s*(?:"([^"]+)"|'([^']+)'|([^\s"'()]+))\s*\))?|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'/gi;
  const references = [];
  for (const [, functionName, double, single, bare] of css.matchAll(tokens)) {
    if (!functionName) continue;
    const url = (double ?? single ?? bare)?.trim();
    if (!url) throw new Error('CSS resource references must use a literal local url(...).');
    if (!url.startsWith('#')) references.push(url);
  }
  return references;
}

const binding = String.raw`[A-Za-z_$][\w$]*`;
const namedBinding = String.raw`${binding}(?:[ \t]+as[ \t]+${binding})?`;
const namedList = String.raw`\{[ \t]*${namedBinding}(?:[ \t]*,[ \t]*${namedBinding})*[ \t]*,?[ \t]*\}`;
const namedOrNamespace = String.raw`(?:${namedList}|\*[ \t]+as[ \t]+${binding})`;
const importBindings = String.raw`(?:${binding}(?:[ \t]*,[ \t]*${namedOrNamespace})?|${namedOrNamespace})`;
const leadingImport = new RegExp(String.raw`^import[ \t]+(?:${importBindings}[ \t]+from[ \t]+)?(["'])(\.\.?\/[\w./-]+\.m?js(?:\?[\w.=&-]+)?)\1;(?=[ \t]*(?:\r?\n|$))`);

function moduleReferences(source) {
  if (/\bexport\b(?![ \t]+(?:async[ \t]+function|function|class|const|let|var|default)\b)/.test(source)) {
    throw new Error('Declare local exports directly. Export lists and re-exports are outside the lesson dependency profile.');
  }
  const runtimeLoaders = /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|Worker|SharedWorker|serviceWorker|paintWorklet|audioWorklet|importScripts|Image|Audio|eval|Function|insertAdjacentHTML|innerHTML|outerHTML)\b/;
  const resourceChanges = /\.(?:src|srcset|href)\s*=|\b(?:createElement|createElementNS)\s*\([^)]*?["'](?:script|link|iframe|img|object|embed|audio|video|source)["']|\bsetAttribute(?:NS)?\s*\([^)]*?["'](?:src|srcset|href|xlink:href)["']/i;
  const documentWrites = /\bdocument\s*(?:(?:\.|\?\.)\s*write(?:ln)?\b|(?:\?\.\s*)?\[\s*(["'\x60])write(?:ln)?\1\s*\])/;
  const cssUrls = /\burl\(/i;
  const locationCalls = /\blocation\s*(?:\.|\?\.)\s*(?:assign|replace)\s*(?:\?\.\s*)?\(/;
  const locationWrites = /\blocation(?:\s*\.\s*(?:href|protocol|host|hostname|port|pathname|search|hash)\b)?\s*=(?!=|>)/;
  const popupCalls = /(?<![\w$.])open\s*(?:\?\.\s*)?\(|\b(?:window|self|globalThis)\s*(?:\.|\?\.)\s*open\s*(?:\?\.\s*)?\(/;
  if ([locationCalls, locationWrites, popupCalls].some(pattern => pattern.test(source))) {
    throw new Error('Use reviewed HTML links instead of JavaScript navigation.');
  }
  const formDestinationWrites = /(?:\.\s*(?:action|formAction)\b|\[\s*["'\x60](?:action|formAction)["'\x60]\s*\])\s*=(?!=|>)|\bsetAttribute\s*\(\s*["'\x60](?:action|formaction)["'\x60]/i;
  const formSubmissionCalls = /(?:\.\s*(?:submit|requestSubmit)\b|\[\s*["'\x60](?:submit|requestSubmit)["'\x60]\s*\])\s*(?:\?\.\s*)?\(/;
  if (formDestinationWrites.test(source) || formSubmissionCalls.test(source)) {
    throw new Error('Practice JavaScript must avoid assigning form destinations or submitting forms.');
  }
  if ([runtimeLoaders, resourceChanges, documentWrites, cssUrls].some(pattern => pattern.test(source))) {
    throw new Error('Declare lesson resources in HTML, CSS, or leading static imports. Runtime resource loaders are outside the lesson dependency profile.');
  }
  const references = [];
  let remainder = source.trimStart();
  while (remainder) {
    const comment = remainder.match(/^(?:\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)/)?.[0];
    if (comment && !/\bimport\b/.test(comment)) {
      remainder = remainder.slice(comment.length).trimStart();
      continue;
    }
    const declaration = remainder.match(leadingImport);
    if (!declaration) break;
    references.push(declaration[2]);
    remainder = remainder.slice(declaration[0].length).trimStart();
  }
  // Search the raw body, including strings, comments, and template expressions.
  if (/\bimport\b/.test(remainder)) {
    throw new Error('Use only leading static import declarations: one per line with a quoted relative JS path and a semicolon.');
  }
  return references;
}

function* htmlElements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* htmlElements(child);
  if (node.content) yield* htmlElements(node.content);
}

const normalizeHtmlUrl = value => value.replace(/[\t\r\n]/g, '').replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '');
const embeddedElements = new Set([
  'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'portal', 'fencedframe',
  'img', 'image', 'feimage', 'picture', 'audio', 'video', 'source', 'track'
]);
const urlAttributes = new Set(['href', 'src', 'action', 'formaction', 'data', 'poster', 'background', 'cite', 'longdesc']);
const svgStyleAttributes = ['fill', 'stroke', 'filter', 'mask', 'clip-path', 'cursor', 'marker', 'marker-start', 'marker-mid', 'marker-end'];

function checkInitialFormSafety(document) {
  const forms = new Map();
  let unownedEnabledSubmitter = false;
  for (const node of htmlElements(document)) {
    if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
    const attrs = new Map(node.attrs.map(({ name, value }) => [name, value]));
    if (attrs.has('form')) throw new Error('Keep practice controls inside their form without explicit form associations.');
    if (node.tagName === 'form') forms.set(node, false);
    const type = attrs.get('type')?.toLowerCase();
    const submitter = (node.tagName === 'button' && type !== 'button' && type !== 'reset') ||
      (node.tagName === 'input' && (type === 'submit' || type === 'image'));
    if (!submitter) continue;
    let form = node.parentNode;
    while (form && !forms.has(form)) form = form.parentNode;
    if (!form) {
      if (!attrs.has('disabled')) unownedEnabledSubmitter = true;
      continue;
    }
    if (!attrs.has('disabled')) throw new Error('Practice submit controls must start disabled until a reviewed handler is bound.');
    forms.set(form, true);
  }
  if ([...forms.values()].some(disabledSubmitter => !disabledSubmitter)) {
    throw new Error('Practice forms need a disabled submit control to block implicit submission before JavaScript binds.');
  }
  if (forms.size && unownedEnabledSubmitter) {
    throw new Error('Use type="button" for non-submit buttons outside practice forms.');
  }
}

function inspectHtml(source) {
  const references = new Set();
  const links = new Set();
  const pageLinks = new Set();
  const ids = new Set();
  const addReferences = urls => urls.forEach(url => references.add(url));
  const addDeclaredResource = (url, extension, label) => {
    if (!url || !extension.test(url.split(/[?#]/, 1)[0])) throw new Error(label);
    references.add(url);
  };
  // Inspect both trees so markup in the JavaScript-disabled fallback is checked.
  const documents = [parse(source), parse(source, { scriptingEnabled: false })];
  for (const document of documents) checkInitialFormSafety(document);
  for (const node of documents.flatMap(document => [...htmlElements(document)])) {
    const tag = node.tagName.toLowerCase();
    const isSvg = node.namespaceURI === 'http://www.w3.org/2000/svg';
    const attrs = new Map();
    for (const { name, prefix, value } of node.attrs) {
      const attribute = name.toLowerCase();
      if (attribute.startsWith('on')) {
        throw new Error('Use addEventListener in reviewed JavaScript instead of inline HTML event attributes.');
      }
      if (attribute === 'srcdoc') throw new Error('Embedded srcdoc documents are outside the lesson HTML profile.');
      if (attribute === 'base' && prefix === 'xml') throw new Error('Lesson dependencies require the default page base URL.');
      const url = urlAttributes.has(attribute) ? normalizeHtmlUrl(value) : value;
      if (urlAttributes.has(attribute) && /^(?:javascript|vbscript|data|blob):/i.test(url)) {
        throw new Error('Executable or embedded URL schemes are outside the lesson HTML profile.');
      }
      if (attribute === 'href' || attribute === 'src') links.add(url);
      if (attribute === 'href' && (tag === 'a' || tag === 'area')) pageLinks.add(url);
      attrs.set(prefix ? prefix + ':' + attribute : attribute, url);
    }
    if (embeddedElements.has(tag)) throw new Error('Embedded media, documents, and plug-ins are outside the lesson HTML profile. Use inline SVG.');
    if (tag === 'script' && node.namespaceURI !== 'http://www.w3.org/1999/xhtml') {
      throw new Error('Declare reviewed scripts in HTML outside SVG or MathML.');
    }
    if (tag === 'base') throw new Error('Lesson dependencies require the default page base URL.');
    if (tag === 'meta' && attrs.get('http-equiv')?.trim().toLowerCase() === 'refresh') {
      throw new Error('Use a normal link instead of an automatic page refresh.');
    }
    if (['ping', 'attributionsrc'].some(name => attrs.has(name))) {
      throw new Error('Lesson links must avoid tracking and extra network requests.');
    }
    if (attrs.has('formaction') || (tag === 'form' && attrs.has('action'))) {
      throw new Error('Lesson practice must avoid form submission destinations.');
    }
    if (tag !== 'script' && ['src', 'srcset', 'poster', 'background'].some(name => attrs.has(name))) {
      throw new Error('Declare lesson resources in stylesheet or script elements. Use inline SVG for graphics.');
    }
    if (isSvg && tag !== 'a' && [attrs.get('href'), attrs.get('xlink:href')].some(url => url && !url.startsWith('#'))) {
      throw new Error('SVG resource links must point to a fragment in the current page.');
    }
    if (['animate', 'set', 'animatetransform', 'animatemotion'].includes(tag) &&
        /^(?:href|xlink:href|src|style)$/i.test(attrs.get('attributename'))) {
      throw new Error('SVG animation must leave resource attributes fixed.');
    }
    if (attrs.has('id')) ids.add(attrs.get('id'));
    if (attrs.has('style')) addReferences(cssReferences(attrs.get('style')));
    if (isSvg) {
      for (const name of svgStyleAttributes) {
        if (attrs.has(name)) addReferences(cssReferences(attrs.get(name)));
      }
    }
    const body = () => node.childNodes.filter(child => child.nodeName === '#text').map(child => child.value).join('');
    if (tag === 'link') {
      const rel = attrs.get('rel')?.trim().toLowerCase();
      const as = attrs.get('as')?.trim().toLowerCase();
      if (rel === 'stylesheet' || (rel === 'preload' && as === 'style')) {
        addDeclaredResource(attrs.get('href'), /\.css$/, 'Stylesheet links must point to .css resources.');
      } else if (rel === 'modulepreload' || (rel === 'preload' && as === 'script')) {
        addDeclaredResource(attrs.get('href'), /\.m?js$/, 'Script preloads must point to .js or .mjs resources.');
      } else if (attrs.has('href')) {
        throw new Error('Lesson link elements must declare stylesheets or script/style preloads.');
      }
    } else if (tag === 'style') {
      addReferences(cssReferences(body()));
    } else if (tag === 'script') {
      const type = attrs.get('type')?.trim().toLowerCase();
      if (type === 'importmap') throw new Error('Lesson dependencies require direct module URLs.');
      const src = attrs.get('src');
      if (type && type !== 'module' && !/^(?:application|text)\/(?:java|ecma)script$/.test(type)) {
        if (src === undefined && /^(?:application\/(?:ld\+)?json|text\/plain)$/.test(type)) continue;
        throw new Error('Use a standard script type for lesson JavaScript.');
      }
      if (src !== undefined) addDeclaredResource(src, /\.m?js$/, 'Script sources must point to .js or .mjs resources.');
      else addReferences(moduleReferences(body()));
    }
  }
  return { references, links, pageLinks, ids };
}

function dependencyHashes(base, page, markup) {
  const realBase = realpathSync(base);
  const dependencies = new Map();
  const dependencyName = (from, local) => relative(base, resolve(base, dirname(from), local)).split(sep).join('/');
  const urlPath = url => url?.trim().split(/[?#]/, 1)[0];
  function readDependency(from, name) {
    if (name === page || dependencies.has(name)) return;
    const file = resolve(base, name);
    if (!isRegularLocalFile(file, resolve(realBase, name))) {
      throw new Error(`${from}: Missing or unsafe publication dependency ${name}.`);
    }
    const bytes = readFileSync(file);
    dependencies.set(name, hashBytes(bytes));
    return bytes.toString('utf8');
  }

  function visitResource(from, url) {
    const local = urlPath(url);
    if (!local || isAbsolute(local) || /[:\\%&\s]/.test(local)) {
      throw new Error(`${from}: Invalid publication dependency URL. Use a literal relative resource path.`);
    }
    const name = dependencyName(from, local);
    if (!dependencyPath.test(name) || !textExtension.test(name) || unexpectedAuxiliaryPath(name)) {
      throw new Error(`${from}: Publication dependency must be a supported file within assets/.`);
    }
    const source = readDependency(from, name);
    if (source === undefined) return;
    const ext = extname(name);
    const references = ext === '.css' ? cssReferences(source)
      : ext === '.js' || ext === '.mjs' ? moduleReferences(source) : [];
    for (const reference of references) visitResource(name, reference);
  }

  function visitMarkup(from, { references, pageLinks }) {
    for (const url of references) visitResource(from, url);
    for (const url of pageLinks) {
      const local = urlPath(url);
      if (!local || isAbsolute(local) || /^[a-z][a-z0-9+.-]*:/i.test(local)) continue;
      if (/[\\%]/.test(local)) throw new Error(`${from}: Use literal relative URLs for local navigation.`);
      const name = dependencyName(from, local);
      // Library and other lesson links navigate to separately checked pages.
      if (!name.startsWith('reference/') || !name.endsWith('.html')) continue;
      if (!referenceDependencyPath.test(name) || unexpectedAuxiliaryPath(name)) {
        throw new Error(`${from}: Use a literal relative HTML path for a learner reference page.`);
      }
      const source = readDependency(from, name);
      if (source !== undefined) visitMarkup(name, inspectHtml(source));
    }
  }

  visitMarkup(page, markup);
  return Object.fromEntries([...dependencies.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

export function collectLessonDependencyHashes(base, lessonFile) {
  if (typeof lessonFile !== 'string' || !lessonFilename.test(lessonFile)) {
    throw new Error('Lesson dependency discovery requires a manifest lesson filename.');
  }
  const lesson = 'lessons/' + lessonFile;
  const file = resolve(base, lesson);
  if (!isRegularLocalFile(file, resolve(realpathSync(base), lesson))) throw new Error('Missing or unsafe lesson file.');
  return dependencyHashes(base, lesson, inspectHtml(readFileSync(file, 'utf8')));
}

export function collectReviewContractHashes(base, subject) {
  const registered = loadSubjectRegistry(base).find(entry => entry.label === subject);
  if (!registered) throw new Error('Review contract discovery requires a registered subject label.');
  const realBase = realpathSync(base);
  const references = resolve(base, sharedReferences);
  const names = [sharedSkill, registered.skill, ...reviewContractCoreFiles];
  if (existsSync(references)) {
    if (!lstatSync(references).isDirectory() || realpathSync(references) !== resolve(realBase, sharedReferences)) {
      throw new Error('Missing or unsafe shared review references directory.');
    }
    for (const file of readdirSync(references, { recursive: true })) {
      if (file.endsWith('.md')) names.push(sharedReferences + '/' + file.split(sep).join('/'));
    }
  }
  return Object.fromEntries(names.sort().map(name => {
    const path = resolve(base, name);
    if (!isReviewContractPath(name) || unexpectedAuxiliaryPath(name) || !isRegularLocalFile(path, resolve(realBase, name))) {
      throw new Error(`Missing or unsafe review contract file: ${name}.`);
    }
    return [name, hashBytes(readFileSync(path))];
  }));
}

function inspectReviewedHashes(name, kind, hashes, reviewed) {
  const errors = [];
  for (const [path, hash] of Object.entries(hashes)) {
    if (!Object.hasOwn(reviewed, path)) errors.push(`${name}: missing reviewed ${kind} ${path}.`);
    else if (hash !== reviewed[path].toLowerCase()) errors.push(`${name}: ${kind} ${path} changed since review.`);
  }
  for (const path of Object.keys(reviewed)) {
    if (!Object.hasOwn(hashes, path)) errors.push(`${name}: reviewed ${kind} ${path} is outside the current review scope.`);
  }
  return errors;
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

function hasAnnotatedPassage(html) {
  const source = html.replace(/<!--[\s\S]*?-->|<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const hasText = markup => /\p{L}/u.test(markup.replace(/<[^>]*>/g, '').replace(/&(?:\w+|#\w+);/g, ''));
  for (const [, figure] of source.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure\s*>/gi)) {
    const quote = figure.match(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote\s*>/i);
    const caption = figure.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption\s*>/i);
    if (!quote || !caption || !hasText(caption[1])) continue;
    const marks = [...quote[1].matchAll(/<mark\b[^>]*>([\s\S]*?)<\/mark\s*>/gi)];
    const notes = figure.replace(quote[0], '').replace(caption[0], '');
    if (marks.some(([, mark]) => hasText(mark)) && hasText(notes)) return true;
  }
  return false;
}

function inspectSkillFiles(base, registry, candidates, skillFolders) {
  const errors = [];
  const entries = new Map([[sharedSkill, 'homework-teach'], ...registry.map(({ id, skill }) => [skill, `${id}-teach`])]);
  const files = new Set(candidates);
  const realBase = realpathSync(base);
  const publishableFile = name => files.has(name) && isRegularLocalFile(resolve(base, name), resolve(realBase, name));
  for (const name of entries.keys()) {
    if (!publishableFile(name)) errors.push(`Missing publishable skill file: ${name}`);
  }
  for (const name of files) {
    if (!name.endsWith('.md') || !skillFolders.some(folder => name.startsWith(folder)) || !publishableFile(name)) continue;
    const text = readFileSync(resolve(base, name), 'utf8');
    const expectedName = entries.get(name);
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    const skillName = frontmatter?.match(/^name:[ \t]*([^\r\n]+)$/m)?.[1].trim();
    const description = frontmatter?.match(/^description:[ \t]*([^\r\n]*)$/m)?.[1].trim();
    if (expectedName && skillName !== expectedName) errors.push(`${name}: expected frontmatter name ${expectedName}.`);
    if (expectedName && (!description || /^(?:#|(["'])\s*\1(?:\s*(?:#.*)?)$|(?:~|null)(?:\s*(?:#.*)?)$)/i.test(description))) {
      errors.push(`${name}: needs a nonempty frontmatter description.`);
    }

    let linksSharedSkill = false;
    const body = text.replace(/<!--[\s\S]*?-->/g, '');
    for (const [, angle, plain] of body.matchAll(/\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g)) {
      const url = angle ?? plain;
      if (/^(?:https?:\/\/|mailto:|#)/i.test(url)) continue;
      const path = url.split(/[?#]/, 1)[0];
      const target = relative(base, resolve(base, dirname(name), path)).split(sep).join('/');
      if (!path || isAbsolute(path) || /[:\\%]/.test(path) || target.startsWith('../') || !publishableFile(target)) {
        const displayUrl = inspectPrivateIdentifiers(url, '').length ? '[private identifier]' : url;
        errors.push(`${name}: invalid local skill link ${displayUrl}`);
      } else if (target === sharedSkill) {
        linksSharedSkill = true;
      }
    }
    if (expectedName && name !== sharedSkill && !linksSharedSkill) {
      errors.push(`${name}: needs a link to the shared homework-teach contract.`);
    }
  }
  return errors;
}

export function archiveCandidatePaths(base) {
  function walk(dir, prefix = '') {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      const name = prefix + entry.name;
      if (!entry.isDirectory()) return [name];
      const children = walk(resolve(dir, entry.name), name + '/');
      return children.length ? children : [name + '/'];
    });
  }
  return walk(base).sort();
}

function repositoryCandidates(base) {
  // Include tracked files even when their names match an ignore rule.
  if (!existsSync(resolve(base, '.git'))) return new Set(archiveCandidatePaths(base));
  return new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: base, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
  }).split('\0').filter(Boolean));
}

export function check(base = root) {
  const errors = [];
  const realBase = realpathSync(base);
  const candidates = repositoryCandidates(base);
  const regularFile = name => isRegularLocalFile(resolve(base, name), resolve(realBase, name));
  const registry = loadSubjectRegistry(base);
  const manifest = validateManifest(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')), registry);
  const template = readFileSync(resolve(base,'templates/index.html'),'utf8');
  if (readFileSync(resolve(base,'index.html'),'utf8') !== renderIndex(manifest, template, registry)) errors.push('Root index is stale; run node scripts/build-index.mjs.');
  const lessonDir = resolve(base,'lessons');
  const actual = existsSync(lessonDir) ? readdirSync(lessonDir) : [];
  if (actual.some(name => !manifest.lessons.some(lesson => lesson.file === name))) errors.push('Every file in lessons/ must be reviewed and indexed.');
  const lessons = new Map(manifest.lessons.map(lesson => ['lessons/' + lesson.file, lesson]));
  const contracts = new Map();
  for (const [name, lesson] of lessons) {
    if (!regularFile(name)) { errors.push(`Missing or unsafe lesson ${lesson.file}`); continue; }
    if (!candidates.has(name)) errors.push(`${name}: lesson is not a publication candidate.`);
    const bytes = readFileSync(resolve(base, name));
    const sha = hashBytes(bytes);
    if (sha !== lesson.review.sha256.toLowerCase()) errors.push(`${lesson.file}: changed since review; review again and update hash.`);
    const html = bytes.toString('utf8');
    if (!hasLibraryLink(html)) errors.push(`${lesson.file}: needs a visible Lesson library link to ../index.html.`);
    if (manifest.version === 2 && (!/\bid="glossary"/.test(html) || !/<dl[\s>]/i.test(html) || !/href="#glossary"/.test(html))) errors.push(`${lesson.file}: needs a linked glossary with a definition list.`);
    const hasDiagram = /<svg\b/i.test(html) && /<desc[\s>]/i.test(html);
    const isEnglish = subjectOf(lesson) === 'English';
    if (!hasDiagram && !(isEnglish && hasAnnotatedPassage(html))) {
      const visual = isEnglish ? 'a reviewed SVG diagram with a text equivalent or an annotated passage figure' : 'a reviewed SVG diagram with a text equivalent';
      errors.push(`${lesson.file}: needs ${visual}.`);
    }
    if (manifest.version === 2) {
      try {
        const subject = subjectOf(lesson);
        if (!contracts.has(subject)) contracts.set(subject, collectReviewContractHashes(base, subject));
        const hashes = contracts.get(subject);
        for (const contractFile of Object.keys(hashes)) {
          if (!candidates.has(contractFile)) errors.push(`${name}: contract file ${contractFile} is not a publication candidate.`);
        }
        errors.push(...inspectReviewedHashes(name, 'contract file', hashes, lesson.review.contract));
      } catch (error) {
        errors.push(`${name}: ${error.message}`);
      }
    }
  }
  if (manifest.lessons.length && (!regularFile('assets/site.css') || !/prefers-reduced-motion/.test(readFileSync(resolve(base,'assets/site.css'),'utf8')))) {
    errors.push('Shared style needs reduced-motion support.');
  }
  const allowedRoots = new Set(['.gitignore','.gitattributes','.nojekyll','package.json','package-lock.json','lessons.json','subjects.json','index.html','AGENTS.md','README.md','MISSION.md','RESOURCES.md']);
  const allowedSkillFolders = [sharedSkill, ...registry.map(({ skill }) => skill)].map(skill => skill.slice(0, -'SKILL.md'.length));
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let checkedFiles = 0;
  for (const name of candidates) {
    const pathFindings = inspectPrivateIdentifiers(name, 'Repository path');
    if (pathFindings.length) {
      errors.push(...pathFindings);
      continue;
    }
    const allowedPath = allowedRoots.has(name) || (!unexpectedAuxiliaryPath(name) &&
      (/^(?:assets|lessons|reference|templates|scripts|tests|docs)\//.test(name) || allowedSkillFolders.some(folder => name.startsWith(folder))));
    const allowedType = textExtension.test(name) || allowedRoots.has(name);
    if (!allowedPath) errors.push(`Unexpected public repository path: ${name}`);
    if (!allowedType) errors.push(`Unsafe repository file type: ${name}`);
    const path = resolve(base, name);
    if (!existsSync(path)) continue;
    if (!regularFile(name)) {
      errors.push(`Symlink or non-file is not publishable: ${name}`);
      continue;
    }
    if (!allowedPath || !allowedType) continue;
    let source;
    try {
      source = decoder.decode(readFileSync(path));
    } catch {
      errors.push(`${name}: Expected readable UTF-8 text.`);
      continue;
    }
    if (source.includes('\0')) {
      errors.push(`${name}: Expected text without binary data.`);
      continue;
    }
    const publicPageOrAsset = name === 'index.html' || /^(?:assets|lessons|reference)\//.test(name) ||
      (name.startsWith('docs/skill-samples/') && extname(path) === '.html');
    if (!publicPageOrAsset) {
      errors.push(...inspectPrivateIdentifiers(source, name));
      continue;
    }
    checkedFiles++;
    errors.push(...inspectPublicCode(source, name));
    if (extname(path) === '.html') {
      if (!/<html\b[^>]*lang="en"/.test(source) || !/<meta\b[^>]*name="viewport"/.test(source)) errors.push(`${name}: missing language or responsive viewport.`);
      if ((source.match(/<h1[\s>]/g)||[]).length !== 1) errors.push(`${name}: needs one h1.`);
      let markup;
      try {
        markup = inspectHtml(source);
        const dependencies = dependencyHashes(base, name, markup);
        for (const dependency of Object.keys(dependencies)) {
          if (!candidates.has(dependency)) errors.push(`${name}: dependency ${dependency} is not a publication candidate.`);
        }
        if (manifest.version === 2 && lessons.has(name)) {
          errors.push(...inspectReviewedHashes(name, 'dependency', dependencies, lessons.get(name).review.dependencies));
        }
      } catch (error) {
        errors.push(`${name}: ${error.message}`);
        if (!markup) continue;
      }
      for (const url of markup.links) {
        if (/^https:\/\//i.test(url)) continue;
        const displayUrl = inspectPrivateIdentifiers(url, '').length ? '[private identifier]' : url;
        if (/^#/.test(url)) {
          if (!markup.ids.has(url.slice(1))) errors.push(`${name}: missing anchor ${displayUrl}`);
          continue;
        }
        if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(url)) { errors.push(`${name}: unsupported URL scheme.`); continue; }
        const [pathAndQuery,anchor] = url.split('#');
        const local = pathAndQuery.split('?')[0];
        const target = resolve(dirname(path),local);
        const rel = relative(base,target);
        if (rel.startsWith('..') || isAbsolute(rel) || !existsSync(target)) errors.push(`${name}: invalid local link ${displayUrl}`);
        else if (anchor && (!isRegularLocalFile(target, resolve(realBase, rel)) || !readFileSync(target,'utf8').includes(`id="${anchor}"`))) {
          errors.push(`${name}: missing linked anchor ${displayUrl}`);
        }
      }
    }
  }
  errors.push(...inspectSkillFiles(base, registry, [...candidates].filter(name => !unexpectedAuxiliaryPath(name)), allowedSkillFolders));
  if (errors.length) throw new Error(errors.join('\n'));
  return { lessons: manifest.lessons.length, checkedFiles, repositoryFiles: candidates.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log('Checks passed:', check()); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}


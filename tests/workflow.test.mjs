import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { renderIndex, validateManifest, generateIndex, reviewContractCoreFiles } from '../scripts/build-index.mjs';
import { check, collectLessonDependencyHashes, collectReviewContractHashes, inspectPublicCode, hasLibraryLink } from '../scripts/check.mjs';
import { createInputReceipt, verifyPublicationEnvelope } from '../scripts/review-candidate.mjs';

const syntheticAddress = ['synthetic-learner', ['synthetic-school', 'edu'].join('.')].join('@');
const sharedSkill = '.agents/skills/homework-teach/SKILL.md';
const geometrySkill = '.agents/skills/geometry-teach/SKILL.md';
const sharedSkillText = '---\nname: homework-teach\ndescription: Synthetic shared skill.\n---\n';
const geometrySkillText = '---\nname: geometry-teach\ndescription: Synthetic geometry skill.\n---\n[Shared](../homework-teach/SKILL.md)';
const rubric = 'docs/REVIEW-RUBRIC.md';
const sharedGuide = '.agents/skills/homework-teach/references/nested/guide.md';

function publicationFixture(t) {
  const base = mkdtempSync(join(tmpdir(), 'geometry-check-'));
  t.after(() => {
    assert.ok(base.startsWith(join(tmpdir(), 'geometry-check-')));
    rmSync(base, { recursive: true });
  });
  const put = (name, content) => {
    const file = join(base, name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  };
  for (const name of reviewContractCoreFiles) put(name, 'Synthetic contract input.');
  put('templates/index.html', '<html lang="en"><meta name="viewport"><h1>Library</h1><nav>{{SUBJECT_NAV}}</nav>{{LESSONS}}</html>');
  put('subjects.json', JSON.stringify([{ id: 'geometry', label: 'Geometry', skill: geometrySkill }]));
  put(sharedSkill, sharedSkillText);
  put(geometrySkill, geometrySkillText);
  put(rubric, '# Synthetic review rubric');
  put(sharedGuide, '# Synthetic shared guidance');
  return { base, put };
}

test('library navigation requires an explicit labeled root-index anchor',()=>{
  assert.ok(hasLibraryLink('<a href="../index.html">Back to the lesson library</a>'));
  assert.ok(hasLibraryLink("<a class='return-link' href='../index.html'><span>Lesson library</span></a>"));
  for (const html of [
    '<p>Lesson library</p>',
    '<a href="../missing.html">Lesson library</a>',
    '<a href="../index.html">Click here</a>',
    '<!-- <a href="../index.html">Lesson library</a> -->',
    '<script>const sample = `<a href="../index.html">Lesson library</a>`;</script>',
    '<a hidden href="../index.html">Lesson library</a>',
    '<a aria-hidden="true" href="../index.html">Lesson library</a>'
  ]) assert.equal(hasLibraryLink(html),false,html);
});

test('index escapes metadata, encodes only safe filenames, and preserves all lessons', () => {
  const entry = { file:'0001-practice-concept.html',title:'<Triangle> & angle',summary:'Think "why" < first',topics:['<angle>'],review:{privacy:true,homeworkSeparation:true,math:true,accessibility:true,sha256:'a'.repeat(64)} };
  const html = renderIndex({version:1,lessons:[entry]},'{{COUNT}} {{LESSONS}}');
  assert.match(html,/1 lesson to revisit/);
  assert.match(html,/&lt;Triangle&gt; &amp; angle/);
  assert.doesNotMatch(html,/<Triangle>/);
  assert.throws(()=>validateManifest({version:1,lessons:[{...entry,file:'../private.html'}]}));
  assert.throws(()=>validateManifest({version:1,lessons:[entry,{...entry,file:'0001-other-topic.html'}]}));
  assert.throws(()=>validateManifest({version:1,lessons:[{...entry,review:{...entry.review,homeworkSeparation:false}}]}));
});

test('common private payload and network/storage patterns are blocked',()=>{
  for (const text of ['<img src="input.jpg">','<object data="private.pdf"></object>','data:image/png;base64,abc','fetch("/upload")','localStorage.setItem("name","x")','<script src="https://example.com/a.js">','<form action="/submit">',syntheticAddress]) {
    assert.ok(inspectPublicCode(text,'lesson.html').length,text);
  }
  assert.equal(inspectPublicCode('<a href="https://example.edu/geometry">Read more</a><svg><desc>A triangle</desc></svg>','lesson.html').length,0);
});

test('only selected prototype files publish and retain public-content checks', t => {
  const { base, put } = publicationFixture(t);
  put('lessons.json', JSON.stringify({ version: 2, lessons: [] }));
  put('index.html', generateIndex(base));
  put('prototype/index.html', '<html lang="en"><h1>Prototype gallery</h1></html>');
  assert.equal(check(base).lessons, 0);
  put('prototype/unselected.html', '<h1>Unselected</h1>');
  assert.throws(() => check(base), /Unexpected public repository path: prototype\/unselected.html/);
  rmSync(join(base, 'prototype/unselected.html'));
  put('prototype/gallery.js', 'fetch("/upload");');
  assert.throws(() => check(base), /prototype\/gallery.js: Network request/);
  put('prototype/gallery.js', 'const selected = "column";');
  put('prototype/README.md', syntheticAddress);
  assert.throws(() => check(base), /prototype\/README.md: Email-like personal identifier/);
});

test('publication checks all candidate text for private identifiers', t => {
  const { base, put } = publicationFixture(t);
  put('lessons.json', JSON.stringify({ version: 2, lessons: [] }));
  put('index.html', generateIndex(base));
  const doc = 'docs/synthetic-guide.md';
  const examples = 'Fixture addresses: learner@example.com, author@sub.example.org and reader@sample.invalid.';
  put(doc, examples);
  put('tests/example.mjs', 'const illustration = `fetch("/upload")`;');
  assert.equal(check(base).lessons, 0);

  put(doc, examples + '\n' + syntheticAddress);
  const syntheticHome = ['C:', 'Users', 'Synthetic', 'work.md'].join('\\');
  put(sharedSkill, sharedSkillText + syntheticHome);
  const syntheticUnixHome = ['', 'home', 'synthetic', 'work.md'].join('/');
  put('scripts/synthetic.mjs', JSON.stringify(syntheticUnixHome));
  assert.throws(() => check(base), error => {
    assert.match(error.message, /docs\/synthetic-guide\.md: Email-like personal identifier/);
    assert.match(error.message, /homework-teach\/SKILL\.md: Absolute private home path/);
    assert.match(error.message, /scripts\/synthetic\.mjs: Absolute private home path/);
    for (const value of [syntheticAddress, syntheticHome, syntheticUnixHome]) assert.ok(!error.message.includes(value));
    return true;
  });
  put(doc, Buffer.from([0, 1, 2]));
  assert.throws(() => check(base), /docs\/synthetic-guide\.md: Expected text without binary data/);
  const privateExamples = [
    [['learner', '[at]', 'synthetic-school', '[dot]', 'edu'].join(' '), 'Email-like'],
    [['(202)', '555-0199'].join(' '), 'Phone-like'],
    [['Student', 'ID: SYNTHETIC42'].join(' '), 'Labeled learner'],
    [['Q:', 'Synthetic Sync', 'Homework Assignments', 'example.txt'].join('/'), 'Absolute private homework path'],
    [['', 'fixtures', 'private-homework', 'example.txt'].join('/'), 'Absolute private homework path'],
    [['', '', 'synthetic-host', 'fixture', 'Homework_Inputs', 'example.txt'].join('\\'), 'Absolute private homework path']
  ];
  put(sharedSkill, sharedSkillText);
  put('scripts/synthetic.mjs', '// No private state.');
  for (const [value, diagnostic] of privateExamples) {
    put(doc, value);
    assert.throws(() => check(base), error => error.message.includes(diagnostic) && !error.message.includes(value));
  }
  put(doc, 'Homework Assignments is an illustrative folder name. The public resource is https://example.com/homework-inputs/guide.');
  assert.equal(check(base).lessons, 0);
});

test('version 2 checks exact transitive hashes even when lesson HTML is unchanged', t => {
  const { base, put } = publicationFixture(t);
  const file = '0001-synthetic-qa.html';
  const html = '<html lang="en"><head><meta name="viewport"><link href="../assets/site.css?v=1" rel="stylesheet"><link rel="stylesheet" href="../assets/nested/palette.css"><script type="module" src="../assets/module.js"></script></head><body><a href="../index.html">Lesson library</a><h1>Example</h1><svg><desc>Example triangle</desc></svg><a href="#glossary">Glossary</a><dl id="glossary"><dt>Example</dt><dd>Practice concept.</dd></dl></body></html>';
  const css = '@media (prefers-reduced-motion: reduce) {}';
  const js = '// Synthetic entry module.\nimport { value as nestedValue } from "./nested/middle.mjs";\nconst answer = nestedValue;';
  const middle = '/* Synthetic intermediate module. */\nimport * as deep from "./deep.mjs";\nexport const value = deep.value;';
  const deep = 'export const value = 2;';
  put('lessons/' + file, html);
  put('assets/site.css', css);
  put('assets/nested/palette.css', `.sample { mask: url(#shape); content: 'url("./not-loaded.txt")'; background: url(./resource.txt) }`);
  put('assets/nested/resource.txt', 'Synthetic resource');
  put('assets/module.js', js);
  put('assets/nested/middle.mjs', middle);
  put('assets/nested/deep.mjs', deep);
  put('assets/late.js', 'export const late = true;');
  assert.throws(() => collectLessonDependencyHashes(base, '../index.html'), /manifest lesson filename/);
  const dependencies = collectLessonDependencyHashes(base, file);
  assert.deepEqual(Object.keys(dependencies), [
    'assets/module.js', 'assets/nested/deep.mjs',
    'assets/nested/middle.mjs', 'assets/nested/palette.css', 'assets/nested/resource.txt', 'assets/site.css'
  ]);

  const review = {
    privacy: true, homeworkSeparation: true, accuracy: true, accessibility: true,
    sha256: createHash('sha256').update(html).digest('hex'), dependencies,
    contract: collectReviewContractHashes(base, 'Geometry')
  };
  const manifest = { version: 2, lessons: [{ file, subject: 'Geometry', title: 'Synthetic QA', summary: 'Fixture only', topics: ['QA'], review }] };
  const writeManifest = () => put('lessons.json', JSON.stringify(manifest));
  writeManifest();
  put('index.html', generateIndex(base));
  assert.equal(check(base).lessons, 1);

  for (const [asset, content] of [['assets/site.css', css], ['assets/module.js', js], ['assets/nested/deep.mjs', deep]]) {
    put(asset, content + '\n');
    assert.throws(() => check(base), error => {
      assert.ok(error.message.includes('dependency ' + asset + ' changed since review'));
      assert.ok(!error.message.includes(file + ': changed since review'));
      return true;
    });
    put(asset, content);
  }

  const { 'assets/site.css': hash, ...missing } = dependencies;
  review.dependencies = { ...missing, 'assets/extra.css': hash };
  writeManifest();
  assert.throws(() => check(base), /missing reviewed dependency assets\/site\.css[\s\S]*reviewed dependency assets\/extra\.css is outside the current review scope/);
  delete review.dependencies;
  writeManifest();
  assert.throws(() => check(base), /missing reviewed dependency SHA-256 map/);
  const checkRejectedDependency = (name, source, message) => {
    put(name, source);
    review.dependencies = { ...dependencies, [name]: createHash('sha256').update(source).digest('hex') };
    writeManifest();
    assert.throws(() => check(base), message);
  };

  for (const forbidden of [
    'const hidden = `${await import("../late.js")}`;',
    '// import("../late.js");',
    'import("../late.js");',
    'import(modulePath);',
    'import "./deep.mjs";'
  ]) {
    checkRejectedDependency('assets/nested/middle.mjs', middle + '\n' + forbidden, /Use only leading static import declarations/);
  }
  checkRejectedDependency('assets/nested/middle.mjs', '// import("../late.js");\n' + middle, /Use only leading static import declarations/);
  checkRejectedDependency('assets/nested/middle.mjs', 'export /* fixture */ { value } from "./deep.mjs";', /Export lists and re-exports/);
  checkRejectedDependency('assets/nested/middle.mjs', 'new Worker("../late.js");', /Runtime resource loaders/);
  checkRejectedDependency('assets/nested/middle.mjs', 'CSS.paintWorklet.addModule("../late.js");', /Runtime resource loaders/);
  checkRejectedDependency('assets/nested/middle.mjs', 'new AudioContext()["audioWorklet"].addModule("../late.js");', /Runtime resource loaders/);
  const insertedScript = JSON.stringify('<script src="../late.js"></script>');
  for (const writer of ['document.write', 'document.writeln', 'document["write"]', "document['writeln']", 'document?.[\x60write\x60]']) {
    checkRejectedDependency('assets/nested/middle.mjs', writer + '(' + insertedScript + ');', /Runtime resource loaders/);
  }
  checkRejectedDependency('assets/nested/middle.mjs', 'shape.style.backgroundImage = "url(../late.txt)";', /Runtime resource loaders/);
  for (const navigation of [
    'location.assign("https://example.com/");',
    'window.location.replace("https://example.com/");',
    'window.open("https://example.com/");',
    'open("https://example.com/");',
    'location = "https://example.com/";',
    'window.location.href = "https://example.com/";'
  ]) {
    checkRejectedDependency('assets/nested/middle.mjs', navigation, /Use reviewed HTML links instead of JavaScript navigation/);
  }
  for (const submission of [
    'form.action = "https://example.com/";',
    'button["formAction"] = "https://example.com/";',
    'form.setAttribute("action", "https://example.com/");',
    'form.submit();',
    'form.requestSubmit?.();',
    'form["submit"]();'
  ]) {
    checkRejectedDependency('assets/nested/middle.mjs', submission, /Practice JavaScript must avoid assigning form destinations or submitting forms/);
  }
  checkRejectedDependency('assets/nested/middle.mjs', 'import "../../templates/outside.js";', /Publication dependency must be a supported file within assets/);
  put('assets/nested/middle.mjs', middle);

  checkRejectedDependency('assets/site.css', '@import "./nested/palette.css";\n' + css, /CSS must avoid escapes and @import/);
  checkRejectedDependency('assets/site.css', '@\\69mport "./nested/palette.css";\n' + css, /CSS must avoid escapes and @import/);
  checkRejectedDependency('assets/site.css', css + '.sample { background: image-set("./nested/resource.txt" 1x) }', /CSS resource references must use a literal local url/);
  checkRejectedDependency('assets/site.css', css + '.sample { background: url(var(--resource)) }', /CSS resource references must use a literal local url/);
});

test('HTML publication checks parsed execution surfaces and hashes approved inline module dependencies', t => {
  const { base, put } = publicationFixture(t);
  const file = '0001-synthetic-markup.html';
  const html = `<!doctype html><html lang="en"><head><meta name="viewport">
  <link rel=style&#115;heet href=../assets/site&#46;css?v=1&amp;mode=fixture>
  <style>.example { background: url("../assets/resource.txt") }</style>
  <script type=mod&#117;le>
  import "../assets/initializer.js";
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('button').addEventListener('click', () => {});
  });
  </script></head><body>
  <a href="../index.html">Lesson library</a><h1>Example</h1>
  <svg><desc>Example triangle</desc><g id=triangle style="mask:url(&#35;triangle)"></g><use href=&#35;triangle></use></svg>
  <a href="#glossary">Glossary</a><dl id="glossary"><dt>Example</dt><dd>Practice concept.</dd></dl>
  <button type=button>Try the example</button></body></html>`;
  put('lessons/' + file, html);
  put('assets/site.css', '@media (prefers-reduced-motion: reduce) {}');
  put('assets/resource.txt', 'Synthetic resource');
  put('assets/initializer.js', 'import "./nested/deep.js";');
  const deep = 'export const example = 1;';
  put('assets/nested/deep.js', deep);
  put('assets/late.js', 'export const example = 2;');
  const dependencies = collectLessonDependencyHashes(base, file);
  assert.deepEqual(Object.keys(dependencies), [
    'assets/initializer.js', 'assets/nested/deep.js', 'assets/resource.txt', 'assets/site.css'
  ]);
  const review = {
    privacy: true, homeworkSeparation: true, accuracy: true, accessibility: true,
    dependencies, contract: collectReviewContractHashes(base, 'Geometry')
  };
  const manifest = { version: 2, lessons: [{ file, subject: 'Geometry', title: 'Synthetic markup', summary: 'Fixture only', topics: ['QA'], review }] };
  const writePage = source => {
    put('lessons/' + file, source);
    review.sha256 = createHash('sha256').update(source).digest('hex');
    put('lessons.json', JSON.stringify(manifest));
  };
  writePage(html);
  put('index.html', generateIndex(base));
  assert.equal(check(base).lessons, 1);
  put('assets/nested/deep.js', deep + '\n');
  assert.throws(() => check(base), /dependency assets\/nested\/deep\.js changed since review/);
  put('assets/nested/deep.js', deep);

  const eventError = /inline HTML event attributes/;
  const urlError = /Executable or embedded URL schemes/;
  for (const [markup, error] of [
    [`<button onclick="import('../assets/late.js')">Load</button>`, eventError],
    ['<button OnClIcK=example()>Load</button>', eventError],
    ['<svg OnLoAd=example()></svg>', eventError],
    ['<template><template><button onclick=example()>Load</button></template></template>', eventError],
    ['<noscript><button onclick=example()>Load</button></noscript>', eventError],
    ['<a href="j&#97;va&#9;script&colon;example()">Load</a>', urlError],
    ['<svg><a xlink:href=jav&#97;script:example()>Load</a></svg>', urlError],
    ['<iframe srcdoc="&lt;script>example()&lt;/script>"></iframe>', /Embedded srcdoc documents/],
    ['<object data=../assets/late.js></object>', /Embedded media, documents, and plug-ins/],
    ['<video controls></video>', /Embedded media, documents, and plug-ins/],
    ['<svg><script href=../assets/late.js></script></svg>', /Declare reviewed scripts in HTML outside SVG or MathML/],
    ['<svg><use href=../assets/external.svg#triangle></use></svg>', /SVG resource links must point to a fragment/],
    ['<svg><image href=../assets/external.svg></image></svg>', /Embedded media, documents, and plug-ins/],
    ['<svg><filter><feImage xlink:href=../assets/external.svg></feImage></filter></svg>', /Embedded media, documents, and plug-ins/],
    ['<base target=_blank>', /default page base URL/],
    ['<meta http-equiv=refr&#101;sh content="0;url=../assets/late.js">', /automatic page refresh/],
    ['<script type=import&#109;ap>{}</script>', /direct module URLs/],
    ['<script>document["writeln"]("<script src=../assets/late.js><" + "/script>");</script>', /Runtime resource loaders/]
  ]) {
    writePage(html.replace('</body>', markup + '</body>'));
    assert.throws(() => check(base), error, markup);
  }
  writePage(html.replace('</body>', '<!-- <button onclick=example()>Example comment</button> --></body>'));
  assert.equal(check(base).lessons, 1);
});

test('the index and reference pages enforce the parsed resource profile', t => {
  const { base, put } = publicationFixture(t);
  const page = (title, head = '') => `<!doctype html><html lang="en"><head><meta name="viewport">${head}</head><body><h1>${title}</h1></body></html>`;
  put('lessons.json', JSON.stringify({ version: 2, lessons: [] }));
  put('assets/index.js', 'document.addEventListener("DOMContentLoaded", () => {});');
  put('assets/reference.css', 'body { color: black; }');
  const index = '<script src=assets/index.js></script>';
  const reference = '<link rel=stylesheet href=../assets/reference.css>';
  const writeIndex = head => {
    put('templates/index.html', page('Library', head));
    put('index.html', generateIndex(base));
  };
  writeIndex(index);
  put('reference/guide.html', page('Guide', reference));
  assert.equal(check(base).lessons, 0);

  for (const remote of [
    '<script src=https://example.com/unsafe.js></script>',
    '<link rel=stylesheet href="  https://example.com/unsafe.css">'
  ]) {
    writeIndex(remote);
    assert.throws(() => check(base), /index\.html: .*Invalid publication dependency URL/);
    writeIndex(index);
    put('reference/guide.html', page('Guide', remote));
    assert.throws(() => check(base), /reference\/guide\.html: .*Invalid publication dependency URL/);
    put('reference/guide.html', page('Guide', reference));
  }
  put('assets/source.txt', 'location.assign("https://example.com/");');
  writeIndex('<script src=assets/source.txt></script>');
  assert.throws(() => check(base), /index\.html: Script sources must point to \.js or \.mjs resources/);
  writeIndex(index);
  put('assets/index.js', 'location.assign("https://example.com/");');
  assert.throws(() => check(base), /index\.html: Use reviewed HTML links instead of JavaScript navigation/);
  put('assets/index.js', 'document.addEventListener("DOMContentLoaded", () => {});');
  put('assets/reference.css', '@import "https://example.com/unsafe.css";');
  assert.throws(() => check(base), /reference\/guide\.html: CSS must avoid escapes and @import/);
  put('reference/guide.html', page('Guide', reference));
  put('assets/reference.css', 'body { color: black; }');
  for (const persistence of ['caches.open("fixture");', 'cookieStore.set("answer", "synthetic");', 'navigator.storage.persist();']) {
    put('assets/index.js', persistence);
    assert.throws(() => check(base), /assets\/index\.js: Persistent browser data/);
  }
});

test('practice forms block native and implicit submission before JavaScript binds', t => {
  const { base, put } = publicationFixture(t);
  put('lessons.json', JSON.stringify({ version: 2, lessons: [] }));
  put('index.html', generateIndex(base));
  const putPractice = markup => put('reference/practice.html',
    `<html lang="en"><head><meta name="viewport"></head><body><h1>Practice</h1>${markup}</body></html>`);
  const safe = '<form id=practice><input name=fixture><button type=submit disabled>Check</button></form>';
  putPractice(safe);
  assert.equal(check(base).lessons, 0);
  for (const [markup, diagnostic] of [
    ['<form><input name=fixture><button>Check</button></form>', /submit controls must start disabled/],
    ['<form hidden><input name=fixture><input type=submit></form>', /submit controls must start disabled/],
    ['<form><input name=fixture><button type=button>Check</button></form>', /disabled submit control to block implicit submission/],
    ['<form><input name=fixture><template><button type=submit disabled>Check</button></template></form>', /disabled submit control to block implicit submission/],
    [safe + '<button form=practice>Check elsewhere</button>', /without explicit form associations/],
    [safe + '<input form=practice name=fixture>', /without explicit form associations/]
  ]) {
    putPractice(markup);
    assert.throws(() => check(base), diagnostic);
  }
});

test('review binds linked reference cycles and their assets plus the current teaching contract', t => {
  const { base, put } = publicationFixture(t);
  const file = '0001-synthetic-reference.html';
  const otherFile = '0002-synthetic-reference.html';
  const page = (title, head, body) => `<!doctype html><html lang="en"><head><meta name="viewport">${head}</head><body><h1>${title}</h1>${body}</body></html>`;
  const lessonBody = '<a href="../index.html">Lesson library</a><svg><desc>A diagram</desc></svg><a href="#glossary">Glossary</a><dl id="glossary"><dt>Example</dt><dd>Practice concept.</dd></dl>';
  const lesson = page('Example', '', lessonBody + '<a href=../reference/guide.html?mode=print#topic>Read the guide</a>');
  const other = page('Another example', '<script src=../assets/other.js></script>', lessonBody);
  const guide = page('Guide', '', `<h2 id="topic">Topic</h2><a href=nested/detail.html>Detail</a><a href=../index.html>Library</a><a href=../lessons/${otherFile}>Another lesson</a>`);
  const detail = page('Detail', '<script type=module src=../../assets/reference.js></script>', '<a href=../guide.html#topic>Guide</a>');
  const referenceModule = 'import "./reference-model.js";';
  const referenceModel = 'export const model = 1;';
  put('lessons/' + file, lesson);
  put('lessons/' + otherFile, other);
  put('reference/guide.html', guide);
  put('reference/nested/detail.html', detail);
  put('assets/site.css', '@media (prefers-reduced-motion: reduce) {}');
  put('assets/other.js', 'document.addEventListener("DOMContentLoaded", () => {});');
  put('assets/reference.js', referenceModule);
  put('assets/reference-model.js', referenceModel);

  const contract = collectReviewContractHashes(base, 'Geometry');
  assert.deepEqual(Object.keys(contract), [geometrySkill, sharedSkill, sharedGuide, ...reviewContractCoreFiles].sort());
  const record = (file, html) => ({
    file, subject: 'Geometry', title: 'Synthetic reference', summary: 'Fixture only', topics: ['QA'],
    review: {
      privacy: true, homeworkSeparation: true, accuracy: true, accessibility: true, contract,
      sha256: createHash('sha256').update(html).digest('hex'),
      dependencies: collectLessonDependencyHashes(base, file)
    }
  });
  const reviewed = record(file, lesson);
  assert.deepEqual(Object.keys(reviewed.review.dependencies), [
    'assets/reference-model.js', 'assets/reference.js', 'reference/guide.html', 'reference/nested/detail.html'
  ]);
  const manifest = { version: 2, lessons: [reviewed, record(otherFile, other)] };
  const writeManifest = () => put('lessons.json', JSON.stringify(manifest));
  writeManifest();
  put('index.html', generateIndex(base));
  assert.equal(check(base).lessons, 2);

  for (const [path, text, kind] of [
    ['reference/guide.html', guide, 'dependency'],
    ['reference/nested/detail.html', detail, 'dependency'],
    ['assets/reference-model.js', referenceModel, 'dependency'],
    [rubric, '# Synthetic review rubric', 'contract file'],
    ['subjects.json', readFileSync(join(base, 'subjects.json'), 'utf8'), 'contract file'],
    ['scripts/check-live.py', 'Synthetic contract input.', 'contract file'],
    [geometrySkill, geometrySkillText, 'contract file'],
    [sharedGuide, '# Synthetic shared guidance', 'contract file']
  ]) {
    put(path, text + '\n');
    assert.throws(() => check(base), error => error.message.includes(kind + ' ' + path + ' changed since review'));
    put(path, text);
  }

  const { [rubric]: rubricHash, ...withoutRubric } = contract;
  const extra = '.agents/skills/homework-teach/references/extra.md';
  reviewed.review.contract = { ...withoutRubric, [extra]: rubricHash };
  writeManifest();
  assert.throws(() => check(base), error =>
    error.message.includes('missing reviewed contract file ' + rubric) &&
    error.message.includes('reviewed contract file ' + extra + ' is outside the current review scope')
  );
  delete reviewed.review.contract;
  writeManifest();
  assert.throws(() => check(base), /missing reviewed contract SHA-256 map/);
});

test('frozen release receipts bind the whole file set and allow only approved report appends', t => {
  const { base, put } = publicationFixture(t);
  const report = 'docs/SKILL-REFINEMENT.md';
  const otherReport = 'docs/CHEMISTRY-REVIEW.md';
  const baseline = '# Earlier public review\n';
  put(report, baseline);
  put(otherReport, baseline);
  put('package-lock.json', '{}\n');
  put('lessons.json', JSON.stringify({ version: 2, lessons: [] }));
  put('index.html', generateIndex(base));
  const receipt = createInputReceipt(base, [report]);
  for (const path of [...reviewContractCoreFiles, 'package-lock.json', 'index.html', 'lessons.json', report]) {
    assert.ok(receipt.files[path]?.sha256);
  }
  assert.throws(() => createInputReceipt(base, [rubric]), /approved list/);
  assert.throws(() => verifyPublicationEnvelope(base, { ...receipt, appendOnly: [otherReport] }), /valid private review-input receipt/);
  put(report, baseline + '\nIndependent review update.\n');
  const envelope = verifyPublicationEnvelope(base, receipt);
  assert.deepEqual(envelope.appendedReports, [report]);
  assert.equal(envelope.inputReceiptSha256, receipt.receiptSha256);
  assert.notEqual(envelope.treeSha256, receipt.treeSha256);
  assert.equal(envelope.files['index.html'].sha256, receipt.files['index.html'].sha256);

  put(report, '# Rewritten review\n');
  assert.throws(() => verifyPublicationEnvelope(base, receipt), /Existing review report bytes changed/);
  put(report, baseline + '\n' + syntheticAddress);
  assert.throws(() => verifyPublicationEnvelope(base, receipt), /Email-like personal identifier/);
  put(report, baseline);
  put(otherReport, baseline + '\nUnapproved addition.\n');
  assert.throws(() => verifyPublicationEnvelope(base, receipt), /Frozen input changed: docs\/CHEMISTRY-REVIEW\.md/);
  put(otherReport, baseline);
  put('scripts/check.mjs', 'Changed governing input.');
  assert.throws(() => verifyPublicationEnvelope(base, receipt), /Frozen input changed: scripts\/check\.mjs/);
  put('scripts/check.mjs', 'Synthetic contract input.');

  const cli = fileURLToPath(new URL('../scripts/review-candidate.mjs', import.meta.url));
  const run = (...args) => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const privateReceipt = join(dirname(base), basename(base) + '-input.json');
  const privateEnvelope = join(dirname(base), basename(base) + '-envelope.json');
  t.after(() => {
    rmSync(privateReceipt, { force: true });
    rmSync(privateEnvelope, { force: true });
  });
  assert.throws(() => run('create', base, join(base, 'receipt.json'), report), /outside the frozen archive/);
  run('create', base, privateReceipt, report);
  assert.throws(() => run('create', base, privateReceipt, report), /EEXIST/);
  put(report, baseline + '\nVerified report addition.\n');
  run('verify', base, privateReceipt, privateEnvelope);
  assert.deepEqual(JSON.parse(readFileSync(privateEnvelope, 'utf8')).appendedReports, [report]);

  put('.qa/unexpected.txt', 'Synthetic hidden artifact.');
  assert.throws(() => check(base), /Unexpected public repository path: \.qa\/unexpected\.txt/);
  assert.throws(() => createInputReceipt(base, [report]), /Unexpected public repository path: \.qa\/unexpected\.txt/);
  assert.throws(() => verifyPublicationEnvelope(base, receipt), /frozen candidate file set changed/);
  rmSync(join(base, '.qa', 'unexpected.txt'));
  rmdirSync(join(base, '.qa'));
  put('docs/.qa/nested.txt', 'Synthetic hidden artifact.');
  assert.throws(() => check(base), /Unexpected public repository path: docs\/\.qa\/nested\.txt/);
});

test('publication checks reject changed reviewed HTML, raw documents, and unindexed lessons', t => {
  const { base, put } = publicationFixture(t);
  put('assets/site.css', '@media (prefers-reduced-motion: reduce) {}');
  const html = '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic QA</title><link rel="stylesheet" href="../assets/site.css?v=qa"></head><body><a href="../index.html">Lesson library</a><h1>Synthetic QA</h1><svg viewBox="0 0 10 10"><desc>A test shape</desc></svg></body></html>';
  const file = '0001-synthetic-qa.html';
  const lessonPath = 'lessons/' + file;
  put(lessonPath, html);
  const review = { privacy: true, homeworkSeparation: true, math: true, accessibility: true, sha256: createHash('sha256').update(html).digest('hex') };
  const manifest = { version: 1, lessons: [{ file, title: 'Synthetic QA', summary: 'Temporary test only', topics: ['QA'], review }] };
  const writeManifest = () => put('lessons.json', JSON.stringify(manifest));
  writeManifest();
  put('index.html', generateIndex(base));
  assert.equal(check(base).lessons, 1);

  const noLibrary = html.replace('<a href="../index.html">Lesson library</a>', '');
  put(lessonPath, noLibrary);
  review.sha256 = createHash('sha256').update(noLibrary).digest('hex');
  writeManifest();
  assert.throws(() => check(base), /Lesson library link/);
  review.sha256 = createHash('sha256').update(html).digest('hex');
  writeManifest();
  put(lessonPath, html + 'changed');
  assert.throws(() => check(base), /changed since review/);
  put(lessonPath, html);
  put('private.pdf', 'synthetic test');
  assert.throws(() => check(base), /Unsafe repository file type/);
  rmSync(join(base, 'private.pdf'));
  put('lessons/0002-unreviewed.html', html);
  assert.throws(() => check(base), /reviewed and indexed/);
});


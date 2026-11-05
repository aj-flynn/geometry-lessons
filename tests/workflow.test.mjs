import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { renderIndex, validateManifest, generateIndex } from '../scripts/build-index.mjs';
import { check, collectLessonDependencyHashes, inspectPublicCode, hasLibraryLink } from '../scripts/check.mjs';

const syntheticAddress = ['synthetic-learner', ['synthetic-school', 'edu'].join('.')].join('@');
const sharedSkill = '.agents/skills/homework-teach/SKILL.md';
const geometrySkill = '.agents/skills/geometry-teach/SKILL.md';
const sharedSkillText = '---\nname: homework-teach\ndescription: Synthetic shared skill.\n---\n';

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
  put('templates/index.html', '<html lang="en"><meta name="viewport"><h1>Library</h1><nav>{{SUBJECT_NAV}}</nav>{{LESSONS}}</html>');
  put('subjects.json', JSON.stringify([{ id: 'geometry', label: 'Geometry', skill: geometrySkill }]));
  put(sharedSkill, sharedSkillText);
  put(geometrySkill, '---\nname: geometry-teach\ndescription: Synthetic geometry skill.\n---\n[Shared](../homework-teach/SKILL.md)');
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
    sha256: createHash('sha256').update(html).digest('hex'), dependencies
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
  assert.throws(() => check(base), /missing reviewed dependency assets\/site\.css[\s\S]*reviewed dependency assets\/extra\.css is not loaded/);
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
  checkRejectedDependency('assets/nested/middle.mjs', 'import "../../templates/outside.js";', /Lesson dependency must be a supported file within assets/);
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
  const review = { privacy: true, homeworkSeparation: true, accuracy: true, accessibility: true, dependencies };
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


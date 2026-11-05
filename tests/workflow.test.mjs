import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { root, renderIndex, validateManifest, generateIndex } from '../scripts/build-index.mjs';
import { check, inspectPublicCode } from '../scripts/check.mjs';

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
  for (const text of ['<img src="input.jpg">','<object data="private.pdf"></object>','data:image/png;base64,abc','fetch("/upload")','localStorage.setItem("name","x")','<script src="https://example.com/a.js">','<form action="/submit">','student@example.com']) {
    assert.ok(inspectPublicCode(text,'lesson.html').length,text);
  }
  assert.equal(inspectPublicCode('<a href="https://example.edu/geometry">Read more</a><svg><desc>A triangle</desc></svg>','lesson.html').length,0);
});

test('publication checks reject changed reviewed HTML, raw documents, and unindexed lessons',()=>{
  // Synthetic QA fixture only, never a published or homework-derived lesson.
  const temp = mkdtempSync(join(tmpdir(),'geometry-check-'));
  try {
    for (const dir of ['templates','assets','lessons']) mkdirSync(join(temp,dir));
    for (const file of ['templates/index.html','assets/site.css','assets/lesson.js']) cpSync(join(root,file),join(temp,file));
    const html = '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic QA</title><link rel="stylesheet" href="../assets/site.css?v=qa"></head><body><h1>Synthetic QA</h1><svg viewBox="0 0 10 10"><desc>A test shape</desc></svg></body></html>';
    const file = '0001-synthetic-qa.html';
    writeFileSync(join(temp,'lessons',file),html);
    const manifest = {version:1,lessons:[{file,title:'Synthetic QA',summary:'Temporary test only',topics:['QA'],review:{privacy:true,homeworkSeparation:true,math:true,accessibility:true,sha256:createHash('sha256').update(html).digest('hex')}}]};
    writeFileSync(join(temp,'lessons.json'),JSON.stringify(manifest));
    writeFileSync(join(temp,'index.html'),generateIndex(temp));
    assert.equal(check(temp).lessons,1);
    writeFileSync(join(temp,'lessons',file),html+'changed');
    assert.throws(()=>check(temp),/changed since review/);
    writeFileSync(join(temp,'lessons',file),html);
    writeFileSync(join(temp,'private.pdf'),'synthetic test');
    assert.throws(()=>check(temp),/Unsafe repository file type/);
    rmSync(join(temp,'private.pdf'));
    writeFileSync(join(temp,'lessons','0002-unreviewed.html'),html);
    assert.throws(()=>check(temp),/reviewed and indexed/);
  } finally {
    // The exact mkdtemp directory is this test's disposable private fixture.
    assert.ok(temp.startsWith(join(tmpdir(),'geometry-check-')));
    rmSync(temp,{recursive:true});
  }
});


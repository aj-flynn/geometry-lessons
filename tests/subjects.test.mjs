import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {root,renderIndex,validateManifest,generateIndex,subjectOf,loadSubjectRegistry,validateSubjectRegistry} from '../scripts/build-index.mjs';
import {check} from '../scripts/check.mjs';

const review={privacy:true,homeworkSeparation:true,accuracy:true,accessibility:true,sha256:'a'.repeat(64)};
const entry=(file,subject)=>({file,subject,title:subject+' concept',summary:'Synthetic metadata only.',topics:['Concept'],review:{...review}});
const spanish={id:'spanish',label:'Spanish',skill:'.agents/skills/spanish-teach/SKILL.md'};

test('English is indexed independently while geometry and science retain their links',()=>{
  const lessons=[entry('0001-geometry-concept.html','Geometry'),entry('0002-science-concept.html','Science'),entry('0003-english-concept.html','English')];
  const html=renderIndex({version:2,lessons},'{{COUNT}} {{LESSONS}}');
  assert.match(html,/3 lessons to revisit/);
  for (const lesson of lessons) {
    const start=html.indexOf('id="subject-'+lesson.subject.toLowerCase()+'"');
    const end=html.indexOf('</section>',start);
    assert.ok(html.slice(start,end).includes('href="lessons/'+lesson.file+'"'));
  }
  assert.throws(()=>validateManifest({version:1,lessons:[lessons[2]]}),/version 2/);
  assert.throws(()=>validateManifest({version:2,lessons:[{...lessons[2],review:{...review,accuracy:false}}]}),/accuracy/);
});

test('version 2 indexes geometry and science separately without changing lesson URLs',()=>{
  const geometry=entry('0001-geometry-concept.html','Geometry');
  const science=entry('0002-science-concept.html','Science');
  const html=renderIndex({version:2,lessons:[science,geometry]},'{{COUNT}} {{LESSONS}}');
  assert.match(html,/2 lessons to revisit/);
  const geometryStart=html.indexOf('id="subject-geometry"');
  const scienceStart=html.indexOf('id="subject-science"');
  const geometryLink=html.indexOf('href="lessons/0001-geometry-concept.html"');
  const scienceLink=html.indexOf('href="lessons/0002-science-concept.html"');
  assert.ok(geometryStart<geometryLink&&geometryLink<scienceStart&&scienceStart<scienceLink);
  assert.equal((html.match(/href="lessons\//g)||[]).length,2);
  const empty=renderIndex({version:2,lessons:[geometry]},'{{LESSONS}}');
  assert.match(empty,/No science lessons yet/);
  assert.doesNotMatch(empty,/0002-science-concept/);
});

test('science requires subject accuracy review; legacy geometry remains readable',()=>{
  const science=entry('0002-science-concept.html','Science');
  assert.doesNotThrow(()=>validateManifest({version:2,lessons:[science]}));
  assert.throws(()=>validateManifest({version:2,lessons:[{...science,review:{...review,accuracy:false,math:true}}]}),/accuracy/);
  assert.throws(()=>validateManifest({version:2,lessons:[{...science,subject:undefined}]}),/subject/);
  assert.throws(()=>validateManifest({version:2,lessons:[{...science,subject:'<script>'}]}),/subject/);
  const legacy={...entry('0001-legacy-geometry.html','Geometry'),review:{...review,math:true}};
  delete legacy.subject;delete legacy.review.accuracy;
  assert.equal(subjectOf(legacy),'Geometry');
  assert.doesNotThrow(()=>validateManifest({version:1,lessons:[legacy]}));
  assert.throws(()=>validateManifest({version:1,lessons:[{...legacy,review:{...legacy.review,math:false}}]}),/math/);
});

test('a new registry entry controls subject validation, grouping, and heading IDs',()=>{
  const lesson=entry('0004-spanish-concept.html',spanish.label);
  const manifest={version:2,lessons:[lesson]};
  assert.throws(()=>validateManifest(manifest),/supported lesson subject/);
  const label='Spanish & Culture';
  const registry=[...loadSubjectRegistry(),{...spanish,label}];
  lesson.subject=label;
  const html=renderIndex(manifest,'{{LESSONS}}',registry);
  assert.match(html,/id="subject-spanish">Spanish &amp; Culture<\//);
  assert.match(html,/href="lessons\/0004-spanish-concept\.html"/);
});

test('registry rejects duplicate subjects and unsafe labels, IDs, and skill paths',()=>{
  const registry=loadSubjectRegistry();
  assert.throws(()=>validateSubjectRegistry([...registry,{...spanish,label:'science'}]),/unique/);
  assert.throws(()=>validateSubjectRegistry([spanish,{...spanish,label:'Spanish Language'}]),/unique/);
  assert.throws(()=>validateSubjectRegistry([{...spanish,label:'<script>Spanish</script>'}]),/label/);
  for(const id of ['spanish"','spanish\n','../spanish','homework']){
    assert.throws(()=>validateSubjectRegistry([{...spanish,id}]),/subject ID/);
  }
  for(const skill of ['.agents/skills/spanish-teach/../english-teach/SKILL.md','.agents/skills/english-teach/SKILL.md','C:/spanish/SKILL.md']){
    assert.throws(()=>validateSubjectRegistry([{...spanish,skill}]),/skill path/);
  }
});

test('a science publication requires a glossary, a current hash, and the updated index',()=>{
  const temp=mkdtempSync(join(tmpdir(),'homework-subject-check-'));
  try{
    for(const dir of ['templates','assets','lessons'])mkdirSync(join(temp,dir));
    for(const file of ['templates/index.html','assets/site.css','assets/lesson.js'])cpSync(join(root,file),join(temp,file));
    const prefix='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic QA</title></head><body><a href="../index.html">Lesson library</a><h1>Synthetic QA</h1><svg viewBox="0 0 10 10"><desc>A synthetic QA diagram</desc></svg>';
    const glossary='<a href="#glossary">Glossary</a><section id="glossary"><h2>Glossary</h2><dl><dt>Model</dt><dd>A simplified representation.</dd></dl></section>';
    const file='0002-synthetic-science-qa.html';
    const record=entry(file,'Science');
    const write=(html)=>{
      writeFileSync(join(temp,'lessons',file),html);
      record.review.sha256=createHash('sha256').update(html).digest('hex');
      writeFileSync(join(temp,'lessons.json'),JSON.stringify({version:2,lessons:[record]}));
      writeFileSync(join(temp,'index.html'),generateIndex(temp));
    };
    write(prefix+'</body></html>');assert.throws(()=>check(temp),/glossary/);
    write(prefix+glossary+'</body></html>');assert.equal(check(temp).lessons,1);
    writeFileSync(join(temp,'lessons',file),prefix+glossary+'changed</body></html>');
    assert.throws(()=>check(temp),/changed since review/);
  }finally{
    assert.ok(temp.startsWith(join(tmpdir(),'homework-subject-check-')));
    rmSync(temp,{recursive:true});
  }
});

test('publication requires a complete registry with valid skill names and local links',()=>{
  const temp=mkdtempSync(join(tmpdir(),'homework-skill-check-'));
  try{
    const put=(name,text)=>{
      const file=join(temp,name);
      mkdirSync(dirname(file),{recursive:true});
      writeFileSync(file,text);
    };
    put('subjects.json',JSON.stringify([spanish]));
    put('lessons.json',JSON.stringify({version:2,lessons:[]}));
    put('templates/index.html','<html lang="en"><meta name="viewport"><h1>Library</h1>{{LESSONS}}</html>');
    put('index.html','stale');
    assert.throws(()=>check(temp),/Root index is stale/);
    put('index.html',generateIndex(temp));
    const shared='.agents/skills/homework-teach/SKILL.md';
    put(shared,'---\nname: homework-teach\n---\n[Reference](references/guide.md)');
    const guide='.agents/skills/homework-teach/references/guide.md';
    put(guide,'[External](https://example.com/unvisited)');
    assert.throws(()=>check(temp),/Missing publishable skill file: .*spanish-teach\/SKILL.md/);

    const contract='[Shared](../homework-teach/SKILL.md)';
    put(spanish.skill,`---\nname: english-teach\n---\n${contract}`);
    assert.throws(()=>check(temp),/expected frontmatter name spanish-teach/);
    const header='---\nname: spanish-teach\n---\n';
    put(spanish.skill,header+`<!-- ${contract} -->`);
    assert.throws(()=>check(temp),/needs a link to the shared homework-teach contract/);
    put(spanish.skill,header+contract);
    assert.equal(check(temp).lessons,0);
    put(guide,'[Missing](missing.md) [Escape](../../../../../outside.md)');
    assert.throws(()=>check(temp),/invalid local skill link missing\.md[\s\S]*invalid local skill link .*outside\.md/);
    put(guide,'# Reference');

    const unknown='.agents/skills/spanish-teach-unregistered/SKILL.md';
    put(unknown,'# Synthetic unregistered skill');
    assert.throws(()=>check(temp),/Unexpected public repository path: \.agents\/skills\/spanish-teach-unregistered/);
  }finally{
    assert.ok(temp.startsWith(join(tmpdir(),'homework-skill-check-')));
    rmSync(temp,{recursive:true});
  }
});

test('teaching instructions and documentation links resolve',()=>{
  const paths=['AGENTS.md','README.md','RESOURCES.md','docs/REVIEW-RUBRIC.md','docs/LESSON-0001-REVIEW.md','docs/ENGLISH-REVIEW.md','docs/CHEMISTRY-REVIEW.md','.agents/skills/homework-teach/SKILL.md','.agents/skills/homework-teach/references/science.md','.agents/skills/homework-teach/references/lesson-workflow.md','.agents/skills/homework-teach/references/routing.md','.agents/skills/geometry-teach/SKILL.md'];
  for(const file of paths){
    const full=join(root,file),text=readFileSync(full,'utf8');
    for(const [,target] of text.matchAll(/\]\(([^)]+)\)/g)){
      if(/^https:\/\//.test(target))continue;
      assert.doesNotThrow(()=>readFileSync(resolve(dirname(full),target.split('#')[0]),'utf8'),`${file}: ${target}`);
    }
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {root,renderIndex,validateManifest,generateIndex,subjectOf} from '../scripts/build-index.mjs';
import {check} from '../scripts/check.mjs';

const review={privacy:true,homeworkSeparation:true,accuracy:true,accessibility:true,sha256:'a'.repeat(64)};
const entry=(file,subject)=>({file,subject,title:subject+' concept',summary:'Synthetic metadata only.',topics:['Concept'],review:{...review}});

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

test('a science publication requires a glossary, a current hash, and the updated index',()=>{
  const temp=mkdtempSync(join(tmpdir(),'homework-subject-check-'));
  try{
    for(const dir of ['templates','assets','lessons'])mkdirSync(join(temp,dir));
    for(const file of ['templates/index.html','assets/site.css','assets/lesson.js'])cpSync(join(root,file),join(temp,file));
    const prefix='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic QA</title></head><body><h1>Synthetic QA</h1><svg viewBox="0 0 10 10"><desc>A synthetic QA diagram</desc></svg>';
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

test('both skill entry points and their local workflow references resolve',()=>{
  const paths=['.agents/skills/homework-teach/SKILL.md','.agents/skills/homework-teach/references/science.md','.agents/skills/homework-teach/references/lesson-workflow.md','.agents/skills/geometry-teach/SKILL.md','skills/homework-teach/SKILL.md','skills/homework-teach/references/science.md','skills/homework-teach/references/lesson-workflow.md','skills/geometry-teach/SKILL.md','skills/geometry-teach/references/lesson-workflow.md'];
  for(const file of paths){
    const full=join(root,file),text=readFileSync(full,'utf8');
    for(const [,target] of text.matchAll(/\]\(([^)]+)\)/g)){
      if(/^https:\/\//.test(target))continue;
      assert.doesNotThrow(()=>readFileSync(resolve(dirname(full),target),'utf8'),`${file}: ${target}`);
    }
  }
});

test('native Codex skill is complete at the repository discovery path',()=>{
  const skill=readFileSync(join(root,'.agents/skills/homework-teach/SKILL.md'),'utf8');
  assert.match(skill,/^---\r?\nname: homework-teach\r?\ndescription: .+\r?\nlicense: MIT\r?\n---/);
  assert.ok(skill.length>2000,'Entry point must contain the actual workflow, not only a stub.');
  assert.equal(readFileSync(join(root,'.agents/skills/homework-teach/scripts/read-docx.py'),'utf8'),readFileSync(join(root,'skills/geometry-teach/scripts/read-docx.py'),'utf8'));
});

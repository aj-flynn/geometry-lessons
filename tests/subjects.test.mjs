import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {root,renderIndex,renderFeed,validateManifest,generateIndex,subjectOf,loadSubjectRegistry,validateSubjectRegistry,reviewContractCoreFiles} from '../scripts/build-index.mjs';
import {check,collectReviewContractHashes} from '../scripts/check.mjs';

const review={privacy:true,homeworkSeparation:true,accuracy:true,accessibility:true,sha256:'a'.repeat(64),dependencies:{},contract:{}};
const entry=(file,subject)=>({file,subject,title:subject+' concept',summary:'Synthetic metadata only.',topics:['Concept'],review:{...review}});
const spanish={id:'spanish',label:'Spanish',skill:'.agents/skills/spanish-teach/SKILL.md'};

test('the index is one feed, newest first, with every lesson linked once and labeled by subject',()=>{
  const lessons=[
    {...entry('0001-geometry-concept.html','Geometry'),published:'2026-11-01T10:00:00-05:00'},
    {...entry('0002-science-concept.html','Science'),published:'2026-11-03T10:00:00-05:00'},
    {...entry('0003-english-concept.html','English'),published:'2026-11-02T10:00:00-05:00'}];
  const html=renderIndex({version:2,lessons},'{{COUNT}} {{SUBJECT_NAV}} {{LESSONS}}');
  assert.match(html,/3 lessons to revisit/);
  const order=['0002-science-concept','0003-english-concept','0001-geometry-concept'].map(name=>html.indexOf('href="lessons/'+name+'.html"'));
  assert.ok(order.every(position=>position>0)&&order[0]<order[1]&&order[1]<order[2]);
  assert.match(html,/class="feed-latest"[\s\S]*0002-science-concept[\s\S]*class="feed"/);
  assert.match(html,/<time datetime="2026-11-03">Nov 3, 2026<\/time><span class="feed-subject">Science<\/span>/);
  assert.match(html,/<a class="filter-chip" href="#subject-science" data-filter="science" data-subject="science">Science<span class="filter-count" aria-hidden="true">1<\/span><\/a>/);
  assert.match(html,/<span id="subject-science" class="filter-target"><\/span>/);
  assert.match(html,/<p class="filter-empty" data-subject="chemistry">No Chemistry lessons yet/);
  assert.throws(()=>validateManifest({version:1,lessons:[lessons[2]]}),/version 2/);
  assert.throws(()=>validateManifest({version:2,lessons:[{...lessons[2],review:{...review,accuracy:false}}]}),/accuracy/);
  assert.throws(()=>validateManifest({version:2,lessons:[{...lessons[2],published:'Nov 2'}]}),/published/);
});

test('undated lessons fall back to library order and an empty library says so',()=>{
  const geometry=entry('0001-geometry-concept.html','Geometry');
  const science=entry('0002-science-concept.html','Science');
  const html=renderIndex({version:2,lessons:[geometry,science]},'{{COUNT}} {{LESSONS}}');
  assert.match(html,/2 lessons to revisit/);
  assert.ok(html.indexOf('href="lessons/0002-science-concept.html"')<html.indexOf('href="lessons/0001-geometry-concept.html"'));
  assert.equal((html.match(/<h3[^>]*><a href="lessons\//g)||[]).length,2);
  assert.match(renderIndex({version:2,lessons:[]},'{{LESSONS}}'),/No lessons yet/);
});

test('the feed is valid RSS with absolute links, escaped text and newest items first',()=>{
  const older={...entry('0001-geometry-concept.html','Geometry'),title:'Angles & <marks>',published:'2026-11-01T10:00:00-05:00'};
  const newer={...entry('0002-science-concept.html','Science'),published:'2026-11-05T09:30:00Z'};
  const feed=renderFeed({version:2,lessons:[older,newer]});
  assert.match(feed,/^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
  assert.match(feed,/<atom:link href="https:\/\/aj-flynn\.github\.io\/geometry-lessons\/feed\.xml" rel="self" type="application\/rss\+xml"\/>/);
  assert.ok(feed.indexOf('0002-science-concept')<feed.indexOf('0001-geometry-concept'));
  assert.match(feed,/<guid isPermaLink="true">https:\/\/aj-flynn\.github\.io\/geometry-lessons\/lessons\/0001-geometry-concept\.html<\/guid>/);
  assert.match(feed,/<pubDate>Sun, 01 Nov 2026 15:00:00 \+0000<\/pubDate>/);
  assert.match(feed,/<lastBuildDate>Thu, 05 Nov 2026 09:30:00 \+0000<\/lastBuildDate>/);
  assert.match(feed,/Angles &amp; &lt;marks&gt;/);
  assert.doesNotMatch(feed,/<marks>/);
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
  const existing=loadSubjectRegistry().filter(({id})=>id!==spanish.id);
  assert.throws(()=>validateManifest(manifest,existing),/supported lesson subject/);
  const label='Spanish & Culture';
  const registry=[...existing,{...spanish,label}];
  lesson.subject=label;
  const html=renderIndex(manifest,'<ul>{{SUBJECT_NAV}}</ul>{{LESSONS}}',registry);
  assert.match(html,/href="#subject-spanish" data-filter="spanish" data-subject="spanish">Spanish &amp; Culture<span class="filter-count" aria-hidden="true">1<\/span>/);
  assert.match(html,/class="feed-latest" data-subject="spanish"/);
  assert.match(html,/<span class="feed-subject">Spanish &amp; Culture<\/span>/);
  assert.match(html,/href="lessons\/0004-spanish-concept\.html"/);
});

test('the library filters by subject with CSS targets and each subject has its own feed',()=>{
  const lessons=[
    {...entry('0001-geometry-concept.html','Geometry'),published:'2026-11-01T10:00:00-05:00'},
    {...entry('0002-english-concept.html','English'),published:'2026-11-03T10:00:00-05:00'}];
  const manifest={version:2,lessons};
  const html=renderIndex(manifest,'<head>{{SUBJECT_STYLE}}</head>{{SUBJECT_NAV}}{{LESSONS}}<p>{{SUBJECT_FEEDS}}</p>');
  assert.match(html,/<nav class="subject-filter" aria-label="Lesson subjects">/);
  assert.match(html,/href="#all-subjects" data-filter="all">All<span class="filter-count" aria-hidden="true">2<\/span>/);
  assert.match(html,/#subject-geometry:target~\.feed-latest:not\(\[data-subject="geometry"\]\)/);
  assert.match(html,/<a href="feeds\/english\.xml">English feed<\/a>/);
  for(const id of html.match(/href="#subject-([a-z-]+)"/g).map(link=>link.slice(15,-1))) assert.match(html,new RegExp(`id="subject-${id}"`));
  const english=renderFeed(manifest,undefined,'english');
  assert.match(english,/<title>Homework lessons: English<\/title>/);
  assert.match(english,/feeds\/english\.xml" rel="self"/);
  assert.match(english,/0002-english-concept/);
  assert.doesNotMatch(english,/0001-geometry-concept/);
  assert.equal(renderFeed(manifest),renderFeed(manifest,undefined,undefined));
  assert.throws(()=>renderFeed(manifest,undefined,'latin'),/Unknown subject feed/);
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
    for(const dir of ['templates','assets','lessons','docs'])mkdirSync(join(temp,dir));
    for(const name of reviewContractCoreFiles){
      const target=join(temp,name);
      mkdirSync(dirname(target),{recursive:true});
      writeFileSync(target,'Synthetic contract input.');
    }
    for(const file of ['assets/site.css','assets/lesson.js'])cpSync(join(root,file),join(temp,file));
    writeFileSync(join(temp,'templates/index.html'),'<html lang="en"><meta name="viewport"><h1>Library</h1><nav>{{SUBJECT_NAV}}</nav>{{LESSONS}}</html>');
    const scienceSkill='.agents/skills/science-teach/SKILL.md';
    const englishSkill='.agents/skills/english-teach/SKILL.md';
    const sharedSkill='.agents/skills/homework-teach/SKILL.md';
    for(const file of [scienceSkill,englishSkill,sharedSkill])mkdirSync(dirname(join(temp,file)),{recursive:true});
    writeFileSync(join(temp,'subjects.json'),JSON.stringify([{id:'science',label:'Science',skill:scienceSkill},{id:'english',label:'English',skill:englishSkill}]));
    writeFileSync(join(temp,sharedSkill),'---\nname: homework-teach\ndescription: Synthetic shared skill.\n---\n');
    writeFileSync(join(temp,scienceSkill),'---\nname: science-teach\ndescription: Synthetic science skill.\n---\n[Shared](../homework-teach/SKILL.md)');
    writeFileSync(join(temp,englishSkill),'---\nname: english-teach\ndescription: Synthetic English skill.\n---\n[Shared](../homework-teach/SKILL.md)');
    writeFileSync(join(temp,'docs/REVIEW-RUBRIC.md'),'# Synthetic review rubric');
    const prefix='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic QA</title></head><body><a href="../index.html">Lesson library</a><h1>Synthetic QA</h1><svg viewBox="0 0 10 10"><desc>A synthetic QA diagram</desc></svg>';
    const glossary='<a href="#glossary">Glossary</a><section id="glossary"><h2>Glossary</h2><dl><dt>Model</dt><dd>A simplified representation.</dd></dl></section>';
    const file='0002-synthetic-science-qa.html';
    const record=entry(file,'Science');
    const write=(html)=>{
      writeFileSync(join(temp,'lessons',file),html);
      record.review.sha256=createHash('sha256').update(html).digest('hex');
      record.review.contract=collectReviewContractHashes(temp,record.subject);
      writeFileSync(join(temp,'lessons.json'),JSON.stringify({version:2,lessons:[record]}));
      writeFileSync(join(temp,'index.html'),generateIndex(temp));
    };
    write(prefix+'</body></html>');assert.throws(()=>check(temp),/glossary/);
    write(prefix+glossary+'</body></html>');assert.equal(check(temp).lessons,1);
    writeFileSync(join(temp,'lessons',file),prefix+glossary+'changed</body></html>');
    assert.throws(()=>check(temp),/changed since review/);

    const withoutSvg=prefix.replace(/<svg\b.*<\/svg>/,'')+glossary;
    const figure='<figure><blockquote>The hallway was <mark>a tunnel</mark>.</blockquote><p>The comparison emphasizes the narrow space.</p><figcaption>Read the highlighted image beside its interpretation.</figcaption></figure>';
    write(withoutSvg+figure+'</body></html>');
    assert.throws(()=>check(temp),/needs a reviewed SVG diagram/);
    record.subject='English';
    write(withoutSvg+figure+'</body></html>');
    assert.equal(check(temp).lessons,1);
    for(const invalid of [figure.replace('<p>The comparison emphasizes the narrow space.</p>',''),figure.replace(/<mark>|<\/mark>/g,''),figure.replace(/<figcaption>.*<\/figcaption>/,'')]){
      write(withoutSvg+invalid+'</body></html>');
      assert.throws(()=>check(temp),/annotated passage figure/);
    }
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
    const manifest={version:2,lessons:[]};
    const template='<html lang="en"><meta name="viewport"><h1>Library</h1>{{LESSONS}}</html>';
    put('lessons.json',JSON.stringify(manifest));
    put('templates/index.html',template);
    put('index.html',renderIndex(manifest,template));
    assert.throws(()=>generateIndex(temp),/ENOENT.*subjects\.json/);
    assert.throws(()=>check(temp),/ENOENT.*subjects\.json/);

    put('subjects.json',JSON.stringify([spanish]));
    put('index.html','stale');
    assert.throws(()=>check(temp),/Root index is stale/);
    put('index.html',generateIndex(temp));
    const shared='.agents/skills/homework-teach/SKILL.md';
    put(shared,'---\nname: homework-teach\ndescription: Synthetic shared skill.\n---\n[Reference](references/guide.md)');
    const guide='.agents/skills/homework-teach/references/guide.md';
    put(guide,'[External](https://example.com/unvisited)');
    assert.throws(()=>check(temp),/Missing publishable skill file: .*spanish-teach\/SKILL.md/);

    const contract='[Shared](../homework-teach/SKILL.md)';
    put(spanish.skill,`---\nname: english-teach\ndescription: Synthetic Spanish skill.\n---\n${contract}`);
    assert.throws(()=>check(temp),/expected frontmatter name spanish-teach/);
    for(const description of ['', 'description: " "\n','description: # empty\n']){
      put(spanish.skill,`---\nname: spanish-teach\n${description}---\n${contract}`);
      assert.throws(()=>check(temp),/needs a nonempty frontmatter description/);
    }
    const header='---\nname: spanish-teach\ndescription: Synthetic Spanish skill.\n---\n';
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
  const paths=['AGENTS.md','README.md','RESOURCES.md','docs/REVIEW-RUBRIC.md','docs/LESSON-0001-REVIEW.md','docs/ENGLISH-REVIEW.md','docs/CHEMISTRY-REVIEW.md','.agents/skills/homework-teach/SKILL.md','.agents/skills/science-teach/SKILL.md','.agents/skills/homework-teach/references/lesson-workflow.md','.agents/skills/homework-teach/references/routing.md','.agents/skills/geometry-teach/SKILL.md'];
  for(const file of paths){
    const full=join(root,file),text=readFileSync(full,'utf8');
    for(const [,target] of text.matchAll(/\]\(([^)]+)\)/g)){
      if(/^https:\/\//.test(target))continue;
      assert.doesNotThrow(()=>readFileSync(resolve(dirname(full),target.split('#')[0]),'utf8'),`${file}: ${target}`);
    }
  }
});


test('scoped usability requires disclosed limitations and preserves strict safety attestations', () => {
  const lesson=entry('0001-example.html','Geometry');
  lesson.review={...review,accessibility:false,coreUsability:true,limitations:['Optional print check not performed']};
  assert.doesNotThrow(()=>validateManifest({version:2,lessons:[lesson]}));
  for (const key of ['privacy','homeworkSeparation','accuracy']) {
    lesson.review[key]=false;
    assert.throws(()=>validateManifest({version:2,lessons:[lesson]}),new RegExp('missing '+key+' review'));
    lesson.review[key]=true;
  }
  lesson.review.limitations=[];
  assert.throws(()=>validateManifest({version:2,lessons:[lesson]}),/scoped accessibility/);
});

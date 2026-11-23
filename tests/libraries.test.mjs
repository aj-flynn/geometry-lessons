import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {renderIndex,renderFeed,validateManifest,generateIndex,generateFeed,libraryFeedFile,libraryIndexFile,reviewContractCoreFiles,libraryConfig,libraryTemplateFile} from '../scripts/build-index.mjs';
import {check,hasLibraryLink,libraryLinkFor} from '../scripts/check.mjs';

const review={privacy:true,homeworkSeparation:true,accuracy:true,accessibility:true,sha256:'a'.repeat(64),dependencies:{},contract:{}};
const entry=(file,library,published)=>({file,library,subject:'Geometry',title:'Concept '+file.slice(0,4),summary:'Synthetic metadata only.',topics:['Concept'],published,review:{...review}});
const manifest={version:2,libraries:['main','second'],lessons:[
  entry('0001-root-concept.html','main','2026-11-01T10:00:00-05:00'),
  entry('0002-second-concept.html','second','2026-11-02T10:00:00-05:00')]};
const template='<link href="{{BASE}}assets/site.css">{{COUNT}} {{LESSONS}} {{FEED_URL}}';

test('each library page lists only its own lessons and reaches shared files from its folder',()=>{
  const main=renderIndex(manifest,template,undefined,'main');
  const second=renderIndex(manifest,template,undefined,'second');
  assert.match(main,/href="assets\/site\.css"/);
  assert.match(main,/href="lessons\/0001-root-concept\.html"/);
  assert.doesNotMatch(main,/0002-second-concept/);
  assert.match(main,/1 lesson to revisit/);
  assert.match(main,/geometry-lessons\/feed\.xml/);
  assert.match(second,/href="\.\.\/assets\/site\.css"/);
  assert.match(second,/href="\.\.\/lessons\/0002-second-concept\.html"/);
  assert.doesNotMatch(second,/0001-root-concept/);
  assert.match(second,/geometry-lessons\/second\/feed\.xml/);
  assert.match(renderIndex({...manifest,lessons:[manifest.lessons[0]]},template,undefined,'second'),/No lessons yet/);
  assert.throws(()=>renderIndex(manifest,template,undefined,'third'),/Unknown library/);
});

test('omitting the library keeps the root page and feeds exactly as before',()=>{
  const legacy={version:2,lessons:manifest.lessons.slice(0,1).map(({library,...lesson})=>lesson)};
  assert.equal(renderIndex(legacy,template),renderIndex(manifest,template));
  assert.equal(renderFeed(legacy),renderFeed(manifest));
  assert.equal(renderFeed(legacy,undefined,'geometry'),renderFeed(manifest,undefined,'geometry','main'));
});

test('each library has its own feeds with its own self links and lessons',()=>{
  const feed=renderFeed(manifest,undefined,undefined,'second');
  assert.match(feed,/<atom:link href="https:\/\/aj-flynn\.github\.io\/geometry-lessons\/second\/feed\.xml" rel="self"/);
  assert.match(feed,/<link>https:\/\/aj-flynn\.github\.io\/geometry-lessons\/second\/<\/link>/);
  assert.match(feed,/geometry-lessons\/lessons\/0002-second-concept\.html/);
  assert.doesNotMatch(feed,/0001-root-concept/);
  assert.doesNotMatch(renderFeed(manifest),/0002-second-concept/);
  const subjectFeed=renderFeed(manifest,undefined,'geometry','second');
  assert.match(subjectFeed,/second\/feeds\/geometry\.xml" rel="self"/);
  assert.match(subjectFeed,/<link>https:\/\/aj-flynn\.github\.io\/geometry-lessons\/second\/#subject-geometry<\/link>/);
  assert.equal(libraryFeedFile('main','geometry'),'feeds/geometry.xml');
  assert.equal(libraryFeedFile('second'),'second/feed.xml');
  assert.equal(libraryIndexFile('second'),'second/index.html');
});

test('the library list is validated and every lesson names a listed library',()=>{
  assert.doesNotThrow(()=>validateManifest(manifest));
  assert.throws(()=>validateManifest({...manifest,lessons:[entry('0003-x.html','third','2026-11-03T10:00:00-05:00')]}),/library must be one of/);
  for (const libraries of [['second','main'],['main','main'],['main','assets'],['main','Second'],['main','a@b'],'main'])
    assert.throws(()=>validateManifest({...manifest,libraries,lessons:[]}),/library/i,JSON.stringify(libraries));
});

test('a lesson returns to its own library',()=>{
  assert.equal(libraryLinkFor('main'),'../index.html');
  assert.equal(libraryLinkFor('second'),'../second/index.html');
  assert.ok(hasLibraryLink('<a href="../second/index.html">Lesson library</a>',libraryLinkFor('second')));
  assert.equal(hasLibraryLink('<a href="../index.html">Lesson library</a>',libraryLinkFor('second')),false);
});

test('publication checks require every library page and feed to be current', t => {
  const base = mkdtempSync(join(tmpdir(), 'geometry-libraries-'));
  t.after(() => rmSync(base, { recursive: true }));
  const put = (name, content) => { const file = join(base, name); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, content); };
  for (const name of reviewContractCoreFiles) put(name, 'Synthetic contract input.');
  put('templates/index.html', '<html lang="en"><meta name="viewport"><h1>Library</h1><nav>{{SUBJECT_NAV}}</nav>{{LESSONS}}</html>');
  put('subjects.json', JSON.stringify([{ id: 'geometry', label: 'Geometry', skill: '.agents/skills/geometry-teach/SKILL.md' }]));
  put('.agents/skills/homework-teach/SKILL.md', '---\nname: homework-teach\ndescription: Synthetic shared contract.\n---\n');
  put('.agents/skills/geometry-teach/SKILL.md', '---\nname: geometry-teach\ndescription: Synthetic geometry.\n---\n[Shared](../homework-teach/SKILL.md)\n');
  put('lessons.json', JSON.stringify({ version: 2, libraries: ['main', 'second'], lessons: [] }));
  put('index.html', generateIndex(base));
  assert.throws(() => check(base), /Library index second\/index\.html is stale/);
  put('second/index.html', generateIndex(base, 'second'));
  assert.equal(check(base).lessons, 0);
  put('second/notes.html', '<h1>Unlisted</h1>');
  assert.throws(() => check(base), /Unexpected public repository path: second\/notes\.html/);
  rmSync(join(base, 'second/notes.html'));
  put('feed.xml', generateFeed(base));
  put('feeds/geometry.xml', generateFeed(base, 'geometry'));
  assert.throws(() => check(base), /Lesson feed second\/feed\.xml is stale/);
  put('second/feed.xml', generateFeed(base, undefined, 'second'));
  put('second/feeds/geometry.xml', generateFeed(base, 'geometry', 'second'));
  assert.equal(check(base).lessons, 0);
});

const registry=[{id:'geometry',label:'Geometry',skill:'.agents/skills/geometry-teach/SKILL.md'},{id:'math',label:'Math',skill:'.agents/skills/math-teach/SKILL.md'}];
const themed={version:2,libraries:[{id:'main',subjects:['geometry']},{id:'young',theme:'early',grades:'K-4'}],lessons:[
  entry('0001-root-concept.html','main','2026-11-01T10:00:00-05:00'),
  {...entry('0002-young-concept.html','young','2026-11-02T10:00:00-05:00'),subject:'Math'}]};
const navTemplate='{{SUBJECT_STYLE}}|{{SUBJECT_NAV}}|{{LESSONS}}|{{SUBJECT_FEEDS_BLOCK}}|Grades {{GRADES}}';

test('library settings pick the theme, grades and subjects each page shows',()=>{
  assert.equal(libraryTemplateFile(libraryConfig(themed,'young')),'templates/index-early.html');
  assert.equal(libraryTemplateFile(libraryConfig(themed,'main')),'templates/index.html');
  const main=renderIndex(themed,navTemplate,registry,'main');
  assert.match(main,/data-filter="geometry"/);
  assert.doesNotMatch(main,/math/i,'a subject registered for another library leaves the root page alone');
  const young=renderIndex(themed,navTemplate,registry,'young');
  assert.match(young,/Grades K–4/);
  assert.doesNotMatch(young,/subject-filter|data-filter|<style>|feeds\/geometry/,'one subject with lessons needs no subject chips');
  assert.doesNotMatch(renderIndex({...themed,lessons:[]},navTemplate,registry,'young'),/<style>|data-filter/);
  assert.throws(()=>renderFeed(themed,registry,'math','main'),/Unknown subject feed/);
  assert.match(renderFeed(themed,registry,'math','young'),/0002-young-concept/);
  assert.throws(()=>validateManifest({...themed,lessons:[{...themed.lessons[0],subject:'Math'}]},registry),/add its subject to library main/);
  for (const libraries of [['main',{id:'x',theme:'bright'}],['main',{id:'x',grades:'kindergarten'}],['main',{id:'x',subjects:['art']}],['main',{id:'x',color:'red'}],[{id:'main',subjects:[]}]])
    assert.throws(()=>validateManifest({...themed,libraries,lessons:[]},registry),/librar/i,JSON.stringify(libraries));
});

test('an early-grades library page is built and checked from its own template', t => {
  const base = mkdtempSync(join(tmpdir(), 'geometry-themes-'));
  t.after(() => rmSync(base, { recursive: true }));
  const put = (name, content) => { const file = join(base, name); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, content); };
  for (const name of reviewContractCoreFiles) put(name, 'Synthetic contract input.');
  put('subjects.json', JSON.stringify([{ id: 'geometry', label: 'Geometry', skill: '.agents/skills/geometry-teach/SKILL.md' }]));
  put('.agents/skills/homework-teach/SKILL.md', '---\nname: homework-teach\ndescription: Synthetic shared contract.\n---\n');
  put('.agents/skills/geometry-teach/SKILL.md', '---\nname: geometry-teach\ndescription: Synthetic geometry.\n---\n[Shared](../homework-teach/SKILL.md)\n');
  put('templates/index.html', '<html lang="en"><meta name="viewport"><h1>Library</h1>{{LESSONS}}</html>');
  put('templates/index-early.html', '<html lang="en"><meta name="viewport"><h1>Young</h1>{{LESSONS}}</html>');
  put('lessons.json', JSON.stringify({ version: 2, libraries: ['main', { id: 'young', theme: 'early', grades: 'K-4' }], lessons: [] }));
  for (const library of ['main', 'young']) {
    put(libraryIndexFile(library), generateIndex(base, library));
    put(libraryFeedFile(library), generateFeed(base, undefined, library));
    put(libraryFeedFile(library, 'geometry'), generateFeed(base, 'geometry', library));
  }
  assert.match(generateIndex(base, 'young'), /<h1>Young<\/h1>/);
  assert.equal(check(base).lessons, 0);
  rmSync(join(base, 'templates/index-early.html'));
  assert.throws(() => check(base), /Missing library template templates\/index-early\.html/);
});

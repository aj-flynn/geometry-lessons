from pathlib import Path
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from urllib.parse import quote
import argparse, json, math, hashlib, os, subprocess, tempfile

def discover_chemistry(repo):
 """Select registered Chemistry lessons and their actual local reference/resource closure."""
 repo=Path(repo).resolve()
 for name in ('lessons.json','subjects.json'):
  target=repo/name
  if not target.is_file() or target.resolve()!=target:
   raise ValueError(f'Missing or unsafe manifest input: {name}')
 # Reuse the repository's canonical schema and resource-profile validation.
 source=r"""
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
try {
 const [helpers, base] = process.argv.slice(1);
 const {loadSubjectRegistry, validateManifest, subjectOf} = await import(pathToFileURL(resolve(helpers,'build-index.mjs')));
 const {collectLessonDependencyHashes} = await import(pathToFileURL(resolve(helpers,'check.mjs')));
 const registry=loadSubjectRegistry(base);
 const chemistry=registry.find(subject=>subject.id==='chemistry');
 if(!chemistry) throw new Error('Chemistry must be registered in subjects.json.');
 const manifest=validateManifest(JSON.parse(readFileSync(resolve(base,'lessons.json'),'utf8')),registry);
 const lessons=manifest.lessons.filter(lesson=>subjectOf(lesson)===chemistry.label);
 if(!lessons.length) throw new Error('No registered Chemistry lessons to check.');
 const pages=new Set(), resources=new Set(['lessons.json','subjects.json']);
 for(const lesson of lessons) {
  const name='lessons/'+lesson.file; pages.add(name); resources.add(name);
  for(const dependency of Object.keys(collectLessonDependencyHashes(base,lesson.file))) {
   resources.add(dependency);
   if(dependency.startsWith('reference/') && dependency.endsWith('.html')) pages.add(dependency);
  }
 }
 console.log(JSON.stringify({pages:[...pages].sort(),resources:[...resources].sort()}));
} catch(error) { console.error(error.message); process.exit(1); }
"""
 result=subprocess.run(['node','--input-type=module','-e',source,str(Path(__file__).resolve().parent),str(repo)],capture_output=True,text=True,encoding='utf-8',check=False)
 if result.returncode:
  raise ValueError('Chemistry selection failed: '+result.stderr.strip())
 selection=json.loads(result.stdout)
 def local_paths(names):
  selected=[]
  for name in names:
   path=repo/name
   if not path.is_file() or path.resolve()!=path or not path.is_relative_to(repo):
    raise ValueError(f'Missing or unsafe selected file: {name}')
   selected.append(path)
  return selected
 return local_paths(selection['pages']),local_paths(selection['resources'])


@contextmanager
def serve_candidate(repo):
 """Serve the candidate on loopback for this check, closing the server on failure too."""
 class Handler(SimpleHTTPRequestHandler):
  extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.js':'text/javascript','.mjs':'text/javascript'}
  def log_message(self,*args):
   pass
 with ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(repo))) as server:
  worker=Thread(target=server.serve_forever,kwargs={'poll_interval':0.05},name='chemistry-browser-http',daemon=True)
  worker.start()
  try:
   yield f'http://127.0.0.1:{server.server_port}/'
  finally:
   server.shutdown()
   worker.join()


def main():
 from playwright.sync_api import sync_playwright
 parser=argparse.ArgumentParser(description='Check chemistry lessons in a real browser and save evidence outside the repository.')
 parser.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[1],help='Repository to check (default: the script repository)')
 parser.add_argument('--browser',default=os.environ.get('CHEMISTRY_BROWSER'),help='Browser executable (default: CHEMISTRY_BROWSER or Playwright Chromium)')
 parser.add_argument('--output',type=Path,default=os.environ.get('CHEMISTRY_QA_OUTPUT'),help='Evidence directory (default: CHEMISTRY_QA_OUTPUT or a temporary directory)')
 args=parser.parse_args()
 repo=args.repo.resolve()
 out=args.output.resolve() if args.output else Path(tempfile.mkdtemp(prefix='chemistry-qa-')).resolve()
 if out == repo or repo in out.parents:
  parser.error('--output must resolve outside the candidate repository')
 try:
  paths,resources=discover_chemistry(repo)
 except (ValueError,OSError) as error:
  parser.error(str(error))
 out.mkdir(parents=True,exist_ok=True)

 results=[]
 def ok(name,value):
  assert value,name
  results.append(name)
 with serve_candidate(repo) as origin, sync_playwright() as p:
  browser=p.chromium.launch(**({'executable_path':args.browser} if args.browser else {}))
  browser_version=browser.version
  page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for path in paths:
   for w in [390,768,1440]:
    page.set_viewport_size({'width':w,'height':950});page.goto(origin+quote(path.relative_to(repo).as_posix(),safe='/'));page.wait_for_timeout(80)
    ok(f'{path.stem} no overflow at {w}',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    page.screenshot(path=str(out/f'{path.stem}-{w}.png'),full_page=True)
   page.evaluate("document.body.style.zoom='2'")
   ok(f'{path.stem} no overflow at 200% CSS zoom',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
   page.screenshot(path=str(out/f'{path.stem}-zoom.png'),full_page=True)
   page.evaluate("document.body.style.zoom='1'")
   page.keyboard.press('Control+Home');page.keyboard.press('Tab')
   ok(f'{path.stem} visible keyboard focus',page.evaluate("getComputedStyle(document.activeElement).outlineStyle !== 'none'"))
   for form in page.locator('form[data-practice]').all():
    answer=form.get_attribute('data-expected');inp=form.locator('input');btn=form.locator('button')
    for value,message in json.loads(form.get_attribute('data-mistakes') or '{}').items():
     inp.fill(value);btn.click();ok(f'{path.stem} targeted misconception {value}',form.locator('[data-feedback]').inner_text()==message)
    inp.fill('999');btn.click();wrong=form.locator('[data-feedback]').inner_text()
    inp.fill(answer);btn.click();right=form.locator('[data-feedback]').inner_text()
    ok(f'{path.stem} numeric retry {answer}',right!=wrong and right==(form.get_attribute('data-success') or 'That fits this practice example. Can you explain why?'))
   for form in page.locator('[data-chem-choice]').all():
    for opt in form.locator('input').all():
     opt.check()
     ok(f'{path.stem} previous choice feedback cleared',form.locator('.feedback').inner_text()=='')
     form.locator('button').click()
     ok(f'{path.stem} choice feedback {opt.get_attribute("name")} {opt.get_attribute("value")}',form.locator('.feedback').inner_text()==opt.get_attribute('data-explanation'))
   for model in page.locator('[data-chem-steps]').all():
    model.locator('[data-step]').click();ok(f'{path.stem} step advances',model.locator('[data-step-status]').inner_text().startswith('Step 2'))
    model.locator('[data-reset]').click();ok(f'{path.stem} reset',model.locator('[data-step-status]').inner_text().startswith('Step 1'))
    model.locator('[data-play]').click();page.wait_for_timeout(2550)
    model.locator('[data-pause]').click();before=model.locator('[data-step-status]').inner_text();page.wait_for_timeout(2500)
    ok(f'{path.stem} pause freezes state',before==model.locator('[data-step-status]').inner_text())
    model.locator('[data-reset]').click()
    page.emulate_media(reduced_motion='reduce');model.locator('[data-play]').click()
    ok(f'{path.stem} reduced motion stays paused',model.locator('[data-play]').get_attribute('aria-pressed')=='false')
    page.emulate_media(reduced_motion='no-preference')
   if page.locator('[data-polarity]').count():
    slider=page.locator('#angle')
    for angle in [60,90,180]:
     slider.fill(str(angle));slider.dispatch_event('input')
     data=page.evaluate('''()=>{const m=document.querySelector('[data-polarity]');return [...m.querySelectorAll('[data-vector], [data-result]')].map(x=>({x1:+x.getAttribute('x1'),x2:+x.getAttribute('x2'),y1:+x.getAttribute('y1'),y2:+x.getAttribute('y2')}))}''')
     a,b,c=data
     ok(f'angle {angle} vector sum x',abs(a['x2']-a['x1']+b['x2']-b['x1'])<1e-9)
     ok(f'angle {angle} vector sum y',abs(a['y2']-a['y1']+b['y2']-b['y1']-(c['y2']-c['y1']))<1e-9)
     ok(f'angle {angle} unit arrow length',abs(math.hypot(a['x2']-a['x1'],a['y2']-a['y1'])-80)<1e-9)
    slider.focus();page.keyboard.press('ArrowLeft');ok('angle keyboard changes value',slider.input_value()=='179')
    page.locator('[data-angle-play]').click();page.wait_for_timeout(250);page.locator('[data-angle-pause]').click();v=slider.input_value();page.wait_for_timeout(200)
    ok('angle animation pause',v==slider.input_value())
    page.locator('[data-angle-reset]').click();ok('angle reset',slider.input_value()=='180')
    page.emulate_media(reduced_motion='reduce');page.locator('[data-angle-play]').click();ok('angle reduced motion endpoint',slider.input_value()=='90' and page.locator('[data-angle-play]').get_attribute('aria-pressed')=='false')
    page.emulate_media(reduced_motion='no-preference')
   page.emulate_media(media='print');page.screenshot(path=str(out/f'{path.stem}-print.png'),full_page=True);page.emulate_media(media='screen')
   if page.locator('figure').count():
    page.set_viewport_size({'width':390,'height':950});page.locator('figure').first.screenshot(path=str(out/f'{path.stem}-figure.png'))
  ok('no browser script errors',not errors)
  nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':950});static=nojs.new_page()
  for path in paths:
   static.goto(origin+quote(path.relative_to(repo).as_posix(),safe='/'));ok(f'{path.stem} static heading',static.locator('h1').is_visible())
   ok(f'{path.stem} static controls hidden',static.locator('.enhanced:visible').count()==0)
   for details in static.locator('details.observations').all():
    details.locator('summary').click();ok(f'{path.stem} no-JS stages readable',details.locator('li, p').last.is_visible())
  nojs.close();browser.close()
 hashes={str(p.relative_to(repo)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in resources}
 (out/'results.json').write_text(json.dumps({'pages':[str(path.relative_to(repo)).replace('\\','/') for path in paths],'checks':results,'count':len(results),'browser':'Chromium '+browser_version,'origin':origin,'hashes':hashes},indent=2),encoding='utf-8')
 print(json.dumps({'passed':len(results),'evidence':str(out/'results.json')}))

if __name__=='__main__':
 main()

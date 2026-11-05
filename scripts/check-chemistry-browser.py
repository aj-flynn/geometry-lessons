from pathlib import Path
from playwright.sync_api import sync_playwright
import json, math, hashlib, os, tempfile
repo=Path(__file__).resolve().parents[1]
out=Path(os.environ['CHEMISTRY_QA_OUTPUT']) if 'CHEMISTRY_QA_OUTPUT' in os.environ else Path(tempfile.mkdtemp(prefix='chemistry-qa-'))
out.mkdir(parents=True,exist_ok=True)
paths=sorted(repo.glob('lessons/000[3-6]-*.html'))+[repo/'reference/chemistry-field-guide.html']
results=[]
def ok(name,value):
 assert value,name
 results.append(name)
with sync_playwright() as p:
 browser=p.chromium.launch(**({'executable_path':os.environ['CHEMISTRY_BROWSER']} if os.environ.get('CHEMISTRY_BROWSER') else {}))
 browser_version=browser.version
 page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for path in paths:
  for w in [390,768,1440]:
   page.set_viewport_size({'width':w,'height':950});page.goto(path.as_uri());page.wait_for_timeout(80)
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
   ok(f'{path.stem} numeric retry {answer}',right!=wrong and right.startswith('Yes'))
  for form in page.locator('[data-chem-choice]').all():
   for opt in form.locator('input').all():
    opt.check();form.locator('button').click()
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
  static.goto(path.as_uri());ok(f'{path.stem} static heading',static.locator('h1').is_visible())
  ok(f'{path.stem} static controls hidden',static.locator('.enhanced:visible').count()==0)
  for details in static.locator('details.observations').all():
   details.locator('summary').click();ok(f'{path.stem} no-JS stages readable',details.locator('li, p').last.is_visible())
 nojs.close();browser.close()
hashes={str(p.relative_to(repo)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths+[repo/'assets/chemistry.js',repo/'assets/chemistry.css',repo/'assets/site.css',repo/'assets/lesson.js']}
(out/'results.json').write_text(json.dumps({'checks':results,'count':len(results),'browser':'Chromium '+browser_version,'hashes':hashes},indent=2),encoding='utf-8')
print(json.dumps({'passed':len(results),'evidence':str(out/'results.json')}))

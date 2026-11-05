import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const chemistry = readFileSync(new URL('../assets/chemistry.js', import.meta.url), 'utf8');
const practice = readFileSync(new URL('../assets/lesson.js', import.meta.url), 'utf8');
function control(initial = {}) {
  return Object.assign({
    attributes: {}, listeners: {}, dataset: {}, style: {}, value: '', textContent: '',
    classList: { toggle() {} },
    setAttribute(key, value) { this.attributes[key] = String(value); },
    addEventListener(key, fn) { (this.listeners[key] ??= []).push(fn); },
    fire(key) { for (const fn of this.listeners[key] || []) fn({ preventDefault() {} }); }
  }, initial);
}
function run(models = {}, code = chemistry) {
  const motion = control({ matches: false });
  const document = control({ hidden: false, querySelectorAll: key => models[key] || [] });
  let frame = null, interval = null;
  vm.runInNewContext(code, {
    document, matchMedia: () => motion, performance: { now: () => 0 },
    requestAnimationFrame: fn => { frame = fn; return 1; },
    cancelAnimationFrame: () => { frame = null; },
    setInterval: fn => { interval = fn; return 1; },
    clearInterval: () => { interval = null; }
  });
  return { motion, document, frame: () => frame, interval: () => interval };
}

test('chemistry vector sums keep one scale, cancellation, live text, and motion controls', () => {
  const map = Object.fromEntries(['input', '[data-angle-play]', 'output', '[data-result]', '[data-vector=left]', '[data-vector=right]', '[data-vector-label]', 'svg desc', '.enhanced', '[data-angle-pause]', '[data-angle-reset]'].map(k => [k, control()]));
  const env = run({ '[data-polarity]': [{ querySelector: k => map[k] }] });
  for (const angle of [60, 90, 120, 180]) {
    map.input.value = String(angle); map.input.fire('input');
    const a = map['[data-vector=left]'].attributes, b = map['[data-vector=right]'].attributes;
    const resultY = Number(map['[data-result]'].attributes.y2);
    assert.ok(Math.abs(Number(a.x2) + Number(b.x2) - 600) < 1e-9);
    assert.ok(Math.abs(Number(a.y2) + Number(b.y2) - 380 - (resultY - 190)) < 1e-9);
    assert.ok(Math.abs(Math.hypot(Number(a.x2) - 300, Number(a.y2) - 190) - 80) < 1e-9);
    assert.match(map['svg desc'].textContent, new RegExp(`${angle} degrees`));
  }
  assert.equal(map['[data-result]'].style.visibility, 'hidden');
  assert.match(map.output.value, /0\.00 model units/);
  map['[data-angle-play]'].fire('click'); env.frame()(1200);
  assert.equal(map.input.value, '135');
  map['[data-angle-pause]'].fire('click'); assert.equal(env.frame(), null);
  map['[data-angle-reset]'].fire('click'); assert.equal(map.input.value, '180');
  env.motion.matches = true; map['[data-angle-play]'].fire('click');
  assert.equal(map.input.value, '90'); assert.equal(env.frame(), null);
  env.motion.matches = false; map['[data-angle-play]'].fire('click');
  env.document.hidden = true; env.document.fire('visibilitychange');
  assert.equal(env.frame(), null);
});

for (const type of ['packets', 'ledger', 'separate']) {
  test(`chemistry ${type} reveals only reached stages and respects pause, reset, and reduced motion`, () => {
    const notes = [0, 1, 2].map(i => control({ textContent: `Observation ${i}` }));
    const stages = [0, 1, 2].map(i => control({ dataset: { stage: String(i) } }));
    const map = Object.fromEntries(['[data-step-status]', '[data-play]', '.observations', 'svg desc', '[data-molecule=left]', '[data-molecule=right]', '[data-gap]', '.enhanced', '[data-step]', '[data-pause]', '[data-reset]'].map(k => [k, control()]));
    const model = { dataset: { chemSteps: type }, querySelector: k => map[k], querySelectorAll: k => k === '.step-notes li' ? notes : stages };
    const env = run({ '[data-chem-steps]': [model] });
    assert.equal(stages[1].style.opacity, '0'); assert.equal(map['svg desc'].textContent, 'Observation 0');
    map['[data-step]'].fire('click'); assert.match(map['[data-step-status]'].textContent, /Step 2/);
    assert.equal(stages[1].style.opacity, '1'); assert.equal(stages[2].style.opacity, '0');
    if (type === 'separate') {
      assert.equal(map['[data-molecule=left]'].attributes.transform, 'translate(-45 0)');
      assert.equal(map['[data-molecule=right]'].attributes.transform, 'translate(45 0)');
      assert.equal(Number(map['[data-gap]'].attributes.x2) - Number(map['[data-gap]'].attributes.x1), 120);
    }
    map['[data-play]'].fire('click'); env.interval()();
    assert.match(map['[data-step-status]'].textContent, /Step 3/); assert.equal(env.interval(), null);
    map['[data-reset]'].fire('click'); assert.match(map['[data-step-status]'].textContent, /Step 1/);
    map['[data-play]'].fire('click'); map['[data-pause]'].fire('click'); assert.equal(env.interval(), null);
    env.motion.matches = true; map['[data-play]'].fire('click');
    assert.match(map['[data-step-status]'].textContent, /Step 2/); assert.equal(env.interval(), null);
  });
}

const decode = s => s.replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&amp;', '&');
test('chemistry numeric practice responds to authored misconceptions and permits a correct retry', () => {
  for (const filename of ['0003-reading-particle-formulas.html', '0004-electrons-and-bonds.html', '0005-shape-and-polarity.html']) {
    const html = readFileSync(new URL(`../lessons/${filename}`, import.meta.url), 'utf8');
    const tag = html.match(/<form data-practice\b[^>]*>/)[0];
    const dataset = {};
    for (const [, key, value] of tag.matchAll(/data-([a-z]+)="([^"]*)"/g)) dataset[key] = decode(value);
    const input = control(), feedback = control();
    const form = control({ dataset, querySelector: k => k === 'input' ? input : feedback });
    run({ 'form[data-practice]': [form] }, practice);
    const mistakes = JSON.parse(dataset.mistakes);
    assert.ok(Object.keys(mistakes).length >= 2);
    for (const [value, explanation] of Object.entries(mistakes)) {
      assert.notEqual(Number(value), Number(dataset.expected));
      input.value = value; form.fire('submit'); assert.equal(feedback.textContent, explanation);
    }
    input.value = dataset.expected; form.fire('submit'); assert.equal(feedback.textContent, dataset.success);
  }
});

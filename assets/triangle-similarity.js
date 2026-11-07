// Original concept examples only. Responses stay in this page's memory.
for (const form of document.querySelectorAll('[data-aa-choice]')) {
  const feedback = form.querySelector('[data-feedback]');
  const submit = form.querySelector('button[type="submit"]');
  if (!feedback || !submit || !form.querySelector('input[type="radio"]')) continue;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector('input[type="radio"]:checked');
    feedback.textContent = selected ? selected.dataset.explanation : 'Choose a response, then check this new example.';
  });
  submit.disabled = false;
}
for (const model of document.querySelectorAll('[data-aa-model]')) {
  const slider = model.querySelector('input[type="range"]');
  const polygon = model.querySelector('[data-moving-triangle]');
  const dLabel = model.querySelector('[data-d-label]');
  const eLabel = model.querySelector('[data-e-label]');
  const parallel = model.querySelector('[data-parallel-mark]');
  const output = model.querySelector('output');
  const status = model.querySelector('[data-model-status]');
  const controls = model.querySelector('fieldset');
  const play = model.querySelector('[data-play]');
  const pause = model.querySelector('[data-pause]');
  const reset = model.querySelector('[data-reset]');
  if (![slider,polygon,dLabel,eLabel,parallel,output,status,controls,play,pause,reset].every(Boolean)) continue;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  const render = value => {
    value = Math.round(value);
    const t = value / 100, dx = 60, dy = 40 + 240*t, ex = 60+320*t, ey = dy;
    polygon.setAttribute('points', `60,40 ${dx},${dy} ${ex},${ey}`);
    dLabel.setAttribute('x', dx-30); dLabel.setAttribute('y',dy+7);
    eLabel.setAttribute('x',ex+12); eLabel.setAttribute('y',ey+8);
    parallel.setAttribute('d',`M ${60+160*t-6} ${dy-7} l 8 7 -8 7`);
    slider.value = String(value);
    slider.setAttribute('aria-valuetext', `${t.toFixed(2)} of each full side`);
    output.value = `${(t).toFixed(2)} of each full side`;
    status.textContent = `AD/AB = AE/AC = DE/BC = ${t.toFixed(2)}. ∠DAE ≅ ∠BAC and ∠ADE ≅ ∠ABC throughout.`;
  };
  const stop = () => { if(frame!==null) cancelAnimationFrame(frame); frame=null; play.setAttribute('aria-pressed','false'); };
  slider.addEventListener('input',()=>{stop();render(Number(slider.value));});
  pause.addEventListener('click',stop);
  reset.addEventListener('click',()=>{stop();render(50);});
  play.addEventListener('click',()=>{
    stop();
    if(motion.matches){render(75);return;}
    render(30); play.setAttribute('aria-pressed','true');
    const start=performance.now();
    const tick=now=>{const progress=Math.min((now-start)/3500,1);render(30+45*progress);if(progress<1)frame=requestAnimationFrame(tick);else stop();};
    frame=requestAnimationFrame(tick);
  });
  motion.addEventListener('change',stop);
  render(50); controls.disabled=false;
}

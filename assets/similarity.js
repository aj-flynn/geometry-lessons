// Numeric checking must initialize before any interactive practice is exposed.
import './lesson.js?v=20261105-r9';
import { rectangleMetrics, rectangleDrawing, formatNumber } from './similarity-model.js';

function revealReadyRegion(owner) {
  const owners = '[data-similarity-explorer], [data-choice-quiz], form[data-practice]';
  for (const element of owner.querySelectorAll('[data-interactive-only], [data-static-only]')) {
    if (element.closest(owners) !== owner) continue;
    // Numeric comparisons are siblings of their form and belong to that binder.
    if (element.previousElementSibling?.matches('form[data-practice]')) continue;
    element.hidden = element.hasAttribute('data-static-only');
  }
}

const explorer = document.querySelector('[data-similarity-explorer]');
function initializeExplorer(explorer) {
  const slider = explorer.querySelector('[data-scale]');
  const shape = explorer.querySelector('[data-scaled-rectangle]');
  const widthLabel = explorer.querySelector('[data-width-label]');
  const heightLabel = explorer.querySelector('[data-height-label]');
  const description = explorer.querySelector('[data-diagram-description]');
  const play = explorer.querySelector('[data-play]');
  const pause = explorer.querySelector('[data-pause]');
  const reset = explorer.querySelector('[data-reset-scale]');
  const reduce = explorer.querySelector('[data-reduce-motion]');
  const status = explorer.querySelector('[data-motion-status]');
  if (![slider, shape, widthLabel, heightLabel, description, play, pause, reset, reduce, status].every(Boolean)) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  reduce.checked = preference.matches;
  const fields = Object.fromEntries([...explorer.querySelectorAll('[data-metric]')].map(el=>[el.dataset.metric,el]));

  function draw(scale) {
    const metrics = rectangleMetrics(scale);
    const rect = rectangleDrawing(scale);
    for (const [name,value] of Object.entries(rect)) shape.setAttribute(name,value);
    widthLabel.textContent = `${formatNumber(metrics.width)} cm`;
    widthLabel.setAttribute('x',rect.x+rect.width/2);
    widthLabel.setAttribute('y',rect.y-12);
    heightLabel.textContent = `${formatNumber(metrics.height)} cm`;
    heightLabel.setAttribute('x',rect.x+rect.width+12);
    heightLabel.setAttribute('y',rect.y+rect.height/2+7);
    for (const [key,el] of Object.entries(fields)) el.textContent = formatNumber(metrics[key]);
    slider.value = scale;
    slider.setAttribute('aria-valuetext',`Scale factor ${formatNumber(scale)}`);
    description.textContent = `The enlarged or reduced rectangle is ${formatNumber(metrics.width)} by ${formatNumber(metrics.height)} centimeters. Both dimensions scale by ${formatNumber(scale)}. Its perimeter is ${formatNumber(metrics.perimeter)} centimeters and area is ${formatNumber(metrics.area)} square centimeters.`;
  }
  function announce(prefix = 'Current example.') {
    const m=rectangleMetrics(Number(slider.value));
    status.textContent = `${prefix} Scale ${formatNumber(m.scale)}; perimeter factor ${formatNumber(m.scale)}; area factor ${formatNumber(m.areaFactor)}.`;
  }
  function stop() {
    if(frame!==null)cancelAnimationFrame(frame);
    frame=null;
    // A native range control rounds to its step; snap the paused diagram and
    // measurements to that same value before announcing them.
    draw(Number(slider.value));
    play.setAttribute('aria-pressed','false');
    pause.disabled=true;
  }
  slider.addEventListener('input',()=>{stop();draw(Number(slider.value));});
  slider.addEventListener('change',()=>announce());
  pause.addEventListener('click',()=>{stop();announce('Paused.');});
  reset.addEventListener('click',()=>{stop();draw(1.6);announce('Reset.');});
  play.addEventListener('click',()=>{
    stop();
    if(reduce.checked){draw(2.4);announce('Reduced motion: showing the end state.');return;}
    const started=performance.now();
    play.setAttribute('aria-pressed','true');pause.disabled=false;
    status.textContent='Playing one enlargement. Pause at any time.';
    const tick=now=>{
      const progress=Math.min((now-started)/4000,1);
      draw(0.8+1.6*progress);
      if(progress<1)frame=requestAnimationFrame(tick);
      else{stop();announce('Enlargement complete.');}
    };
    frame=requestAnimationFrame(tick);
  });
  reduce.addEventListener('change',()=>{stop();announce(reduce.checked?'Reduced motion on.':'Motion available.');});
  preference.addEventListener('change',event=>{stop();reduce.checked=event.matches;announce('Motion preference updated.');});
  draw(1.6);
  revealReadyRegion(explorer);
}
if (explorer) initializeExplorer(explorer);

for(const quiz of document.querySelectorAll('[data-choice-quiz]')) {
  const feedback=quiz.querySelector('[data-choice-feedback]');
  if (!feedback) continue;
  for(const button of quiz.querySelectorAll('button[data-choice]')) {
    button.addEventListener('click',()=>{
      feedback.textContent = button.dataset.choice===quiz.dataset.correct
        ? quiz.dataset.success : (button.dataset.hint || quiz.dataset.hint);
    });
  }
  revealReadyRegion(quiz);
}
for (const form of document.querySelectorAll('form[data-practice][data-practice-ready="true"]')) {
  form.hidden = false;
  const fallback = form.nextElementSibling;
  if (fallback?.matches('[data-static-only]')) fallback.hidden = true;
}

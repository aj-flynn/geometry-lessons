// Original practice and illustrative models only. All state lasts for this page visit.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
for (const form of document.querySelectorAll('[data-chem-choice]')) {
  const feedback = form.querySelector('.feedback');
  if (!feedback) continue;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector('input:checked');
    feedback.textContent = selected ? selected.dataset.explanation : 'Choose an option, then explain what evidence supports it.';
  });
  form.addEventListener('change', event => {
    if (event.target.matches('input[type="radio"]')) feedback.textContent = '';
  });
  // Only this form's feedback handler makes its controls and fallback ready.
  form.dataset.practiceReady = 'true';
  for (const button of form.querySelectorAll('button[type="submit"]')) button.disabled = false;
}
for (const model of document.querySelectorAll('[data-chem-steps]')) {
  const type = model.dataset.chemSteps;
  const notes = [...model.querySelectorAll('.step-notes li')];
  const status = model.querySelector('[data-step-status]');
  const play = model.querySelector('[data-play]');
  let step = 0, timer = null;
  function pause() { clearInterval(timer); timer = null; play.setAttribute('aria-pressed','false'); }
  function draw(announce=true) {
    if(announce) model.querySelector('.observations').open=true;
    for (const node of model.querySelectorAll('[data-stage]')) {
      if(model.dataset.exclusive !== undefined) node.style.display = Number(node.dataset.stage) === step ? 'inline' : 'none';
      else node.style.opacity = Number(node.dataset.stage) <= step ? '1' : '0';
    }
    model.querySelector('svg desc').textContent=notes[step].textContent;
    notes.forEach((note,i)=>note.classList.toggle('current-step',i===step));
    if(type==='separate') {
      const distance = step*45;
      model.querySelector('[data-molecule=left]').setAttribute('transform',`translate(${-distance} 0)`);
      model.querySelector('[data-molecule=right]').setAttribute('transform',`translate(${distance} 0)`);
      model.querySelector('[data-gap]').setAttribute('x1',String(315-distance));
      model.querySelector('[data-gap]').setAttribute('x2',String(345+distance));
    }
    if(announce) status.textContent=`Step ${step+1} of ${notes.length}. ${notes[step].textContent}`;
  }
  model.querySelector('.enhanced').hidden=false;
  model.querySelector('[data-step]').addEventListener('click',()=>{pause();step=(step+1)%notes.length;draw();});
  play.addEventListener('click',()=>{
    pause();
    if(motionPreference.matches){step=(step+1)%notes.length;draw();return;}
    if(step===notes.length-1)step=0;
    draw();play.setAttribute('aria-pressed','true');
    timer=setInterval(()=>{step++;draw();if(step===notes.length-1)pause();},2400);
  });
  model.querySelector('[data-pause]').addEventListener('click',pause);
  model.querySelector('[data-reset]').addEventListener('click',()=>{pause();step=0;draw();});
  motionPreference.addEventListener('change',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  draw(false);
}
for(const model of document.querySelectorAll('[data-polarity]')) {
  const slider=model.querySelector('input');
  const play=model.querySelector('[data-angle-play]');
  const output=model.querySelector('output');
  let frame=null;
  function pause(){if(frame!==null)cancelAnimationFrame(frame);frame=null;play.setAttribute('aria-pressed','false');}
  function draw(angle){
    const half=angle*Math.PI/360,dx=80*Math.sin(half),dy=80*Math.cos(half);
    for(const [side,sign] of [['left',-1],['right',1]]){
      const arrow=model.querySelector(`[data-vector=${side}]`);
      arrow.setAttribute('x2',String(300+sign*dx));arrow.setAttribute('y2',String(190-dy));
    }
    // Each unit contribution and the resultant use 80 SVG units per model unit.
    const net=2*Math.cos(half);
    const result=model.querySelector('[data-result]');
    result.setAttribute('y2',String(190-net*80));
    result.style.visibility=angle===180?'hidden':'visible';
    const text=`${Math.round(angle)} degrees; combined arrow length ${net.toFixed(2)} model units`;
    slider.value=String(angle);output.value=text;
    model.querySelector('svg desc').textContent=`Two equal unit arrows in the supplied geometry. ${text}. This is an abstract model, not a molecular shape prediction.`;
    model.querySelector('[data-vector-label]').textContent=angle===180?'180°: arrows cancel':`${Math.round(angle)}°: a combined effect remains`;
  }
  model.querySelector('.enhanced').hidden=false;
  slider.addEventListener('input',()=>{pause();draw(Number(slider.value));});
  play.addEventListener('click',()=>{
    pause();
    if(motionPreference.matches){draw(90);return;}
    const from=Number(slider.value),start=performance.now();play.setAttribute('aria-pressed','true');
    const tick=now=>{const t=Math.min((now-start)/2400,1);draw(from+(90-from)*t);if(t<1)frame=requestAnimationFrame(tick);else pause();};
    frame=requestAnimationFrame(tick);
  });
  model.querySelector('[data-angle-pause]').addEventListener('click',pause);
  model.querySelector('[data-angle-reset]').addEventListener('click',()=>{pause();draw(180);});
  motionPreference.addEventListener('change',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  draw(180);
}

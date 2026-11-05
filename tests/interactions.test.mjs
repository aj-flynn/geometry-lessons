import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const code = readFileSync(new URL('../assets/lesson.js',import.meta.url),'utf8');

function control(initial={}) {
  return Object.assign({
    attributes:{},listeners:{},dataset:{},value:'',textContent:'',
    setAttribute(name,value){this.attributes[name]=String(value);},
    addEventListener(name,fn){this.listeners[name]=fn;},
    fire(name){this.listeners[name]?.({preventDefault(){}});}
  },initial);
}

test('angle explorer keeps rays accurate as keyboard/input values change and stops motion',()=>{
  const slider=control({min:'20',max:'160',value:'60'});
  const ray=control(),arc=control(),label=control(),output=control();
  const replay=control(),stop=control(),reset=control();
  const controls={'input[type="range"]':slider,'[data-ray]':ray,'[data-arc]':arc,'[data-angle-label]':label,'output':output,'[data-replay]':replay,'[data-stop]':stop,'[data-reset]':reset};
  const explorer={querySelector:selector=>controls[selector]};
  const reduced=control({matches:false});
  let callback, cancelled=0;
  vm.runInNewContext(code,{
    document:{querySelectorAll:selector=>selector==='[data-angle-explorer]'?[explorer]:[]},
    matchMedia:()=>reduced,performance:{now:()=>0},
    requestAnimationFrame:fn=>{callback=fn;return 1;},cancelAnimationFrame:()=>{cancelled++;callback=null;}
  });
  assert.equal(label.textContent,'60°');
  assert.ok(Math.abs(Number(ray.attributes.x2)-250)<0.01);
  assert.ok(Math.abs(Number(ray.attributes.y2)-98.76)<0.01);
  slider.value='90';slider.fire('input');
  assert.equal(ray.attributes.x2,'180.00');
  assert.equal(ray.attributes.y2,'80.00');
  assert.equal(output.value,'90 degrees');
  replay.fire('click');assert.equal(replay.attributes['aria-pressed'],'true');
  callback(650);assert.equal(label.textContent,'40°');
  stop.fire('click');assert.ok(cancelled>0);assert.equal(replay.attributes['aria-pressed'],'false');
  reset.fire('click');assert.equal(label.textContent,'60°');
  reduced.matches=true;replay.fire('click');
  assert.equal(label.textContent,'60°');assert.equal(replay.attributes['aria-pressed'],'false');
});

test('practice gives local feedback for fresh examples without revealing expected values',()=>{
  const input=control(),feedback=control(),submit=control({disabled:true});
  const form=control({dataset:{expected:'6',hint:'Recall the relationship.',success:'Explain why it fits.'},querySelector:selector=>({'input':input,'[data-feedback]':feedback,'button[type="submit"]':submit})[selector]});
  form.addEventListener=(name,handler)=>{assert.equal(submit.disabled,true);assert.equal(form.dataset.practiceReady,undefined);form.listeners[name]=handler;};
  const unavailableSubmit=control({disabled:true});
  const unavailable=control({querySelector:selector=>selector==='button[type="submit"]'?unavailableSubmit:null});
  vm.runInNewContext(code,{document:{querySelectorAll:selector=>selector==='form[data-practice]'?[form,unavailable]:[]},matchMedia:()=>({matches:true})});
  assert.equal(submit.disabled,false);
  assert.equal(form.dataset.practiceReady,'true');
  assert.equal(unavailableSubmit.disabled,true);
  assert.equal(unavailable.dataset.practiceReady,undefined);
  let prevented=false;
  form.listeners.submit({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  input.value='';form.fire('submit');assert.match(feedback.textContent,/Enter a number/);
  input.value='5';form.fire('submit');assert.equal(feedback.textContent,'Recall the relationship.');
  assert.doesNotMatch(feedback.textContent,/6/);
  input.value='6';form.fire('submit');assert.equal(feedback.textContent,'Explain why it fits.');
  form.dataset.mistakes='{"3":"You used half the required factor. Revisit the direction."}';
  input.value='3';form.fire('submit');assert.equal(feedback.textContent,'You used half the required factor. Revisit the direction.');
  form.dataset.mistakes='invalid JSON';input.value='5';form.fire('submit');assert.equal(feedback.textContent,'Recall the relationship.');
  form.dataset.expected='invalid';form.fire('submit');assert.match(feedback.textContent,/unavailable/);
});


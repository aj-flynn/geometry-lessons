import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('deep links reveal their path and print expands then restores all disclosures',()=>{
  const detail=(open,name=null,parentElement=null)=>({tagName:'DETAILS',open,parentElement,attrs:{name},getAttribute(k){return this.attrs[k]??null;},removeAttribute(k){delete this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;}});
  const first=detail(true,'geometry-path'),second=detail(false,'geometry-path'),hint=detail(false,null,second);
  const heading={tagName:'H2',parentElement:hint};
  const events={},docEvents={};
  const document={getElementById:id=>id==='target'?heading:null,querySelectorAll:()=>[first,second,hint],addEventListener:(k,f)=>docEvents[k]=f};
  const window={addEventListener:(k,f)=>events[k]=f};
  const location={hash:'#target'};
  vm.runInNewContext(readFileSync(new URL('../assets/geometry-paths.js',import.meta.url),'utf8'),{document,window,location});
  assert.equal(second.open,true);assert.equal(hint.open,true);
  second.open=false;hint.open=false;
  docEvents.click({target:{closest:()=>({getAttribute:()=> '#target'})}});
  assert.equal(second.open,true);assert.equal(hint.open,true);
  hint.open=false;
  events.beforeprint();events.beforeprint();
  assert.ok([first,second,hint].every(x=>x.open&&x.getAttribute('name')===null));
  events.afterprint();
  assert.equal(hint.open,false);assert.equal(second.open,true);assert.equal(first.getAttribute('name'),'geometry-path');
  location.hash='#%malformed';assert.doesNotThrow(()=>events.hashchange());
  location.hash='#missing';assert.doesNotThrow(()=>events.hashchange());
});

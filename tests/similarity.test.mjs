import test from 'node:test';
import assert from 'node:assert/strict';
import {rectangleMetrics,rectangleDrawing,formatNumber} from '../assets/similarity-model.js';

test('linear measurements and perimeter scale once; area scales twice',()=>{
  const base=rectangleMetrics(1);
  for(const scale of [0.8,1,1.6,1.7,2.4]){
    const m=rectangleMetrics(scale);
    assert.ok(Math.abs(m.width/base.width-scale)<1e-12);
    assert.ok(Math.abs(m.height/base.height-scale)<1e-12);
    assert.ok(Math.abs(m.perimeter/base.perimeter-scale)<1e-12);
    assert.ok(Math.abs(m.area/base.area-scale*scale)<1e-12);
    assert.ok(Math.abs(m.width/m.height-base.width/base.height)<1e-12);
  }
  const initial=rectangleMetrics(1.6);
  assert.equal(formatNumber(initial.width),'20.8');
  assert.equal(formatNumber(initial.height),'14.4');
  assert.equal(formatNumber(initial.perimeter),'70.4');
  assert.equal(formatNumber(initial.area),'299.52');
  assert.equal(formatNumber(23*(27.2/17)),'36.8');
  assert.equal(formatNumber(rectangleMetrics(1.7).areaFactor),'2.89');
});

test('drawn rectangles preserve their mathematical aspect ratio and remain inside the viewport',()=>{
  for(const scale of [0.8,1,1.6,2.4]){
    const r=rectangleDrawing(scale);
    assert.ok(Math.abs(r.width/r.height-13/9)<1e-12);
    assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<360&&r.y+r.height<300);
    assert.equal(r.y+r.height,240);
  }
  for(const scale of [0,-1,Infinity,NaN])assert.throws(()=>rectangleMetrics(scale),RangeError);
});


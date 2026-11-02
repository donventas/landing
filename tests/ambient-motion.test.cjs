'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
function harness(reducedMotion) {
  let intersect, click;
  const video = {id:'home', src:'', dataset:{src:'/background.mp4'}, paused:true, classList:{add(){},remove(){}}, addEventListener(){}, load(){}, pause(){this.paused=true}, play(){this.paused=false}};
  const button = {hidden:true, setAttribute(n,v){this[n]=v}, addEventListener(n,fn){click=fn}};
  const reduced = {matches:reducedMotion, addEventListener(){}};
  class IntersectionObserver { constructor(fn){intersect=fn} observe(){} }
  class MutationObserver { observe(){} }
  const document = {documentElement:{dataset:{}}, hidden:false, querySelectorAll:()=>[video], querySelector:()=>button, addEventListener(){}};
  vm.runInNewContext(fs.readFileSync('variantes/b/hero-video-variante-b.js','utf8'), {document, navigator:{}, matchMedia:()=>reduced, IntersectionObserver, MutationObserver});
  return {video,button,visible(){intersect([{target:video,isIntersecting:true}])},click(){click()}};
}
test('background starts when visible and the control pauses and resumes it',()=>{const h=harness(false);h.visible();assert.equal(h.video.paused,false);h.click();assert.equal(h.video.paused,true);h.click();assert.equal(h.video.paused,false)});
test('reduced motion starts on the still image but allows an explicit play',()=>{const h=harness(true);h.visible();assert.equal(h.video.src,'');assert.equal(h.video.paused,true);assert.equal(h.button.hidden,false);h.click();assert.equal(h.video.src,'/background.mp4');assert.equal(h.video.paused,false);h.click();assert.equal(h.video.paused,true)});

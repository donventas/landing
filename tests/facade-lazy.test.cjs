const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('mobile facade waits for user action before requesting video',()=>{
 let observed,click;const listeners={};const video={src:'',dataset:{src:'/facade.mp4'},paused:true,classList:{add(){},remove(){}},addEventListener(){},pause(){this.paused=true},load(){},play(){this.paused=false}};const button={hidden:true,setAttribute(n,v){this[n]=v},addEventListener(n,fn){click=fn}};const reduced={matches:false,addEventListener(){}},mobile={matches:true,addEventListener(){}};const root={dataset:{}};
 class IntersectionObserver{constructor(fn){observed=fn}observe(){}} class MutationObserver{observe(){}}
 const document={querySelector:s=>s==='#facade-motion'?video:button,documentElement:root,hidden:false,addEventListener(n,fn){listeners[n]=fn}};
 vm.runInNewContext(fs.readFileSync('variantes/b/fachada-motion-b01.js','utf8'),{document,matchMedia:q=>q.includes('max-width')?mobile:reduced,window:{IntersectionObserver},IntersectionObserver,MutationObserver});
 observed([{isIntersecting:true}]);assert.equal(video.src,'');assert.equal(button['aria-label'],'Reproducir video de la fachada');click();assert.equal(video.src,'/facade.mp4');assert.equal(video.paused,false);click();assert.equal(video.paused,true);
});

(()=>{
  'use strict';
  const v=document.querySelector('#facade-motion'),button=document.querySelector('#facade-motion-toggle');
  if(!v||!button)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:680px)'),root=document.documentElement;
  let visible=false,userPaused=false,userRequested=false;
  const update=()=>{
    const reducedMotion=reduced.matches||root.dataset.motion==='reduce';
    const wantsPlayback=!userPaused&&(!mobile.matches||userRequested);
    const allowed=visible&&!document.hidden&&!reducedMotion&&wantsPlayback;
    button.hidden=reducedMotion;
    button.textContent=wantsPlayback?'❚❚  Pausar':'▶  Reproducir';
    button.setAttribute('aria-label',wantsPlayback?'Pausar video de la fachada':'Reproducir video de la fachada');
    if(!allowed){v.pause();if(reducedMotion)v.classList.remove('is-playing');return}
    if(!v.src){v.src=v.dataset.src;v.load()}
    const result=v.play();if(result&&result.catch)result.catch(()=>{v.classList.remove('is-playing');userPaused=true;update()});
  };
  v.addEventListener('playing',()=>v.classList.add('is-playing'));
  v.addEventListener('error',()=>{v.classList.remove('is-playing');button.hidden=true});
  button.addEventListener('click',()=>{if(v.paused){userRequested=true;userPaused=false}else userPaused=true;update()});
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()},{threshold:.15}).observe(v)}
  else {visible=true;update()}
  reduced.addEventListener('change',update);mobile.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['data-motion']});
})();

(()=>{
  'use strict';
  const v=document.querySelector('#facade-motion'),button=document.querySelector('#facade-motion-toggle');
  if(!v||!button)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),root=document.documentElement;
  let visible=false,paused=false;
  const update=()=>{
    const allowed=visible&&!document.hidden&&!reduced.matches&&root.dataset.motion!=='reduce'&&!paused;
    button.hidden=reduced.matches||root.dataset.motion==='reduce';
    button.textContent=paused?'▶  Reproducir':'❚❚  Pausar';
    button.setAttribute('aria-label',paused?'Reproducir video de la fachada':'Pausar video de la fachada');
    if(!allowed){v.pause();if(reduced.matches||root.dataset.motion==='reduce')v.classList.remove('is-playing');return}
    if(!v.src){v.src=v.dataset.src;v.load()}
    const result=v.play();if(result&&result.catch)result.catch(()=>{v.classList.remove('is-playing');paused=true;update()});
  };
  v.addEventListener('playing',()=>v.classList.add('is-playing'));
  v.addEventListener('error',()=>{v.classList.remove('is-playing');button.hidden=true});
  button.addEventListener('click',()=>{paused=!paused;update()});
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()},{threshold:.15}).observe(v)}
  else {visible=true;update()}
  reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['data-motion']});
})();

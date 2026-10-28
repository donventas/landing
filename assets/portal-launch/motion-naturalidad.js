(()=>{'use strict';
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const enabled=()=>!reduce.matches&&root.dataset.motion!=='reduce';
 if('IntersectionObserver' in window){
  const observed=document.querySelectorAll('.moment-grid article,.work-sequence li,.portal-foundations>div,.editorial-help .two-paths article,.waitlist-entry');
  const obs=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;if(enabled())e.target.animate([{transform:'translateY(16px)',opacity:.82},{transform:'translateY(0)',opacity:1}],{duration:500,easing:'cubic-bezier(.2,.7,.25,1)'});obs.unobserve(e.target)}},{threshold:.22});
  observed.forEach(el=>obs.observe(el));
  if(matchMedia('(hover:none)').matches){const steps=[...document.querySelectorAll('.moment-grid article,.work-sequence li')];const active=new IntersectionObserver(entries=>{for(const e of entries){if(!enabled()){e.target.classList.remove('is-current');continue}e.target.classList.toggle('is-current',e.isIntersecting)}},{rootMargin:'-35% 0px -35% 0px',threshold:0});steps.forEach(el=>active.observe(el));new MutationObserver(()=>{if(!enabled())steps.forEach(el=>el.classList.remove('is-current'))}).observe(root,{attributes:true,attributeFilter:['data-motion']});}
 }
})();

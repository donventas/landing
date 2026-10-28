(() => {
 'use strict';
 const root=document.documentElement;
 const frame=document.getElementById('case-frame'),frames={web:frame},preference=matchMedia('(prefers-reduced-motion:reduce)');
 // Measure the card content, not the iframe viewport: it must shrink as well as grow.
 let cardObserver;
 function fitCard(){const f=frames.tarjeta;if(!f||f.hidden)return;const cards=f.contentDocument?.querySelector('.card-family');if(!cards)return;const height=Math.ceil(cards.getBoundingClientRect().height);if(height>0&&height<10000)f.style.height=`${height}px`;}
 function watchCard(){cardObserver?.disconnect();const cards=frames.tarjeta?.contentDocument?.querySelector('.card-family');if(!cards)return;cardObserver=new ResizeObserver(fitCard);cardObserver.observe(cards);frames.tarjeta.contentDocument.fonts.ready.then(fitCard);fitCard();}
 addEventListener('resize',fitCard);
 function motion(){const off=preference.matches;root.dataset.motion=off?'reduce':'full';Object.values(frames).forEach(f=>f.contentWindow?.postMessage({type:'dv-motion',reduce:off},location.origin));if(off)document.getAnimations().forEach(a=>a.cancel());}
 preference.addEventListener('change',motion);frame.addEventListener('load',motion);motion();
 // One-shot entrance and scene reveal; no scroll hijack or hidden essential copy.
 const heroCopy=document.querySelector('.hero-editorial-copy'),panorama=document.querySelector('.hero-panorama');
 const allowMotion=()=>root.dataset.motion!=='reduce'&&!preference.matches;
 if(allowMotion())heroCopy.animate([{transform:'translateY(12px)'},{transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.2,.7,.3,1)'});
 const sceneReveal=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;if(allowMotion())panorama.animate([{clipPath:'inset(0 5% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'});sceneReveal.disconnect();}},{threshold:.25});
 sceneReveal.observe(panorama);
 const editorialReveal=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;if(allowMotion())entry.target.animate([{transform:'translateY(10px)'},{transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.2,.7,.3,1)'});editorialReveal.unobserve(entry.target);}},{threshold:.15});
 document.querySelectorAll('[data-editorial-reveal]').forEach(section=>editorialReveal.observe(section));
 const descriptions={web:'Web: prueba «Preparar mi consulta», elige una o varias necesidades y revisa el resumen ficticio. No envía ni guarda datos.',propuesta:'Propuesta: contexto de un grupo, trabajo pertinente y siguiente paso. No es una cotización ni promete disponibilidad.',tarjeta:'Tarjeta: una cara comunica cuidado; la otra organiza el historial. Maqueta conceptual, no arte listo para imprenta.'};
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
   if(button.getAttribute('aria-pressed')==='true')return;
   const key=button.dataset.view;
   if(!Object.hasOwn(descriptions,key))return;
   document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   if(!frames[key]){const f=document.createElement('iframe');f.src=`/variantes/b/vuelta-27/?embed=${key}`;f.title=`Demo de ${key} de Vuelta 27, marca ficticia`;f.id=`case-frame-${key}`;f.addEventListener('load',motion);if(key==='tarjeta')f.addEventListener('load',watchCard);frames[key]=f;frame.parentElement.append(f);}
   Object.entries(frames).forEach(([id,f])=>{f.hidden=id!==key;});
   document.querySelector('.window-label span:last-child').textContent=key==='tarjeta'?'FRENTE Y REVERSO · VISTA COMPLETA':'DESPLÁZATE DENTRO PARA EXPLORAR ↓';
   if(key==='tarjeta')requestAnimationFrame(fitCard);
   document.getElementById('view-description').textContent=descriptions[key];document.getElementById('open-demo').href=`/variantes/b/vuelta-27/#${key}`;
 }));

})();

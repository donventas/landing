(() => {
  'use strict';
  const embedded=new URLSearchParams(location.search).get('embed');
  if(['web','propuesta','tarjeta'].includes(embedded)) document.documentElement.dataset.embed=embedded;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reduced.matches || document.documentElement.dataset.motion === 'reduce';
  function enter(el) { if (!motionOff()) el.animate([{transform:'translateY(8px)'},{transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.2,.7,.3,1)'}); }
  const form = document.getElementById('bike-form');
  const result = document.getElementById('bike-result');
  const error = document.getElementById('need-error');
  const status = document.getElementById('bike-status');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    if (!data.get('need')) { error.hidden=false; form.querySelectorAll('[name=need]').forEach(e=>{e.setAttribute('aria-invalid','true');e.setAttribute('aria-describedby','need-error');}); form.querySelector('[name=need]').focus(); return; }
    error.hidden=true;
    const summary=document.getElementById('bike-summary'); summary.replaceChildren();
    for(const [label,value] of [['Necesidad',data.get('need')],['Bicicleta',data.get('bike')],['Fecha deseada · sin confirmar',data.get('when')],['Contexto',String(data.get('notes')||'Sin observaciones adicionales').trim()||'Sin observaciones adicionales']]){
      const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);summary.append(row);
    }
    form.hidden=true;result.hidden=false;enter(result);document.getElementById('bike-result-title').focus();status.textContent='Resumen preparado solo en esta página. No se ha enviado ni guardado.';
  });
  form.addEventListener('change',()=>{if(form.querySelector('[name=need]:checked')){error.hidden=true;form.querySelectorAll('[name=need]').forEach(e=>{e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby');});}});
  document.getElementById('edit-bike').addEventListener('click',()=>{result.hidden=true;form.hidden=false;enter(form);(form.querySelector('[name=need]:checked')||form.querySelector('[name=need]')).focus();status.textContent='Puedes editar tus respuestas. Se conservan mientras esta página permanece abierta.';});
  document.getElementById('reset-bike').addEventListener('click',()=>{form.reset();result.hidden=true;form.hidden=false;document.getElementById('bike-summary').replaceChildren();form.querySelector('[name=need]').focus();status.textContent='Ejemplo borrado.';});
  document.querySelector('.shop-hero .v27-button').addEventListener('click',()=>{document.getElementById('consulta').open=true;requestAnimationFrame(()=>form.hidden?document.getElementById('bike-result-title').focus():form.querySelector('[name=need]').focus());});
  // Decorative track follows measured reading regions, never the other way round.
  const body=document.querySelector('.proposal-body'),steps=document.querySelector('.proposal-steps');
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('proposal-route');svg.setAttribute('aria-hidden','true');body.prepend(svg);
  function drawRoute(){
    const b=body.getBoundingClientRect(),s=steps.getBoundingClientRect(),mobile=matchMedia('(max-width:680px)').matches;
    if(!b.width||!b.height)return;
    const p=parseFloat(getComputedStyle(body).paddingLeft),x=mobile?s.left-b.left:b.width/2,top=mobile?s.top-b.top:s.top-b.top-p,right=b.width-p,bottom=b.height-p,r=Math.min(p,30),end=top+Math.min(s.height*.5,150);
    svg.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);svg.replaceChildren();
    for(const offset of [-4,0,4]){
      const a=x+offset,t=top+offset,z=right-offset,y=bottom-offset;
      const d=mobile?`M ${a} ${b.height-p} V ${t+r} Q ${a} ${t} ${a+r} ${t} H ${z-r} Q ${z} ${t} ${z} ${t+r} V ${end}`:`M 0 ${y} H ${a-r} Q ${a} ${y} ${a} ${y-r} V ${t+r} Q ${a} ${t} ${a+r} ${t} H ${z-r} Q ${z} ${t} ${z} ${t+r} V ${end}`;
      for(const cls of ['route-shadow','route-light','route-center']){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class',cls);svg.append(path);}
    }
  }
  const observer=new ResizeObserver(drawRoute);observer.observe(body);observer.observe(steps);document.fonts.ready.then(drawRoute);
  addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='dv-motion')return;document.documentElement.dataset.motion=event.data.reduce?'reduce':'full';if(event.data.reduce)document.getAnimations().forEach(a=>a.cancel());});
})();

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
  const bikeSteps=[...form.querySelectorAll('[data-bike-step]')],progress=form.querySelector('[data-bike-progress]'),next=form.querySelector('[data-bike-next]'),back=form.querySelector('[data-bike-back]'),example=document.getElementById('bike-example');
  const examples={'Mantenimiento general':'Por ejemplo: hace tiempo que no revisan la bicicleta.','Frenos o cambios':'Por ejemplo: el freno delantero hace ruido al bajar.','Preparar una salida':'Por ejemplo: quieres revisar la bici antes de una rodada.','Necesito orientación':'Por ejemplo: no sabes qué conviene revisar primero.'};
  function show(index,focus=true){bikeSteps.forEach((step,i)=>step.hidden=i!==index);progress.textContent=index?'02 / 02 · TU BICICLETA':'01 / 02 · LO QUE NECESITAS';if(focus)bikeSteps[index].querySelector('legend,h4').focus();}
  function update(){const selected=[...form.querySelectorAll('[name=need]:checked')];if(selected.length){error.hidden=true;form.querySelectorAll('[name=need]').forEach(e=>{e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby');});}example.textContent=selected.length===1?examples[selected[0].value]:'Por ejemplo: cuéntanos qué te gustaría revisar.';}
  function valid(){if(form.querySelector('[name=need]:checked'))return true;error.hidden=false;form.querySelectorAll('[name=need]').forEach(e=>{e.setAttribute('aria-invalid','true');e.setAttribute('aria-describedby','need-error');});form.querySelector('[name=need]').focus();return false;}
  progress.hidden=false;next.hidden=false;back.hidden=false;show(0,false);form.addEventListener('change',update);
  next.addEventListener('click',()=>{if(valid())show(1);});back.addEventListener('click',()=>show(0));
  form.addEventListener('submit', event => {
    event.preventDefault();if(!valid()){show(0,false);form.querySelector('[name=need]').focus();return;}
    const data=new FormData(form),summary=document.getElementById('bike-summary');summary.replaceChildren();
    for(const [label,value] of [['Necesidad',data.getAll('need').join(', ')],['Bicicleta',data.get('bike')],['Fecha deseada · sin confirmar',data.get('when')],['Contexto',String(data.get('notes')||'Sin observaciones adicionales').trim()||'Sin observaciones adicionales']]){
      const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);summary.append(row);
    }
    form.hidden=true;result.hidden=false;enter(result);document.getElementById('bike-result-title').focus();status.textContent='Resumen preparado solo en esta página. No se ha enviado ni guardado.';
  });
  document.getElementById('edit-bike').addEventListener('click',()=>{result.hidden=true;form.hidden=false;show(0);enter(form);status.textContent='Puedes editar tus respuestas. Se conservan mientras esta página permanece abierta.';});
  document.getElementById('reset-bike').addEventListener('click',()=>{form.reset();result.hidden=true;form.hidden=false;document.getElementById('bike-summary').replaceChildren();error.hidden=true;update();show(0);status.textContent='Ejemplo borrado.';});
  document.querySelector('.shop-hero .v27-button').addEventListener('click',()=>{document.getElementById('consulta').open=true;requestAnimationFrame(()=>form.hidden?document.getElementById('bike-result-title').focus():(bikeSteps.find(s=>!s.hidden).querySelector('legend,h4')).focus());});
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

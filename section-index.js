/* Progressive enhancement: disclosure and section links remain native HTML. */
(function(){
 'use strict';
 var index=document.querySelector('[data-section-index]');
 if(!index)return;
 var summary=index.querySelector('summary'),current=index.querySelector('.section-index-current');
 // Google Traducción puede convertir los fragmentos en URL absolutas.
 var links=Array.from(index.querySelectorAll('nav a[href]')).filter(function(a){
  try{var u=new URL(a.href,location.href);return !!u.hash&&u.origin===location.origin&&u.pathname===location.pathname&&!!document.getElementById(decodeURIComponent(u.hash.slice(1)));}catch(_){return false;}
 });
 var targets=links.map(function(a){return document.getElementById(decodeURIComponent(a.hash.slice(1)));});
 var header=document.querySelector('.editorial-nav,.nav');
 var offset=0,scheduled=false;
 document.body.classList.add('section-index-enhanced','manual-enhanced');
 function measure(){
  offset=header&&['fixed','sticky'].includes(getComputedStyle(header).position)?Math.ceil(header.getBoundingClientRect().height):0;
  document.body.style.setProperty('--section-nav',offset+'px');
  document.body.style.setProperty('--manual-nav',offset+'px');
  document.body.style.setProperty('--section-bar',Math.ceil(summary.getBoundingClientRect().height)+'px');
 }
 function update(){
  var active=-1,limit=offset+summary.getBoundingClientRect().height+100;
  targets.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<=limit)active=i;});
  links.forEach(function(a,i){if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  var lang=new URLSearchParams(location.search).get('_x_tr_tl');
  var words={en:'sections',fr:'sections',pt:'seções',de:'Abschnitte',it:'sezioni',bg:'раздела',ja:'セクション', 'zh-CN':'个部分',ar:'أقسام'};
  current.textContent=active<0?links.length+' '+(location.hostname.endsWith('.translate.goog')&&words[lang]||'secciones'):links[active].textContent.trim().replace(/^(\d{2})/,'$1 · ');
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;measure();update();});}
 measure();update();
 if('ResizeObserver' in window){var observer=new ResizeObserver(schedule);if(header)observer.observe(header);observer.observe(summary);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 index.addEventListener('click',function(e){
  var link=e.target.closest('a[href]');if(!link||links.indexOf(link)<0||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  index.open=false;
  var target=targets[links.indexOf(link)];
  if(target){
   e.preventDefault();
   history.pushState(null,'',location.pathname+location.search+link.hash);
   target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  var title=target&&(target.matches('h1,h2,h3')?target:target.querySelector('h2,h3'));
  if(title)requestAnimationFrame(function(){
   var reveal=title.closest('.reveal');if(reveal)reveal.classList.add('in');
   var previous=title.getAttribute('tabindex');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});
   title.addEventListener('blur',function(){if(previous===null)title.removeAttribute('tabindex');else title.setAttribute('tabindex',previous);},{once:true});
  });
 });
 index.addEventListener('keydown',function(e){if(e.key==='Escape'&&index.open){e.preventDefault();index.open=false;summary.focus({preventScroll:true});}});
 document.addEventListener('click',function(e){if(index.open&&!index.contains(e.target))index.open=false;});
})();

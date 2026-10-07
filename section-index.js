/* Progressive enhancement: disclosure and section links remain native HTML. */
(function(){
 'use strict';
 var index=document.querySelector('[data-section-index]');
 if(!index)return;
 var summary=index.querySelector('summary'),current=index.querySelector('.section-index-current');
 var links=Array.from(index.querySelectorAll('a[href^="#"]'));
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
  current.textContent=active<0?links.length+' secciones':links[active].textContent.trim().replace(/^(\d{2})/,'$1 · ');
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;measure();update();});}
 measure();update();
 if('ResizeObserver' in window){var observer=new ResizeObserver(schedule);if(header)observer.observe(header);observer.observe(summary);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 index.addEventListener('click',function(e){
  var link=e.target.closest('a[href^="#"]');if(!link||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  index.open=false;
  var target=targets[links.indexOf(link)];
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

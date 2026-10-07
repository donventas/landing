/* Enhancement only: native disclosure and anchors work without JavaScript. */
(function(){
 'use strict';
 var index=document.querySelector('[data-manual-index]');
 if(!index)return;
 document.body.classList.add('manual-enhanced');
 var summary=index.querySelector('summary'),current=index.querySelector('.manual-index-current');
 var links=Array.from(index.querySelectorAll('a[href^="#"]'));
 var sections=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
 var nav=document.querySelector('.nav');
 function navHeight(){document.body.style.setProperty('--manual-nav',Math.ceil(nav.getBoundingClientRect().height)+'px');}
 navHeight();
 if('ResizeObserver' in window)new ResizeObserver(navHeight).observe(nav);
 function update(){
  var limit=nav.getBoundingClientRect().height+index.getBoundingClientRect().height+100;
  var active=-1;
  sections.forEach(function(s,i){if(s.getBoundingClientRect().top<=limit)active=i;});
  links.forEach(function(a,i){if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  current.textContent=active<0?'7 secciones':links[active].textContent.trim().replace(/^(\d{2})/, '$1 · ');
 }
 var scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;update();});}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
 index.addEventListener('click',function(e){
  var link=e.target.closest('a[href^="#"]');if(!link)return;
  index.open=false;
  var title=document.querySelector(link.getAttribute('href')+' h2');
  if(title)requestAnimationFrame(function(){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});title.addEventListener('blur',function(){title.removeAttribute('tabindex');},{once:true});});
 });
 index.addEventListener('keydown',function(e){if(e.key==='Escape'&&index.open){e.preventDefault();index.open=false;summary.focus({preventScroll:true});}});
 document.addEventListener('click',function(e){if(index.open&&!index.contains(e.target))index.open=false;});
})();

(()=>{'use strict';
if(document.documentElement.dataset.embed)return;
const nav=document.querySelector('.vuelta-app-nav'),button=document.querySelector('.vuelta-return');
if(!nav||!button)return;
let pending=false;
function update(){pending=false;const active=document.querySelector('#web:not([data-vuelta-hidden]),#propuesta:not([data-vuelta-hidden]),#tarjeta:not([data-vuelta-hidden]),#coleccion:not([data-vuelta-hidden])');if(!active){button.hidden=true;return}const rect=active.getBoundingClientRect();button.hidden=!(nav.getBoundingClientRect().bottom<0&&rect.top<innerHeight&&rect.bottom>0)}
function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
button.addEventListener('click',()=>{const active=nav.querySelector('[aria-current]');nav.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});if(active)active.focus({preventScroll:true})});
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('hashchange',schedule);document.addEventListener('click',schedule);update();
})();

/* One native report source: enlarge without cloning text or changing layout. */
(function(){
 'use strict';
 var dialog=document.getElementById('report-zoom');
 if(!dialog||typeof dialog.showModal!=='function')return;
 var stage=dialog.querySelector('.report-zoom-stage'),sheet,origin,opener;
 document.querySelectorAll('[data-report-open]').forEach(function(button){
  button.hidden=false;
  button.addEventListener('click',function(){
   sheet=document.getElementById(button.dataset.reportOpen);
   if(!sheet||dialog.open)return;
   origin=sheet.parentElement;opener=button;stage.appendChild(sheet);
   document.body.classList.add('report-zoom-open');dialog.showModal();
   dialog.querySelector('.report-zoom-scroll').scrollTo(0,0);
  });
 });
 dialog.addEventListener('close',function(){
  if(sheet&&origin)origin.appendChild(sheet);
  document.body.classList.remove('report-zoom-open');
  if(opener)opener.focus({preventScroll:true});
  sheet=origin=opener=null;
 });
})();

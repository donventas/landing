// Interacciones de revisión: sin analytics ni envío automático de datos.
document.querySelectorAll('.relief').forEach(mark=>{
  const depth=mark.querySelector('img').cloneNode();depth.alt='';depth.className='depth';depth.setAttribute('aria-hidden','true');mark.prepend(depth);
});
const picker=[...document.querySelectorAll('[data-project]')];
function choose(button){picker.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==button.dataset.project);}
picker.forEach((button,i)=>{button.addEventListener('click',()=>choose(button));button.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=(i+1)%picker.length;if(event.key==='ArrowLeft')index=(i+picker.length-1)%picker.length;if(event.key==='Home')index=0;if(event.key==='End')index=picker.length-1;if(index!==undefined){event.preventDefault();picker[index].focus();choose(picker[index]);}});});
const dialog=document.getElementById('contact');const application=document.getElementById('application');const design=document.getElementById('design-state');const link=document.getElementById('whatsapp-link');let opener;
function update(){const message=`Hola, vi la propuesta de colaboración entre Creactiva y Don Ventas. Me interesa: ${application.value}. ${design.value}. Me gustaría revisar el alcance y la cotización de mi proyecto.`;link.href=`https://wa.me/529991690908?text=${encodeURIComponent(message)}`;}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{opener=button;application.value=button.dataset.interest||'Quiero orientación';update();dialog.showModal();document.body.classList.add('modal-open');}));
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus();});
application.addEventListener('change',update);design.addEventListener('change',update);document.getElementById('contact-form').addEventListener('submit',event=>event.preventDefault());update();

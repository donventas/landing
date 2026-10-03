(function(){
  var bar=document.querySelector('[data-reading-progress]');
  if(bar){
    var update=function(){
      var doc=document.documentElement;
      var total=Math.max(1,doc.scrollHeight-window.innerHeight);
      bar.style.width=Math.min(100,Math.max(0,(window.scrollY/total)*100))+'%';
    };
    update();
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update);
  }
  var links=[].slice.call(document.querySelectorAll('[data-article-toc] a'));
  if(!links.length||!('IntersectionObserver' in window))return;
  var byId={};
  links.forEach(function(link){byId[link.getAttribute('href').slice(1)]=link;});
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      links.forEach(function(link){link.classList.remove('active');});
      if(byId[entry.target.id])byId[entry.target.id].classList.add('active');
    });
  },{rootMargin:'-20% 0px -68% 0px',threshold:0});
  Object.keys(byId).forEach(function(id){var section=document.getElementById(id);if(section)observer.observe(section);});
})();

(function(){
  var entries=[].slice.call(document.querySelectorAll('[data-blog-entry]'));
  if(!entries.length)return;
  entries.forEach(function(link){
    link.addEventListener('click',function(){
      if(typeof window.va!=='function')return;
      window.va('event',{name:'blog_path_selected',data:{path:link.getAttribute('data-blog-entry')}});
    });
  });
})();


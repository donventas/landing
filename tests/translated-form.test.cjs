const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
test('translated forms never submit through proxy and link directly to official site', () => {
 const source=fs.readFileSync('assets/portal-launch/forms.js','utf8'), opened=[];
 const notices=[0,1].map(()=>({hidden:true,textContent:'',appendChild(v){this.link=v;}}));
 const forms=['waitlist','contact'].map((kind,i)=>({dataset:{portalForm:kind},hidden:false,parentElement:{querySelector:()=>notices[i]}}));
 const document={querySelectorAll:q=>q==='[data-portal-form]'?forms:q==='[data-form-environment]'?notices:[],getElementById:()=>null,querySelector:()=>null,createElement:()=>({addEventListener(_,f){this.click=f;}})};
 const window={addEventListener(){},open:(...a)=>opened.push(a)};
 vm.runInNewContext(source,{document,window,location:{hostname:'www-donventas-mx.translate.goog',hash:'',search:'?_x_tr_tl=en'},URLSearchParams,crypto:{randomUUID:()=>''},fetch(){throw Error('proxy must not call endpoint');}});
 forms.forEach((form,i)=>{assert.equal(form.hidden,true); assert.equal(notices[i].hidden,false);assert.equal(notices[i].link.translate,false)});
 assert.equal(notices[0].link.href,'https://www.donventas.mx/#lista');assert.equal(notices[1].link.href,'https://www.donventas.mx/#consulta-encargo');
});

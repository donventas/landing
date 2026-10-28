'use strict';
const crypto = require('node:crypto');
const NOTICE = 'portal-preview-2026-10-27-v1';
const PURPOSE = 'portal_launch_offers';
class Fault extends Error { constructor(status,code){ super(code);this.status=status;this.code=code; } }
function validate(body, now=Date.now()) {
 if (!body || typeof body!=='object' || Array.isArray(body)) throw new Fault(422,'invalid');
 const fields=['kind','email','name','message','interest','consent','website','started_at','submission_key'];
 if(Object.keys(body).some(k=>!fields.includes(k)))throw new Fault(422,'invalid');
 if(!['waitlist','contact'].includes(body.kind))throw new Fault(422,'invalid');
 function str(key,max,required=false){const v=body[key]??'';if(typeof v!=='string'||v.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v))throw new Fault(422,'invalid');if(required&&!v.trim())throw new Fault(422,'invalid');return v.trim();}
 const email=str('email',254,true).toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email))throw new Fault(422,'email');
 const name=str('name',100),message=str('message',3000),interest=str('interest',30),website=str('website',200);
 if(/[\r\n]/.test(name))throw new Fault(422,'invalid');
 if(body.kind==='waitlist'&&(body.consent!==true||name||message||!['','clarity','proposal','formats','brand'].includes(interest)))throw new Fault(422,'consent');
 if(body.kind==='contact'&&(message.length<10||interest||(body.consent!==undefined&&body.consent!==false)))throw new Fault(422,'invalid');
 if(typeof body.started_at!=='number'||!Number.isFinite(body.started_at)||now-body.started_at<2500||now-body.started_at>86400000)throw new Fault(422,'timing');
 if(typeof body.submission_key!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.submission_key))throw new Fault(422,'invalid');
 return {kind:body.kind,email,name,message,interest,website,submission_key:body.submission_key,consent:body.kind==='waitlist'};
}
async function readBody(req){
 if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw new Fault(415,'content_type');
 if(Number(req.headers['content-length']||0)>16000)throw new Fault(413,'too_large');
 let raw;
 if(req.body!==undefined)raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);
 else {const chunks=[];let bytes=0;for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>16000)throw new Fault(413,'too_large');chunks.push(Buffer.from(chunk));}raw=Buffer.concat(chunks).toString('utf8');}
 if(Buffer.byteLength(raw)>16000)throw new Fault(413,'too_large');
 try{return JSON.parse(raw);}catch{throw new Fault(400,'invalid_json');}
}
function createHandler(config) {return async(req,res)=>{
 const reply=(status,body)=>{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Robots-Tag','noindex');res.statusCode=status;res.end(JSON.stringify(body));};
 const ready=config&&(['simulation','test','live'].includes(config.mode))&&(config.mode!=='test'||Boolean(config.testEmail));
 if(req.method==='GET')return reply(200,{enabled:Boolean(ready),mode:ready?config.mode:'unavailable'});
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return reply(405,{ok:false,code:'method'});}
 if(!ready)return reply(503,{ok:false,code:'unavailable'});
 try {
  if(req.headers.origin!==config.origin||req.headers['sec-fetch-site']==='cross-site')throw new Fault(403,'origin');
  const data=validate(await readBody(req),config.now?.()??Date.now());
  if(config.mode==='test'&&data.email!==config.testEmail)throw new Fault(422,'test_recipient');
  if(data.website)return reply(202,{ok:true,mode:config.mode,status:'received'});
  if(config.mode==='simulation')return reply(202,{ok:true,mode:'simulation',status:'not_stored'});
  // Production/test adapter must provide atomic quotas, idempotency and durable outbox.
  if(!config.store||!config.secret||config.secret.length<32)throw new Fault(503,'unavailable');
  const ip=config.clientAddress(req);if(!ip)throw new Fault(503,'unavailable');
  const hash=v=>crypto.createHmac('sha256',config.secret).update(v).digest('hex');
  const payload={...data,purpose:data.kind==='waitlist'?PURPOSE:'help_request',source:'homepage',source_url:'https://www.donventas.mx/',notice_version:NOTICE,is_test:config.mode==='test'};
  delete payload.website;
  const result=await config.store.receive(payload,{ip:hash('ip|'+ip),email:hash('email|'+data.email),payload:hash(JSON.stringify(payload))});
  if(!result?.accepted)throw new Fault(503,'unavailable');
  return reply(202,{ok:true,mode:config.mode,status:data.kind==='waitlist'?'pending_confirmation':'received'});
 }catch(error){if(error.status===429)res.setHeader('Retry-After','900');return reply(error instanceof Fault?error.status:503,{ok:false,code:error instanceof Fault?error.code:'unavailable'});}
};}
module.exports={createHandler,validate,readBody,Fault,NOTICE,PURPOSE};

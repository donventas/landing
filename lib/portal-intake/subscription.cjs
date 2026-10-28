'use strict';
const {createHash}=require('node:crypto');
const {readBody}=require('./service.cjs');
function createSubscriptionHandler(config){return async(req,res)=>{
 const reply=(status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex');res.end(JSON.stringify(body));};
 if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{ok:false});}
 if(!config?.store||!['test','live'].includes(config.mode))return reply(503,{ok:false});
 try{
  if(req.headers.origin!==config.origin||req.headers['sec-fetch-site']==='cross-site')return reply(403,{ok:false});
  const input=await readBody(req);
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['action','token'].includes(k))||!['confirm','unsubscribe'].includes(input.action)||typeof input.token!=='string'||!/^[a-f0-9]{64}$/.test(input.token))return reply(422,{ok:false});
  const result=await config.store.action(input.action,createHash('sha256').update(input.token).digest('hex'));
  if(result?.ok!==true)return reply(410,{ok:false});
  return reply(200,{ok:true});
 }catch{return reply(503,{ok:false});}
};}
module.exports={createSubscriptionHandler};

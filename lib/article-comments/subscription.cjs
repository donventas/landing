'use strict';
const {readBody,reply,Fault}=require('./service.cjs');
const {tokenHash}=require('./runtime.cjs');
function createSubscriptionHandler(config) {
  return async(req,res)=>{
    if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(res,405,{ok:false});}
    if(!config)return reply(res,503,{ok:false});
    try {
      if(req.headers.origin!==config.origin || req.headers['sec-fetch-site']==='cross-site')throw new Fault(403,'origin');
      const b=await readBody(req);
      if(!b || typeof b!=='object' || Object.keys(b).some(k=>!['action','token'].includes(k)) || !['confirm','unsubscribe'].includes(b.action) || typeof b.token!=='string' || !/^[a-f0-9]{64}$/.test(b.token))throw new Fault(422,'invalid');
      const ok=await config.store.rpc('dv_newsletter_action',{p_action:b.action,p_hash:tokenHash(b.token)});
      return reply(res,ok===true?200:410,{ok:ok===true});
    }catch(error){return reply(res,error instanceof Fault?error.status:503,{ok:false});}
  };
}
module.exports={createSubscriptionHandler};

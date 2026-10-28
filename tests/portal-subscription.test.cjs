'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createSubscriptionHandler}=require('../lib/portal-intake/subscription.cjs');
const {configuration}=require('../lib/portal-intake/runtime.cjs');
const origin='http://127.0.0.1:8023';
async function run(input,config,headers={},method='POST'){
 const r={statusCode:0,headers:{},setHeader(k,v){this.headers[k]=v;},end(s){this.body=JSON.parse(s);}};
 await createSubscriptionHandler(config)({method,headers:{origin,'content-type':'application/json',...headers},body:input},r);return r;
}
test('subscription action hashes bearer token and exposes no recipient/token',async()=>{
 let call;const config={mode:'test',origin,store:{async action(action,hash){call={action,hash};return{ok:true};}}};
 const r=await run({action:'unsubscribe',token:'a'.repeat(64)},config);assert.equal(r.statusCode,200);assert.equal(call.action,'unsubscribe');assert.notEqual(call.hash,'a'.repeat(64));assert.deepEqual(r.body,{ok:true});
});
test('subscription requires explicit POST, exact origin, schema and configured store',async()=>{
 const config={mode:'test',origin,store:{action(){throw Error('should not run');}}},input={action:'confirm',token:'a'.repeat(64)};
 assert.equal((await run(input,config,{},'GET')).statusCode,405);
 assert.equal((await run(input,null)).statusCode,503);
 assert.equal((await run(input,config,{origin:'https://other.test'})).statusCode,403);
 assert.equal((await run({...input,email:'x@example.test'},config)).statusCode,422);
});
test('expired token is distinguished from transport failure without side effects',async()=>{
 const input={action:'confirm',token:'a'.repeat(64)};
 assert.equal((await run(input,{mode:'test',origin,store:{action:async()=>({ok:false})}})).statusCode,410);
 assert.equal((await run(input,{mode:'test',origin,store:{action:async()=>{throw Error('private');}}})).statusCode,503);
});
test('runtime never enables preview or inherits blog credentials',()=>{
 assert.equal(configuration({VERCEL:'1',VERCEL_ENV:'preview',PORTAL_INTAKE_MODE:'test'}),null);
 assert.equal(configuration({VERCEL:'1',VERCEL_ENV:'production',ARTICLE_COMMENTS_MODE:'live'}),null);
});
test('runtime requires complete isolated configuration and rejects preview',()=>{
 const env={VERCEL:'1',VERCEL_ENV:'production',PORTAL_INTAKE_MODE:'test',PORTAL_HASH_SECRET:'s'.repeat(32),PORTAL_TEST_EMAIL:'reader@example.test',PORTAL_SUPABASE_URL:'https://project.supabase.co',PORTAL_INTAKE_KEY:'k'.repeat(32),PORTAL_ANON_JWT:'eyJ.test'};
 const config=configuration(env,async()=>{throw Error('network must not be called');});
 assert.equal(config.mode,'test');
 assert.equal(config.testEmail,'reader@example.test');
 assert.equal(config.origin,'https://www.donventas.mx');
 assert.equal(configuration({...env,VERCEL_ENV:'preview'}),null);
 assert.equal(configuration({...env,PORTAL_INTAKE_KEY:''}),null);
 assert.equal(configuration({...env,PORTAL_TEST_EMAIL:''}),null);
});

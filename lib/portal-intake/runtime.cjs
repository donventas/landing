'use strict';
const {isIP}=require('node:net');
const {PortalStore}=require('./supabase-store.cjs');
// No defaults to the blog's credentials, recipients, purposes or deployment mode.
function configuration(env=process.env,fetchImpl=globalThis.fetch){
 if(env.VERCEL!=='1'||!['test','live'].includes(env.PORTAL_INTAKE_MODE))return null;
 if(env.VERCEL_ENV!=='production')return null; // Global preview protection stays intact.
 const mode=env.PORTAL_INTAKE_MODE,secret=env.PORTAL_HASH_SECRET;
 const testEmail=(env.PORTAL_TEST_EMAIL||'').trim().toLowerCase();
 if(!secret||secret.length<32||(mode==='test'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)))return null;
 try{return{mode,secret,testEmail,origin:'https://www.donventas.mx',store:new PortalStore({url:env.PORTAL_SUPABASE_URL,key:env.PORTAL_INTAKE_KEY,anonJwt:env.PORTAL_ANON_JWT,fetchImpl}),clientAddress(req){const ip=req.headers['x-vercel-forwarded-for'];return typeof ip==='string'&&isIP(ip.trim())?ip.trim():null;}};}catch{return null;}
}
module.exports={configuration};

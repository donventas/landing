'use strict';
// Generates runtime data, never logs credentials. Explicit path must be outside the repo.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),target=path.resolve(process.argv[2]||'.'),email=process.env.PORTAL_TEST_EMAIL;
const relative=path.relative(root,target);
if(!path.isAbsolute(process.argv[2]||'')||(!relative.startsWith('..')&&!path.isAbsolute(relative))||!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('explicit_external_path_and_recipient_required');
if(fs.existsSync(target))throw Error('configuration_already_exists');
const key=()=>crypto.randomBytes(32).toString('hex');
const config={PORTAL_LOCAL_TEST:'1',PORTAL_INTAKE_MODE:'test',PORTAL_DELIVERY_MODE:'test',PORTAL_TEST_EMAIL:email,PORTAL_CONTACT_TO:email,PORTAL_MAIL_FROM:'Don Ventas <comentarios@donventas.mx>',PORTAL_PUBLIC_ORIGIN:'http://127.0.0.1:8023',PORTAL_SUPABASE_URL:'https://hlabhmegjnrjygsywnqa.supabase.co',PORTAL_INTAKE_KEY:key(),PORTAL_WORKER_KEY:key(),PORTAL_HASH_SECRET:key(),PORTAL_TOKEN_SECRET:key(),PORTAL_ANON_JWT:''};
fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(config,null,2),{flag:'wx',mode:0o600});
console.log('Created external test configuration; values not printed.');

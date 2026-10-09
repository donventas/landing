// Private worker; never expose this function with publishable/anonymous access.
// Candidate for deployment after review. Reuses Supabase's existing Resend
// secret without exporting it to Vercel or changing lead-notifications.
import { timingSafeEqual, createHmac, createHash } from 'node:crypto';

const TO = 'arturo.villagomez@donventas.mx';
const FROM = 'Don Ventas <comentarios@donventas.mx>';
const html = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const response = (status: number, body: object) => new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

export default {
  async fetch(req: Request): Promise<Response> {
    let modern = '';
    try { modern = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || ''; } catch { return response(503,{ok:false,code:'configuration'}); }
    const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const workerKey = Deno.env.get('ARTICLE_COMMENTS_WORKER_KEY') || '';
    const keys = [modern,legacy,workerKey].filter(k=>typeof k==='string' && k.length>0);
    if (!keys.length) return response(503,{ok:false,code:'configuration'});
    // Dashboard invocations may replace Authorization with their session JWT.
    // Use an existing private server key, never a public/publishable key.
    const candidate = req.headers.get('x-dv-worker-key') || req.headers.get('apikey') || (req.headers.get('authorization') || '').replace(/^Bearer /,'');
    const actual = new TextEncoder().encode(candidate);
    const authorized = keys.some(k=>{const expected=new TextEncoder().encode(k);return actual.length===expected.length && timingSafeEqual(actual,expected);});
    if (!authorized) return response(401,{ok:false,code:'private_credential_required'});
    const key = keys[0];
    if (req.method !== 'POST') return response(405,{ok:false});
    const url = Deno.env.get('SUPABASE_URL') || '';
    const mailKey = Deno.env.get('RESEND_API_KEY') || '';
    if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) || !mailKey) return response(503,{ok:false,code:'configuration'});
    const rpc = async (name: string, body: object) => {
      const r = await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),
        headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json'},body:JSON.stringify(body)});
      if (!r.ok) throw Error('storage');
      return await r.json();
    };
    try {
      const job = await rpc('dv_article_claim',{p_test_only:Deno.env.get('ARTICLE_COMMENTS_DELIVERY_MODE') !== 'live'});
      if (!job) {
        if (Deno.env.get('ARTICLE_NEWSLETTER_MODE') !== 'enabled') return response(200,{ok:true,processed:0});
        return await confirmation(rpc,mailKey);
      }
      const m = job.message;
      // Until release activation, only a DBA-created fixture may be delivered.
      // is_test is not a field accepted by the public intake validator.
      if (!m.is_test && Deno.env.get('ARTICLE_COMMENTS_DELIVERY_MODE') !== 'live') {
        await rpc('dv_article_finish',{p_id:job.id,p_lease:job.lease,p_patch:{state:'retry'}});
        return response(503,{ok:false,code:'not_activated'});
      }
      const subject = m.is_test ? 'PRUEBA · Comentarios del blog' : 'Comentario privado · '+m.article_title;
      const envelope = {from:FROM,to:[TO],reply_to:m.email,subject,
        text:`${m.article_title}\n${m.article_url}\n\n${m.name || 'Sin nombre'}\n${m.message}\n\nMensaje privado. No implica una oportunidad comercial ni una suscripción.`,
        html:`<h1>${html(subject)}</h1><p>${html(m.article_title)}</p><p>${html(m.name || 'Sin nombre')}</p><p style="white-space:pre-wrap">${html(m.message)}</p><p>No implica una oportunidad comercial ni una suscripción.</p>`};
      let provider;
      try {
        const sent = await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),
          headers:{Authorization:'Bearer '+mailKey,'Content-Type':'application/json','Idempotency-Key':'article-comment/'+job.id},body:JSON.stringify(envelope)});
        if (!sent.ok) throw Error('mail');
        provider = await sent.json();
        if (typeof provider.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(provider.id)) throw Error('mail');
      } catch {
        await rpc('dv_article_finish',{p_id:job.id,p_lease:job.lease,p_patch:{state:job.attempts>=5?'delivery_unknown':'retry'}});
        return response(503,{ok:false,code:'delivery_pending'});
      }
      const saved = await rpc('dv_article_finish',{p_id:job.id,p_lease:job.lease,p_patch:{state:'accepted',provider_id:provider.id}});
      if (!saved) return response(503,{ok:false,code:'reconciliation_required'});
      return response(200,{ok:true,processed:1,state:'accepted'});
    } catch { return response(503,{ok:false,code:'unavailable'}); }
  }
};

// Run after the comments queue. No newsletter campaigns are sent by this worker.
async function confirmation(rpc: (name:string,body:object)=>Promise<any>, mailKey:string): Promise<Response> {
  const secret = Deno.env.get('ARTICLE_NEWSLETTER_TOKEN_SECRET') || '';
  const origin = Deno.env.get('ARTICLE_COMMENTS_PUBLIC_ORIGIN') || '';
  if (secret.length<32 || !/^https:\/\/(www\.donventas\.mx|landing-[a-z0-9-]+-don-ventas\.vercel\.app)$/.test(origin)) return response(503,{ok:false,code:'configuration'});
  const j = await rpc('dv_newsletter_claim',{p_test_only:Deno.env.get('ARTICLE_COMMENTS_DELIVERY_MODE') !== 'live'});
  if (!j) return response(200,{ok:true,processed:0});
  if (j.is_test && j.email!==TO) {
    await rpc('dv_newsletter_finish',{p_id:j.id,p_lease:j.lease,p_patch:{state:'cancelled'}});
    return response(503,{ok:false,code:'test_recipient'});
  }
  const token = (action:string)=>createHmac('sha256',secret).update('dv-newsletter-v1|'+j.id+'|'+action).digest('hex');
  const confirm=token('confirm'), unsubscribe=token('unsubscribe');
  const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
  const prepared=await rpc('dv_newsletter_prepare',{p_id:j.id,p_lease:j.lease,p_confirm:hash(confirm),p_unsubscribe:hash(unsubscribe)});
  if (!prepared) {
    await rpc('dv_newsletter_finish',{p_id:j.id,p_lease:j.lease,p_patch:{state:'cancelled'}});
    return response(200,{ok:true,processed:1,state:'cancelled'});
  }
  const link=origin+'/suscripcion.html#confirm='+confirm;
  const cancel=origin+'/suscripcion.html#unsubscribe='+unsubscribe;
  const subject=(j.is_test?'PRUEBA · ':'')+'Confirma tu suscripción a Don Ventas';
  let provider;
  try {
    const sent=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),
      headers:{Authorization:'Bearer '+mailKey,'Content-Type':'application/json','Idempotency-Key':'article-subscription/'+j.id},
      body:JSON.stringify({from:FROM,to:[j.email],subject,
        text:`Pediste recibir artículos y novedades de Don Ventas. Confirma tu correo: ${link}\n\nEl enlace caduca en 30 días. Si no lo solicitaste, ignora este correo. Tu comentario se atiende independientemente. Cancelar o darte de baja: ${cancel}`,
        html:`<h1>Ideas claras, también en tu correo.</h1><p>Pediste recibir artículos y novedades de Don Ventas.</p><p><a href="${link}">Confirmar mi suscripción</a></p><p>El enlace caduca en 30 días. Si no lo solicitaste, ignora este correo. Tu comentario se atiende independientemente.</p><p><a href="${cancel}">Cancelar o darme de baja</a></p>`})});
    if (!sent.ok) throw Error('mail');
    provider=await sent.json();
    if (typeof provider.id!=='string' || !/^[0-9a-f-]{36}$/i.test(provider.id)) throw Error('mail');
  } catch {
    await rpc('dv_newsletter_finish',{p_id:j.id,p_lease:j.lease,p_patch:{state:j.attempts>=5?'delivery_unknown':'retry'}});
    return response(503,{ok:false,code:'delivery_pending'});
  }
  const saved=await rpc('dv_newsletter_finish',{p_id:j.id,p_lease:j.lease,p_patch:{state:'accepted',provider_id:provider.id}});
  return response(saved?200:503,{ok:!!saved,processed:1,state:saved?'accepted':'reconciliation_required'});
}

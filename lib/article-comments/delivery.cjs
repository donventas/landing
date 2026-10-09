'use strict';
const crypto = require('node:crypto');
function escape(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function envelope(message, { to, from }) {
  if (!/^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/.test(to) || !/^Don Ventas <[a-z0-9._+-]+@donventas\.mx>$/.test(from)) throw Error('mail_configuration');
  return { from, to: [to], reply_to: message.email, subject: 'Comentario privado · ' + message.article_title,
    text: `${message.article_title}\n${message.article_url}\n\n${message.name || 'Sin nombre'}\n${message.message}\n\nEntrada pendiente de clasificación. No es una oportunidad ni una suscripción activa.`,
    html: `<h1>Comentario privado</h1><p><a href="${escape(message.article_url)}">${escape(message.article_title)}</a></p><p>${escape(message.name || 'Sin nombre')}</p><p style="white-space:pre-wrap">${escape(message.message)}</p><p>Pendiente de clasificación. No es una oportunidad ni una suscripción activa.</p>` };
}
async function dispatchOne(store, mailer, config, now = Date.now()) {
  const job = await store.claim(now); if (!job) return false;
  let result;
  try {
    result = await mailer.send(envelope(job.message, config), 'article-comment/' + job.id);
  } catch {
    // No provider error body or visitor fields in logs. An uncertain send keeps the same key.
    await store.finish(job.id, job.lease, { state: job.attempts >= 5 ? 'delivery_unknown' : 'retry', next_at: now + Math.min(3600000, 30000 * 2 ** job.attempts), error_code: 'delivery_attempt_failed' });
    return true;
  }
  // A database failure after provider acceptance is not a failed send. Leave
  // the lease to expire; recovery must reuse the same provider idempotency key.
  await store.finish(job.id, job.lease, { state: result.simulated ? 'simulated' : 'accepted', provider_id: result.id, accepted_at: now });
  return true;
}
function simulatedMailer() { return { async send(_envelope, key) { return { id: 'sim_' + crypto.createHash('sha256').update(key).digest('hex').slice(0, 24), simulated: true }; } }; }
// Pure verifier used by contract tests. No webhook endpoint is exposed before a release.
function verifyEvent(raw, headers, secret, time = Date.now()) {
  const seconds = Number(headers['svix-timestamp']); const id = headers['svix-id'];
  if (!id || !Number.isFinite(seconds) || Math.abs(time / 1000 - seconds) > 300 || !secret?.startsWith('whsec_')) throw Error('invalid_signature');
  const expected = crypto.createHmac('sha256', Buffer.from(secret.slice(6), 'base64')).update(id + '.' + seconds + '.' + raw).digest();
  const signatures = String(headers['svix-signature'] || '').split(' ');
  if (!signatures.some(s => { const [version, signature] = s.split(','); const b = Buffer.from(signature || '', 'base64'); return version === 'v1' && b.length === expected.length && crypto.timingSafeEqual(b, expected); })) throw Error('invalid_signature');
  const body = JSON.parse(raw); const state = ({ 'email.delivered':'delivered', 'email.bounced':'bounced', 'email.failed':'failed', 'email.complained':'complained', 'email.delivery_delayed':'delayed' })[body.type];
  const at = Date.parse(body.created_at);
  if (!state || typeof body.data?.email_id !== 'string' || !Number.isFinite(at)) throw Error('invalid_event');
  return { id, provider_id: body.data.email_id, state, at };
}
module.exports = { envelope, dispatchOne, simulatedMailer, verifyEvent };

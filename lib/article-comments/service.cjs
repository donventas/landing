'use strict';
const crypto = require('node:crypto');
const catalog = require('./catalog.cjs');
const DAY = 86400000;
const NOTICE = 'private-comments-2026-10-v1';
const OPT_IN = 'Ideas para hacer más visible tu negocio. Recíbelas por correo.';
const MAX_BYTES = 24000;
class Fault extends Error {
  constructor(status, code, field) { super(code); Object.assign(this, { status, code, field }); }
}
function string(value, max, field, required = false) {
  if (typeof value !== 'string') throw new Fault(422, 'invalid', field);
  const result = value.trim();
  if ((required && !result) || [...result].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)) throw new Fault(422, 'invalid', field);
  return result;
}
function validate(body) {
  const allowed = ['article_id', 'message', 'email', 'name', 'newsletter', 'submission_key', 'website'];
  if (!body || Array.isArray(body) || typeof body !== 'object' || Object.keys(body).some(k => !allowed.includes(k))) throw new Fault(422, 'invalid');
  if (typeof body.website !== 'string' || body.website.length > 500) throw new Fault(422, 'invalid');
  if (body.website) return { trap: true };
  if (!Object.hasOwn(catalog, body.article_id)) throw new Fault(422, 'article_invalid');
  if (typeof body.submission_key !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.submission_key)) throw new Fault(422, 'invalid');
  if (typeof body.newsletter !== 'boolean') throw new Fault(422, 'invalid', 'newsletter');
  const email = string(body.email, 254, 'email', true);
  if (!/^[^\s<>(),;:"\\\[\]]+@[^\s<>(),;:"\\\[\]]+\.[^\s<>(),;:"\\\[\]]+$/.test(email) || /[\r\n]/.test(email)) throw new Fault(422, 'invalid', 'email');
  const name = string(body.name, 100, 'name');
  if (/[\r\n]/.test(name)) throw new Fault(422, 'invalid', 'name');
  return { article: catalog[body.article_id], message: string(body.message, 5000, 'message', true), email, name,
    newsletter: body.newsletter, submission_key: body.submission_key.toLowerCase() };
}
function hmac(secret, value) { return crypto.createHmac('sha256', secret).update(value).digest('hex'); }
async function readBody(req) {
  if (!/^application\/json(?:\s*;.*)?$/i.test(req.headers['content-type'] || '')) throw new Fault(415, 'json_required');
  const length = req.headers['content-length'];
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BYTES)) throw new Fault(413, 'too_large');
  // Vercel may have parsed the body already. The stream path enforces actual bytes too.
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > MAX_BYTES) throw new Fault(413, 'too_large');
    try { return JSON.parse(String(raw)); } catch { throw new Fault(400, 'invalid_json'); }
  }
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += Buffer.byteLength(chunk); if (size > MAX_BYTES) throw new Fault(413, 'too_large'); chunks.push(Buffer.from(chunk)); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Fault(400, 'invalid_json'); }
}
function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = status; res.end(JSON.stringify(body));
}
function createHandler({ store, origin, secret, mode = 'disabled', testEmail, clientAddress = req => req.socket?.remoteAddress, now = Date.now } = {}) {
  const enabled = ['simulation', 'test', 'live'].includes(mode) && store && origin && secret?.length >= 32 && (mode !== 'test' || testEmail);
  return async (req, res) => {
    if (req.method === 'GET') return reply(res, 200, { enabled: !!enabled, mode: enabled ? mode : 'disabled' });
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(res, 405, { ok: false, code: 'method' }); }
    if (!enabled) return reply(res, 503, { ok: false, code: 'unavailable' });
    try {
      if (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site') throw new Fault(403, 'origin');
      const data = validate(await readBody(req));
      if (data.trap) return reply(res, 202, { ok: true, mode });
      if (mode === 'test' && data.email.toLowerCase() !== testEmail.toLowerCase()) throw new Fault(422, 'invalid', 'email');
      const address = clientAddress(req); if (!address) throw new Fault(503, 'unavailable');
      const time = now();
      const payload = { article_id: data.article.id, message: data.message, email: data.email, name: data.name, newsletter: data.newsletter };
      const record = { id: crypto.randomUUID(), ...payload, article_title: data.article.title, article_url: data.article.url,
        source: 'blog_private_comment', submission_key: data.submission_key, payload_hash: hmac(secret, JSON.stringify(payload)),
        received_at: time, expires_at: time + 180 * DAY, notice_version: NOTICE, classification: 'pending_classification', is_test: mode === 'test' };
      // Separate pseudonymous quotas; changing an email cannot bypass the IP quota.
      const keys = { ip: hmac(secret, 'ip|' + address), email: hmac(secret, 'email|' + data.email.toLowerCase()) };
      await store.receive(record, keys, time, { copy: OPT_IN, version: 'newsletter-2026-10-v1', expires_at: time + 30 * DAY });
      // Do not expose message/email/IDs, and do not claim that mail has been delivered.
      return reply(res, 202, { ok: true, mode, subscription: data.newsletter ? 'pending_confirmation' : 'not_requested' });
    } catch (error) {
      const status = error instanceof Fault ? error.status : 503;
      if (status === 429) res.setHeader('Retry-After', '900');
      return reply(res, status, { ok: false, code: error instanceof Fault ? error.code : 'unavailable', ...(error.field ? { field: error.field } : {}) });
    }
  };
}
module.exports = { createHandler, validate, readBody, reply, Fault, NOTICE, OPT_IN, DAY, MAX_BYTES };

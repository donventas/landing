const crypto = require('node:crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hlabhmegjnrjygsywnqa.supabase.co';
const PREVIEW_PUBLISHABLE_KEY = 'sb_publishable_Pk-_A1MghCXv9F5r9TvcxA_vkf08JYh';
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const buckets = new Map();

function text(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return {};
}

function allowedOrigin(req) {
  if (String(req.headers['sec-fetch-site'] || '').toLowerCase() === 'cross-site') return false;
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    const deployment = String(process.env.VERCEL_URL || '').toLowerCase();
    const branchPreview = process.env.VERCEL_ENV !== 'production' && /^landing-[a-z0-9-]+-don-ventas\.vercel\.app$/.test(host);
    return host === 'donventas.mx' || host === 'www.donventas.mx' || host === 'localhost' || host === '127.0.0.1' || (deployment && host === deployment) || branchPreview;
  } catch (_error) {
    return false;
  }
}

function clientKey(req, email) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const address = forwarded || req.socket?.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(address + '|' + email.toLowerCase()).digest('hex');
}

function withinRateLimit(key, now) {
  for (const [storedKey, entry] of buckets) {
    if (now - entry.startedAt > WINDOW_MS) buckets.delete(storedKey);
  }
  const current = buckets.get(key);
  if (!current || now - current.startedAt > WINDOW_MS) {
    buckets.set(key, { count: 1, startedAt: now });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_REQUESTS;
}

function normalize(payload) {
  return {
    nombre: text(payload.nombre, 160),
    correo: text(payload.correo, 320),
    negocio: text(payload.negocio, 200),
    whatsapp: text(payload.whatsapp, 80),
    reto: text(payload.reto, 8000),
    paquete: text(payload.paquete, 300),
    consent: payload.consent === true,
    origen: text(payload.origen, 180).replace(/[\r\n]/g, ''),
    submission_key: text(payload.submission_key, 80),
    website: text(payload.website, 500),
    started_at: Number(payload.started_at)
  };
}

function validationError(lead, now) {
  if (!lead.nombre) return 'name_required';
  if (!lead.negocio) return 'business_required';
  if (!validEmail(lead.correo)) return 'email_invalid';
  if (!lead.reto || !lead.paquete) return 'diagnostic_incomplete';
  if (!lead.consent) return 'consent_required';
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(lead.submission_key)) return 'submission_key_invalid';
  if (!Number.isFinite(lead.started_at) || now - lead.started_at < 2500) return 'submitted_too_fast';
  return '';
}

function storageKey() {
  const configured = process.env.SUPABASE_LEAD_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (configured) return configured;
  return process.env.VERCEL_ENV === 'production' ? '' : PREVIEW_PUBLISHABLE_KEY;
}

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, { ok: false, code: 'method_not_allowed' });
  }
  if (!allowedOrigin(req)) return reply(res, 403, { ok: false, code: 'origin_not_allowed' });
  if (Number(req.headers['content-length'] || 0) > 24000) return reply(res, 413, { ok: false, code: 'payload_too_large' });

  let payload;
  try {
    payload = parseBody(req);
  } catch (_error) {
    return reply(res, 400, { ok: false, code: 'invalid_json' });
  }
  const now = Date.now();
  const lead = normalize(payload);

  // Campo trampa: se responde como éxito para no enseñar al bot cómo fue detectado.
  if (lead.website) return reply(res, 202, { ok: true });

  const error = validationError(lead, now);
  if (error) return reply(res, 422, { ok: false, code: error });
  if (!withinRateLimit(clientKey(req, lead.correo), now)) return reply(res, 429, { ok: false, code: 'rate_limited' });

  const record = {
    nombre: lead.nombre,
    correo: lead.correo,
    negocio: lead.negocio,
    whatsapp: lead.whatsapp,
    reto: lead.reto,
    paquete: lead.paquete,
    consent: lead.consent,
    origen: lead.origen || 'landing-directo',
    submission_key: lead.submission_key
  };
  const key = storageKey();
  if (!key) return reply(res, 503, { ok: false, code: 'lead_store_not_configured' });
  const headers = {
    'Content-Type': 'application/json',
    apikey: key,
    Prefer: 'resolution=ignore-duplicates,return=minimal'
  };
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;

  try {
    const response = await fetch(SUPABASE_URL + '/rest/v1/lead', {
      method: 'POST',
      headers,
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return reply(res, 502, { ok: false, code: 'lead_store_unavailable' });
    return reply(res, 201, { ok: true });
  } catch (_error) {
    return reply(res, 503, { ok: false, code: 'lead_store_timeout' });
  }
}

module.exports = handler;
module.exports._test = { allowedOrigin, normalize, validationError, withinRateLimit, storageKey, buckets };

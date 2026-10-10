'use strict';
const crypto = require('node:crypto');
const { isIP } = require('node:net');
const { SupabaseIntakeStore } = require('./supabase-store.cjs');
// Explicit activation only; the existing diagnostic configuration is never changed.
function configuration(env = process.env, fetchImpl = globalThis.fetch) {
  const mode = env.ARTICLE_COMMENTS_MODE;
  if (env.VERCEL !== '1' || !['test','live'].includes(mode) || (mode === 'live' && env.VERCEL_ENV !== 'production')) return null;
  const key = env.ARTICLE_COMMENTS_INTAKE_KEY;
  const url = env.ARTICLE_COMMENTS_SUPABASE_URL;
  const secret = env.ARTICLE_COMMENTS_HASH_SECRET;
  if (!key || !url || !secret || secret.length < 32) return null;
  const origin = env.VERCEL_ENV === 'production' ? 'https://www.donventas.mx' : 'https://' + env.VERCEL_URL;
  if (!/^https:\/\/[a-zA-Z0-9.-]+$/.test(origin)) return null;
  try {
    return { mode, origin, secret, testEmail: 'arturo.villagomez@donventas.mx',
      store: new SupabaseIntakeStore({ url, key, anonJwt:env.ARTICLE_COMMENTS_ANON_JWT, fetchImpl }),
      clientAddress(req) {
        // Vercel overwrites x-vercel-forwarded-for; do not trust alternate headers.
        const ip = req.headers['x-vercel-forwarded-for'];
        return typeof ip === 'string' && isIP(ip.trim()) ? ip.trim() : null;
      } };
  } catch { return null; }
}
function tokenHash(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
module.exports = { configuration, tokenHash };

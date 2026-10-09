'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createResendMailer } = require('../lib/article-comments/resend-mailer.cjs');
const { dispatchOne } = require('../lib/article-comments/delivery.cjs');
const { SupabaseReceiptStore } = require('../lib/article-comments/supabase-store.cjs');
const id = '63edcc42-e127-483a-876f-15b6e905ef83';
const payload = { from: 'Don Ventas <blog@donventas.mx>', to: ['qa@example.test'], reply_to: 'visitor@example.test', subject: 'Prueba ficticia', text: 'Prueba ficticia' };
test('Resend requires an explicit server key and stable key before any network call', async () => {
  assert.throws(() => createResendMailer());
  assert.throws(() => createResendMailer({ key: 're_test\r\nx: y' }));
  const mailer = createResendMailer({ key: 're_test_only', fetchImpl: () => { throw Error('unexpected network'); } });
  await assert.rejects(mailer.send(payload, 'visitor@example.test'), /mail_configuration/);
});
test('Resend transport uses the fixed API, no redirects, timeout and idempotency; accepted is not delivered', async () => {
  let captured;
  const mailer = createResendMailer({ key: 're_test_only', fetchImpl: async (url, options) => {
    captured = { url, options }; return { ok: true, json: async () => ({ id }) };
  } });
  assert.deepEqual(await mailer.send(payload, 'article-comment/' + id), { id });
  assert.equal(captured.url, 'https://api.resend.com/emails');
  assert.equal(captured.options.redirect, 'error');
  assert.equal(captured.options.headers['Idempotency-Key'], 'article-comment/' + id);
  assert.ok(captured.options.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(captured.options.body), payload);
});
test('provider errors, timeouts and malformed success never expose payload or credential', async () => {
  for (const fetchImpl of [async () => { throw Error('re_test_only visitor@example.test'); }, async () => ({ ok: false }), async () => ({ ok: true, json: async () => ({ id: 'private-response' }) })]) {
    const mailer = createResendMailer({ key: 're_test_only', fetchImpl });
    await assert.rejects(mailer.send(payload, 'article-comment/' + id), e => e.message === 'mail_unavailable');
  }
});
test('database failure after accepted mail does not mark the send as failed', async () => {
  const patches = [];
  const store = { claim: async () => ({ id, lease: 'test', attempts: 1, message: { email: 'qa@example.test', article_title: 'Manual', article_url: 'https://www.donventas.mx/blog/manual-de-marca.html', message: 'Prueba' } }),
    finish: async (_id, _lease, patch) => { patches.push(patch); throw Error('database unavailable'); } };
  await assert.rejects(dispatchOne(store, { send: async () => ({ id }) }, { to: 'qa@example.test', from: payload.from }), /database unavailable/);
  assert.equal(patches.length, 1); assert.equal(patches[0].state, 'accepted');
});
test('Supabase secret keys are not sent as JWTs; legacy service JWTs retain Authorization', async () => {
  for (const key of ['sb_secret_test_only', 'eyJtest-only']) {
    let headers;
    const store = new SupabaseReceiptStore({ url: 'https://isolated.example.test', key, fetchImpl: async (_url, options) => {
      headers = options.headers; return { ok: true, json: async () => ({ duplicate: false }) };
    } });
    await store.receive({}, {}, 0, {});
    assert.equal(headers.apikey, key);
    assert.equal(headers.Authorization, key.startsWith('eyJ') ? 'Bearer ' + key : undefined);
  }
});

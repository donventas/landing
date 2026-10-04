const assert = require('node:assert/strict');
const test = require('node:test');
const handler = require('../api/lead.js');

function request(overrides = {}) {
  const { body = {}, headers = {}, ...rest } = overrides;
  return {
    method: 'POST',
    headers: { origin: 'https://www.donventas.mx', 'x-forwarded-for': '203.0.113.10', ...headers },
    socket: {},
    body: {
      nombre: 'Prueba QA',
      correo: 'qa@example.com',
      negocio: 'Negocio de prueba',
      whatsapp: '',
      reto: 'Resumen del diagnóstico',
      paquete: 'Contenido · 12–20 mil MXN',
      consent: true,
      origen: 'landing-contenido-directo',
      submission_key: '12345678-1234-1234-1234-123456789012',
      website: '',
      started_at: Date.now() - 5000,
      ...body
    },
    ...rest
  };
}

function response() {
  return {
    headers: {}, statusCode: 0, payload: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

test.beforeEach(() => handler._test.buckets.clear());

test('allows the governed branch preview origin', () => {
  assert.equal(handler._test.allowedOrigin(request({ headers: { origin: 'https://landing-git-codex-runtime-a650-editorial-don-ventas.vercel.app' } })), true);
});

test('rejects cross-site submissions before storage', async () => {
  const originalFetch = global.fetch;
  let called = false;
  global.fetch = async () => { called = true; return new Response('', { status: 201 }); };
  try {
    const res = response();
    await handler(request({ headers: { origin: 'https://example.com', 'sec-fetch-site': 'cross-site' } }), res);
    assert.equal(res.statusCode, 403);
    assert.equal(called, false);
  } finally { global.fetch = originalFetch; }
});

test('silently accepts the honeypot without writing a lead', async () => {
  const originalFetch = global.fetch;
  let called = false;
  global.fetch = async () => { called = true; return new Response('', { status: 201 }); };
  try {
    const res = response();
    await handler(request({ body: { website: 'https://spam.example' } }), res);
    assert.equal(res.statusCode, 202);
    assert.equal(res.payload.ok, true);
    assert.equal(called, false);
  } finally { global.fetch = originalFetch; }
});

test('rejects an unrealistically fast or incomplete form', async () => {
  const res = response();
  await handler(request({ body: { started_at: Date.now() } }), res);
  assert.equal(res.statusCode, 422);
  assert.equal(res.payload.code, 'submitted_too_fast');
});

test('validates and forwards only the supported lead fields', async () => {
  const originalFetch = global.fetch;
  let stored;
  global.fetch = async (_url, options) => { stored = JSON.parse(options.body); return new Response('', { status: 201 }); };
  try {
    const res = response();
    await handler(request(), res);
    assert.equal(res.statusCode, 201);
    assert.equal(stored.website, undefined);
    assert.equal(stored.started_at, undefined);
    assert.equal(stored.correo, 'qa@example.com');
  } finally { global.fetch = originalFetch; }
});

test('limits repeated server-side submissions in one window', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('', { status: 201 });
  try {
    for (let index = 0; index < 5; index += 1) {
      const res = response();
      await handler(request({ body: { submission_key: `12345678-1234-1234-1234-${String(index).padStart(12, '0')}` } }), res);
      assert.equal(res.statusCode, 201);
    }
    const blocked = response();
    await handler(request({ body: { submission_key: '12345678-1234-1234-1234-999999999999' } }), blocked);
    assert.equal(blocked.statusCode, 429);
  } finally { global.fetch = originalFetch; }
});

test('preserves international phone prefixes and accepts absent WhatsApp without real external writes', async () => {
  const originalFetch = global.fetch;
  let stored;
  global.fetch = async (_url, options) => { stored = JSON.parse(options.body); return new Response('', { status: 201 }); };
  try {
    for (const whatsapp of ['+34 600 000 000', '+52 55 0000 0000', '+54 9 11 0000 0000', '']) {
      const res = response();
      await handler(request({ body: { whatsapp } }), res);
      assert.equal(res.statusCode, 201);
      assert.equal(stored.whatsapp, whatsapp);
    }
  } finally { global.fetch = originalFetch; }
});

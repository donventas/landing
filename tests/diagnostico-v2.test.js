const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const diagnostic = require('../diagnostico-v2.js');

const validContact = {
  name: 'Ramses Anduaga',
  business: 'Joyería Marje',
  email: 'ramses@example.com',
  consent: true
};

test('BUG-001 accepts a contact without a website', () => {
  assert.deepEqual(diagnostic.contactErrors({...validContact, url: ''}), {});
});

test('accepts a complete web address', () => {
  assert.deepEqual(diagnostic.contactErrors({...validContact, url: 'https://joyeriamarje.mx'}), {});
});

test('identifies an invalid web address without blocking an empty value', () => {
  assert.equal(diagnostic.contactErrors({...validContact, url: 'joyeriamarje.mx'}).url, 'Escribe una dirección completa que empiece con https:// o deja este campo vacío.');
  assert.equal(diagnostic.contactErrors({...validContact, url: ''}).url, undefined);
});

test('identifies the specific required contact field', () => {
  const errors = diagnostic.contactErrors({...validContact, email: 'correo-invalido'});
  assert.equal(errors.email, 'Revisa el correo. Ejemplo: nombre@empresa.com');
});

test('shows one economic question and the branch that matches the main content problem', () => {
  const state = {
    outcome: 'orders',
    salesProblem: 'noInquiries',
    nextAction: 'whatsapp',
    attempted: ['internal'],
    proof: ['reviews'],
    businessAudience: 'Vendemos joyería a personas que buscan regalos especiales.',
    timing: 'month',
    budgetBand: 'c_12_20'
  };
  const questions = diagnostic.visibleQuestions('contenido', state);
  assert.equal(questions.filter(question => question.id === 'budgetBand').length, 1);
  assert.equal(questions.some(question => question.id === 'salesProblem'), true);
  assert.equal(questions.some(question => question.id === 'searchProblem'), false);
  assert.match(diagnostic.budgetContext('contenido', state), /casi nadie pregunta o compra/i);
  assert.match(diagnostic.budgetContext('contenido', state), /whatsapp/i);
});

test('uses the main problem to choose the preliminary route before applying the budget', () => {
  const state = {
    outcome: 'search',
    searchProblem: 'noSite',
    nextAction: 'quote',
    attempted: ['none'],
    proof: ['photos'],
    businessAudience: 'Servicios profesionales para negocios locales.',
    timing: 'quarter',
    budgetBand: 'a_25_45'
  };
  assert.equal(diagnostic.recommendation('contenido', state).key, 'autoridad');
  assert.equal(diagnostic.needsSearch(state), true);
});

test('keeps only one budget field across the diagnostic source', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostico-v2.js'), 'utf8');
  assert.doesNotMatch(source, /id:'(?:monthlyBudget|setupBudget|projectBudget)'/);
  assert.equal((source.match(/id:'budgetBand'/g) || []).length, 2);
});

test('routes lead delivery through the same-origin server endpoint', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostico-v2.js'), 'utf8');
  assert.match(source, /LEAD_ENDPOINT:'\/api\/lead'/);
  assert.doesNotMatch(source, /supabase\.co|sb_publishable_/);
});

test('sends the real lead shape and accepts an empty website', async () => {
  const originalFetch = global.fetch;
  const originalLocation = global.location;
  const originalSessionStorage = global.sessionStorage;
  let request;
  global.location = {search: ''};
  global.sessionStorage = {setItem() {}};
  global.fetch = async (url, options) => {
    request = {url, options};
    return new Response('', {status: 201});
  };
  try {
    const instance = Object.create(diagnostic.Diagnostic.prototype);
    instance.route = 'contenido';
    instance.state = {
      name: 'Prueba QA', business: 'Negocio de prueba', email: 'qa@example.com',
      whatsapp: '', url: '', consent: true, submissionKey: 'qa-no-network'
    };
    await instance.sendLead('Resumen de prueba', {name: 'Contenido', band: '12–20 mil MXN al mes'});
    const body = JSON.parse(request.options.body);
    assert.equal(request.url, '/api/lead');
    assert.equal(request.options.headers.apikey, undefined);
    assert.equal(body.reto.includes('URL:'), false);
    assert.equal(body.consent, true);
    assert.equal(body.submission_key, 'qa-no-network');
  } finally {
    global.fetch = originalFetch;
    global.location = originalLocation;
    global.sessionStorage = originalSessionStorage;
  }
});

test('turns a server rejection into a recoverable submission error', async () => {
  const originalFetch = global.fetch;
  const originalLocation = global.location;
  const originalSessionStorage = global.sessionStorage;
  global.location = {search: ''};
  global.sessionStorage = {setItem() {}};
  global.fetch = async () => new Response(JSON.stringify({code: '42501'}), {
    status: 403,
    headers: {'content-type': 'application/json'}
  });
  try {
    const instance = Object.create(diagnostic.Diagnostic.prototype);
    instance.route = 'contenido';
    instance.state = {
      name: 'Prueba QA', business: 'Negocio de prueba', email: 'qa@example.com',
      whatsapp: '', url: '', consent: true, submissionKey: 'qa-error'
    };
    await assert.rejects(
      instance.sendLead('Resumen de prueba', {name: 'Contenido', band: '12–20 mil MXN al mes'}),
      error => error.status === 403 && error.code === '42501'
    );
  } finally {
    global.fetch = originalFetch;
    global.location = originalLocation;
    global.sessionStorage = originalSessionStorage;
  }
});

test('serves brand fonts locally without Google Fonts requests', () => {
  const styles = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  const homepage = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const social = fs.readFileSync(path.join(__dirname, '..', 'social-cards', 'card.css'), 'utf8');
  assert.match(homepage, /assets\/fonts\/fonts\.css/);
  assert.doesNotMatch(styles + social, /fonts\.(?:googleapis|gstatic)\.com/);
  [
    'schibsted-grotesk-latin-normal.woff2',
    'schibsted-grotesk-latin-italic.woff2',
    'space-mono-latin-400.woff2',
    'space-mono-latin-700.woff2'
  ].forEach(file => assert.equal(fs.existsSync(path.join(__dirname, '..', 'assets', 'fonts', file)), true));
});

test('does not install Clarity or expose a session-replay consent banner', () => {
  const source = [
    'app.js', 'index.html', 'branding.html',
    path.join('blog', 'index.html'),
    path.join('blog', 'por-que-nacio-don-ventas.html'),
    path.join('blog', 'contenido-que-atrae-clientes.html')
  ].map(file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')).join('\n');
  assert.doesNotMatch(source, /clarity\.ms|CLARITY_ID|__dvClarity|id="dv-cookie"/i);
  const policy = fs.readFileSync(path.join(__dirname, '..', '15_LEGAL', 'Politica de Cookies.html'), 'utf8');
  assert.match(policy, /No grabamos tus sesiones/);
});

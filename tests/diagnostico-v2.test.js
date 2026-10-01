const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const diagnostic = require('../diagnostico-v2.js');

const validContact = {
  name: 'Ramses Anduaga',
  business: 'Joyería Marje',
  email: 'ramses@example.com',
  businessAudience: 'Vendemos joyería a personas que buscan regalos especiales.',
  timing: 'quarter',
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
    salesProblem: 'noInquiries',
    impact: 'lost',
    outcome: 'orders',
    commercialRoute: 'contenido',
    proof: ['reviews'],
    budgetBand: 'c_12_20'
  };
  const questions = diagnostic.visibleQuestions('contenido', state);
  assert.equal(questions.filter(question => question.id === 'budgetBand').length, 1);
  assert.deepEqual(questions.slice(0, 3).map(question => question.id), ['salesProblem', 'impact', 'outcome']);
  assert.equal(questions.length, 7);
  assert.match(diagnostic.budgetContext('contenido', state), /casi nadie pregunta o compra/i);
  assert.match(diagnostic.budgetContext('contenido', state), /contenido para redes/i);
});

test('uses the main problem to choose the preliminary route before applying the budget', () => {
  const state = {
    salesProblem: 'notFound',
    impact: 'lost',
    outcome: 'search',
    commercialRoute: 'autoridad',
    proof: ['photos'],
    budgetBand: 'a_25_45'
  };
  assert.equal(diagnostic.recommendation('contenido', state).key, 'autoridad');
  assert.equal(diagnostic.needsSearch(state), true);
});

test('shows abbreviated prices with period and VAT disclosure', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostico-v2.js'), 'utf8');
  assert.match(source, /\$12–20 mil MXN \/ mes \+ IVA/);
  assert.match(source, /\$25–45 mil MXN \/ implementación \+ IVA/);
  assert.match(source, /no incluyen IVA/);
});

test('rejects the honeypot while preserving ordinary contacts', () => {
  assert.equal(diagnostic.contactErrors({...validContact, websiteConfirm: 'https://spam.example'}).spam, 'No pudimos validar el formulario. Actualiza la página e inténtalo de nuevo.');
  assert.deepEqual(diagnostic.contactErrors({...validContact, websiteConfirm: ''}), {});
});

test('keeps the B10 logo static and ships the governed fallback assets', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'hero-mark-3d-static.js'), 'utf8');
  assert.doesNotMatch(script, /requestAnimationFrame|uAngle|Math\.PI/);
  ['donventas-symbol-b-reverse.svg', 'donventas-symbol-b-pilot.glb', 'symbol-b-mesh.json', 'donventas-symbol-b-pilot-preview.png']
    .forEach(file => assert.equal(fs.existsSync(path.join(__dirname, '..', 'assets', 'b10-motion', file)), true));
});

test('binds the GLB and mesh to the approved B symbol', () => {
  const assetDir = path.join(__dirname, '..', 'assets', 'b10-motion');
  const expected = {
    'donventas-symbol-b-reverse.svg': 'A5D38AC61E4E34887678988C1731E5D4756A862470662B13CE0B7FE339D59D75',
    'donventas-symbol-b-pilot.glb': 'C3865A7408129313AD27F798A6FB8411AE8207FFB5599689EA6150F4F985C6AC',
    'symbol-b-mesh.json': 'B730CD15D01ECC5E923C22DB172145E4010CDB337E2C01812AE5B4FD61155E1B'
  };
  Object.entries(expected).forEach(([file, hash]) => {
    const bytes = fs.readFileSync(path.join(assetDir, file));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase(), hash);
  });
  const source = fs.readFileSync(path.join(assetDir, 'donventas-symbol-b-reverse.svg'), 'utf8');
  assert.match(source, /viewBox="28 27 49 46"/);
  assert.equal((source.match(/stroke-width="6\.5"/g) || []).length, 2);
  const glb = fs.readFileSync(path.join(assetDir, 'donventas-symbol-b-pilot.glb'));
  assert.equal(glb.readUInt32LE(0), 0x46546c67);
  assert.equal(glb.readUInt32LE(4), 2);
  assert.equal(glb.readUInt32LE(8), glb.length);
  assert.equal(glb.readUInt32LE(16), 0x4e4f534a);
  const jsonLength = glb.readUInt32LE(12);
  const gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8').trim());
  assert.equal(gltf.asset.version, '2.0');
  assert.equal(gltf.meshes.length, 2);
  assert.deepEqual(gltf.materials.map(material => material.name), ['Papel Don Ventas', 'Azul Don Ventas']);
});

test('preserves indexation, structured metadata and keyboard landmarks', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const robots = fs.readFileSync(path.join(__dirname, '..', 'robots.txt'), 'utf8');
  const sitemap = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.donventas\.mx\/">/);
  assert.match(html, /<meta name="robots" content="index,follow/);
  assert.doesNotMatch(html, /noindex/i);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /<a class="skip-link" href="#main-content">/);
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.match(robots, /Sitemap: https:\/\/www\.donventas\.mx\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.donventas\.mx\/<\/loc>/);
});

test('publishes only the two verifiable B10 cases', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const editorial = fs.readFileSync(path.join(__dirname, '..', 'b10-editorial.css'), 'utf8');
  assert.equal((html.match(/class="shot is-public-case"/g) || []).length, 2);
  assert.equal((html.match(/class="shot" hidden/g) || []).length, 0);
  ['Sicarú', 'QuickFinance', '>Pafi<', 'sistema Don Ventas'].forEach(name => assert.doesNotMatch(html, new RegExp(name, 'i')));
  assert.match(html, /<h3 class="n">Arturo Villagomez<\/h3>/);
  assert.doesNotMatch(html, /Arturo Villagómez/);
  assert.match(html, /href="https:\/\/www\.arturovillagomez\.com\/"/);
  assert.match(html, /href="https:\/\/www\.airbnb\.com\/h\/casa-artu-merida-progreso"/);
  assert.match(editorial, /#prueba \.shot:not\(\.is-public-case\)\{display:none\}/);
  assert.match(editorial, /#prueba \.case-stage img\{[^}]*object-fit:contain/);
});

test('reveals prices only after the value sections', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const offer = html.slice(html.indexOf('id="oferta"'), html.indexOf('id="metodo"'));
  const pricing = html.slice(html.indexOf('id="precios"'), html.indexOf('id="preguntas"'));
  assert.doesNotMatch(offer, /\$\d/);
  assert.match(offer, /href="#precios"/);
  assert.match(pricing, /\$12–32 mil/);
  assert.match(pricing, /por mes \+ IVA/);
  assert.match(pricing, /por implementación \+ IVA/);
  assert.match(pricing, /de inicio \+ IVA/);
  assert.ok(html.indexOf('id="precios"') > html.indexOf('id="recursos"'));
});

test('asks branding timing once and keeps period plus VAT in recommendations', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostico-v2.js'), 'utf8');
  assert.equal((source.match(/data-field="timing"/g) || []).length, 1);
  assert.doesNotMatch(source, /id:'month'/);
  assert.match(source, /Sistema esencial',band:'\$18–30 mil MXN \/ primera etapa \+ IVA'/);
  assert.match(source, /Sistema de marca completo',band:'\$31–60 mil MXN \/ primera etapa \+ IVA'/);
});

test('keeps every local landing asset and page link resolvable', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:href|src|data-src)="([^"]+)"/g)].map(match => match[1]);
  const local = refs.filter(ref => !/^(?:https?:|mailto:|#|\/|data:)/.test(ref));
  const missing = local.filter(ref => {
    const cleanRef = decodeURIComponent(ref.split('?')[0].split('#')[0]);
    const target = path.join(root, cleanRef);
    return !(fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html')));
  });
  assert.deepEqual(missing, []);
});

test('keeps only one budget field across the diagnostic source', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostico-v2.js'), 'utf8');
  assert.doesNotMatch(source, /id:'(?:monthlyBudget|setupBudget|projectBudget)'/);
  assert.equal((source.match(/id:'budgetBand'/g) || []).length, 2);
});

test('uses the publishable key as apikey instead of a bearer token', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostico-v2.js'), 'utf8');
  assert.match(source, /'apikey':CONFIG\.SUPABASE_ANON/);
  assert.doesNotMatch(source, /'Authorization':'Bearer '\+CONFIG\.SUPABASE_ANON/);
});

test('serves brand fonts locally without Google Fonts requests', () => {
  const styles = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  const social = fs.readFileSync(path.join(__dirname, '..', 'social-cards', 'card.css'), 'utf8');
  assert.match(styles, /assets\/fonts\/fonts\.css/);
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
    path.join('blog', 'contenido-que-atrae-clientes.html')
  ].map(file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')).join('\n');
  assert.doesNotMatch(source, /clarity\.ms|CLARITY_ID|__dvClarity|id="dv-cookie"/i);
  const policy = fs.readFileSync(path.join(__dirname, '..', '15_LEGAL', 'Politica de Cookies.html'), 'utf8');
  assert.match(policy, /No grabamos tus sesiones/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const pages = ['index.html', 'branding.html', 'diagnostico.html', 'blog/index.html', 'blog/por-que-nacio-don-ventas.html', 'blog/contenido-que-atrae-clientes.html'];
const graph = file => JSON.parse(read(file).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const plain = value => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

test('public service coverage is remote and international, not restricted to Mexico or business size', () => {
  for (const file of ['index.html', 'branding.html']) {
    const nodes = graph(file).filter(node => node.areaServed);
    assert.ok(nodes.length);
    for (const node of nodes) assert.equal(node.areaServed, 'Atención remota internacional en español');
    const service = graph(file).find(node => node['@type'] === 'Service');
    assert.equal(service.audience.audienceType, 'Profesionales, emprendimientos y empresas de habla hispana');
    assert.doesNotMatch(read(file), /para negocios de México|proyectos remotos en México|\b(?:PyMEs|mipymes)\b/i);
  }
  assert.match(read('llms.txt'), /atención remota internacional en español/i);
  assert.doesNotMatch(read('llms.txt'), /para negocios de México|proyectos remotos en México/);
});

test('the approved definition is readable HTML and matches the organization description', () => {
  const home = read('index.html');
  const definition = home.match(/<p id="que-es-don-ventas">([^<]+)<\/p><p>([^<]+)<\/p>/);
  assert.ok(definition);
  const org = graph('index.html').find(node => node['@id'] === 'https://www.donventas.mx/#org');
  assert.equal(org.description, definition[1] + ' ' + definition[2]);
  assert.equal(org.contactPoint.availableLanguage, 'es');
  assert.equal(org.founder['@id'], 'https://www.donventas.mx/#quien');
  // Do not mistake the founder's personal site for an official corporate social profile.
  assert.equal(org.sameAs, undefined);
});

test('international coverage FAQ agrees with visible text on both commercial pages', () => {
  for (const file of ['index.html', 'branding.html']) {
    const question = graph(file).find(node => node['@type'] === 'FAQPage').mainEntity.find(q => q.name === '¿Puedo trabajar con Don Ventas desde otro país?');
    assert.ok(question);
    const details = [...read(file).matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].find(match => plain(match[1]) === question.name);
    assert.ok(details);
    assert.equal(plain(details[2]), question.acceptedAnswer.text);
    assert.match(question.acceptedAnswer.text, /MXN y no incluyen IVA/);
    assert.match(question.acceptedAnswer.text, /alcance y los horarios/);
  }
});

test('every active portal link discloses coming-soon status without changing its destination', () => {
  for (const file of pages) {
    const links = [...read(file).matchAll(/<a\b[^>]*href="https:\/\/app\.donventas\.mx\/?"[^>]*>([\s\S]*?)<\/a>/g)];
    assert.ok(links.length, file);
    for (const link of links) assert.match(plain(link[1]), /Portal · próximamente/, file);
  }
});

test('international contact stays optional and includes a country-code hint', () => {
  const source = read('diagnostico-v2.js');
  const input = source.match(/<input data-field="whatsapp"[^>]+>/)[0];
  assert.match(input, /type="tel"/);
  assert.match(input, /autocomplete="tel"/);
  assert.doesNotMatch(input, /required|pattern=/);
  assert.match(source, /incluye el código de país/);
  assert.doesNotMatch(read('diagnostico.html'), /Presupuesto al inicio/);
  assert.match(read('diagnostico.html'), /el presupuesto se pregunta después/);
});

test('all affected pages preserve indexability and production canonicals, without artificial locales', () => {
  for (const file of pages) {
    const html = read(file);
    assert.match(html, /name="robots" content="index,follow/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.donventas\.mx\//);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.doesNotMatch(html, /hreflang=/);
  }
  assert.match(read('robots.txt'), /User-agent: OAI-SearchBot\s+Allow: \//);
});

test('the discovery route from the editorial hub reaches an existing service section', () => {
  assert.match(read('blog/index.html'), /href="\/#servicios" data-blog-entry="situacion-buscadores"/);
  assert.match(read('index.html'), /id="servicios"/);
  assert.doesNotMatch(read('blog/index.html'), /href="\/#oferta"/);
});

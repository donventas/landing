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

test('uses the publishable key as apikey instead of a bearer token', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostico-v2.js'), 'utf8');
  assert.match(source, /'apikey':CONFIG\.SUPABASE_ANON/);
  assert.doesNotMatch(source, /'Authorization':'Bearer '\+CONFIG\.SUPABASE_ANON/);
});

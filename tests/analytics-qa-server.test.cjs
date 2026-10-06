const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const serverSource = fs.readFileSync(path.join(root, 'scripts/analytics-qa-server.cjs'), 'utf8');
const analyticsSource = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');

// Exercise request handling without opening a socket or contacting Google.
function server(debug, script = analyticsSource, extra = []) {
  let handler, binding;
  vm.runInNewContext(serverSource, {
    require(name) {
      if (name === 'node:http') return {createServer(fn) {
        handler = fn;
        return {listen(port, host) {binding = {port, host};}};
      }};
      if (name === 'node:fs') return {
        existsSync() {return false;},
        readFileSync: fs.readFileSync,
        readFile(filename, callback) {callback(null, Buffer.from(script));}
      };
      return require(name);
    },
    __dirname: path.join(root, 'scripts'), process: {argv: (debug ? ['--google-debug'] : []).concat(extra)},
    URL, Buffer, console
  });
  return {binding, request(url, method = 'GET') {
    let status = 200, body = '', headers = {};
    handler({url, method, resume() {}}, {
      writeHead(code) {status = code;}, setHeader(key, value) {headers[key] = value;},
      end(value) {body = value == null ? '' : value.toString();}
    });
    return {status, body, headers};
  }};
}

test('QA server defaults to unmodified analytics and a loopback-only mock endpoint', () => {
  const qa = server(false);
  assert.deepEqual(qa.binding, {port: 8785, host: '127.0.0.1'});
  assert.equal(qa.request('/analytics.js').body, analyticsSource);
  assert.deepEqual(JSON.parse(qa.request('/api/lead', 'POST').body), {ok: true, qa: true});
});

test('Google QA is explicit, marked developer/debug, restricted to localhost and not deployed', () => {
  const qa = server(true), result = qa.request('/analytics.js');
  assert.deepEqual(qa.binding, {port: 8786, host: '127.0.0.1'});
  assert.equal(result.status, 200);
  assert.match(result.body, /hostname === 'localhost' && root.location.port === '8786'/);
  assert.match(result.body, /debug_mode: true, traffic_type: 'developer'/);
  assert.match(result.body, /clean\.debug_mode = true; clean\.traffic_type = 'developer'/);
  assert.match(result.body, /QA LOCAL: Google real/);
  assert.equal(qa.request('/__qa').status, 404);
  assert.equal(qa.request('/__qa-events.js').status, 404);
  assert.match(fs.readFileSync(path.join(root, '.vercelignore'), 'utf8'), /scripts\//);
  assert.equal(fs.readFileSync(path.join(root, 'analytics.js'), 'utf8'), analyticsSource);
});

test('Google QA refuses to enable when the deployment source contract changes', () => {
  const result = server(true, 'changed source').request('/analytics.js');
  assert.equal(result.status, 500);
  assert.match(result.body, /refusing to enable Google/);
});

test('QA failure is explicit and only the first attempt fails, allowing a genuine UI retry', () => {
  const qa = server(true, analyticsSource, ['--fail-first']);
  assert.equal(qa.request('/api/lead', 'POST').status, 503);
  const retry = qa.request('/api/lead', 'POST');
  assert.equal(retry.status, 200);
  assert.equal(JSON.parse(retry.body).qa, true);
});

test('CSP QA reuses the exact production policy and refuses unknown HTML routes', () => {
  const qa = server(true, '<head></head>', ['--csp','--health']);
  const result = qa.request('/branding.html');
  const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
  assert.equal(result.headers['Content-Security-Policy'], config.headers.find(r=>r.source==='/branding.html').headers[0].value);
  assert.match(result.body, /analytics-qa-health.js/);
  const diagnostic = qa.request('/diagnostico.html');
  assert.equal(diagnostic.status, 200);
  assert.equal(diagnostic.headers['Content-Security-Policy'], config.headers.find(r=>r.source==='/diagnostico.html').headers[0].value);
  assert.doesNotMatch(diagnostic.headers['Content-Security-Policy'], /unsafe-eval|script-src[^;]*unsafe-inline/);
  assert.equal(qa.request('/unknown.html').status, 500);
  assert.match(fs.readFileSync(path.join(root,'.vercelignore'),'utf8'), /scripts\/analytics-qa-health.js/);
});

test('local CSP diagnostics redact source querystrings and deduplicate violations', () => {
  const handlers = {}, output = {textContent: ''};
  const panel = {querySelector: () => output, addEventListener() {}};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'scripts/analytics-qa-health.js'), 'utf8'), {
    location: {hostname: 'localhost', port: '8786'}, URL, innerWidth: 390,
    performance: {now: () => 11000, getEntriesByType: () => []},
    document: {addEventListener: (name, fn) => {handlers[name] = fn;},
      createElement: () => panel, body: {appendChild() {}}},
    setInterval() {}
  });
  const event = {effectiveDirective: 'img-src',
    blockedURI: 'https://fonts.gstatic.com/image?q=private',
    sourceFile: 'https://www.googletagmanager.com/debug/bootstrap?token=private#secret',
    lineNumber: 12, columnNumber: 4};
  handlers.securitypolicyviolation(event);
  handlers.securitypolicyviolation(event);
  handlers.DOMContentLoaded();
  const result = JSON.parse(output.textContent);
  assert.equal(result.cspViolationSources.length, 1);
  assert.equal(result.cspViolationSources[0].source, 'https://www.googletagmanager.com/debug/bootstrap');
  assert.equal(result.cspViolationSources[0].blockedOrigin, 'https://fonts.gstatic.com');
  assert.doesNotMatch(output.textContent, /private|secret|token=|\?q=/);
});

'use strict';
// Vercel previews are for visual review, never for commercial delivery.
// No request body, recipient configuration or transport is read on this path.
function reviewResponse(req, res, endpoint, env = process.env) {
  if (env.VERCEL_ENV !== 'preview') return false;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (endpoint === 'article-message' && req.method === 'GET') {
    res.statusCode = 200;
    res.end(JSON.stringify({ enabled: true, mode: 'simulation', gifts_enabled: false, preview: true }));
  } else {
    res.statusCode = 503;
    res.end(JSON.stringify({ ok: false, code: 'unavailable', preview: true }));
  }
  return true;
}
module.exports = { reviewResponse };

'use strict';
const { createHandler } = require('../lib/article-comments/service.cjs');
const { configuration } = require('../lib/article-comments/runtime.cjs');
const { reviewResponse } = require('../lib/preview-safety.cjs');
module.exports = (req, res) => {
  if (reviewResponse(req, res, 'article-message')) return;
  return createHandler(configuration() || {})(req, res);
};

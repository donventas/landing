'use strict';
const { createHandler } = require('../lib/article-comments/service.cjs');
const { configuration } = require('../lib/article-comments/runtime.cjs');
module.exports = (req, res) => createHandler(configuration() || {})(req, res);

'use strict';
// Apply only the recorded editorial exceptions to the historic preservation baseline.
// The rest of each page remains subject to the original exact comparison.
const changes = require('../fixtures/editorial-punctuation.json');
module.exports = function applyApprovedEditorialPunctuation(html, file) {
  for (const [before, after] of changes[file] || []) {
    if (!html.includes(before)) throw new Error('Editorial baseline changed: ' + file);
    html = html.replace(before, () => after);
  }
  return html;
};

/* Editorial frequency: number of published article bodies mentioning a concept.
   Read-only report. Update data-frequency/order in HTML through reviewed edits. */
const fs = require('node:fs');
const path = require('node:path');
const { normalizeTerm } = require('../blog/glosario.js');
function articleText(html) {
  const bodies = []; let depth = 0, start = 0;
  for (const tag of html.matchAll(/<\/?article\b[^>]*>/gi)) {
    if (!tag[0].startsWith('</')) { if (depth++ === 0) start = tag.index + tag[0].length; }
    else if (depth > 0 && --depth === 0) bodies.push(html.slice(start, tag.index));
  }
  return normalizeTerm(bodies.join(' ')
    .replace(/<(script|style|nav|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp|quot|#\d+);/g, ' '));
}
function mentions(text, aliases) {
  return aliases.some(alias => {
    const escaped = normalizeTerm(alias).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(?:^|[^a-z0-9])' + escaped + '(?=$|[^a-z0-9])').test(text);
  });
}
function inventory(root) {
  const dir = path.join(root, 'blog');
  const glossary = fs.readFileSync(path.join(dir, 'glosario.html'), 'utf8');
  const articles = fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(file => ({file, html: fs.readFileSync(path.join(dir, file), 'utf8')}))
    .filter(a => /"@type"\s*:\s*"BlogPosting"/.test(a.html));
  return [...glossary.matchAll(/<section class="glossary-entry" id="([^"]+)"[^>]*data-aliases="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].map(([,id,aliases,body]) => {
    const files = articles.filter(a => mentions(articleText(a.html), aliases.split('|'))).map(a => a.file);
    return {id, title: body.match(/<h2[^>]*>([^<]+)<\/h2>/)[1], count: files.length, files};
  }).sort((a,b) => b.count-a.count || a.title.localeCompare(b.title,'es'));
}
module.exports = {articleText, mentions, inventory};
if (require.main === module) console.log(JSON.stringify(inventory(path.resolve(__dirname, '..')), null, 2));

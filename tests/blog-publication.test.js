// Structural release checks, not a substitute for source/voice or browser review.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const blog = path.join(root, 'blog');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const hub = fs.readFileSync(path.join(blog, 'index.html'), 'utf8');
const files = fs.readdirSync(blog).filter(file => file.endsWith('.html') && file !== 'index.html');
const text = value => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const attr = (html, tag, name, value, result) => {
  const element = [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))]
    .map(match => match[0]).find(item => item.includes(`${name}="${value}"`));
  return element?.match(new RegExp(`\\b${result}="([^"]*)"`))?.[1];
};

for (const file of files) {
  const html = fs.readFileSync(path.join(blog, file), 'utf8');
  const url = `https://www.donventas.mx/blog/${file}`;
  test(`${file}: discovery, single topic, authorship and metadata agree`, () => {
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    assert.equal(headings.length, 1);
    assert.ok(text(headings[0][1]));
    assert.ok(html.match(/<title>[^<]+<\/title>/));
    assert.equal(attr(html, 'link', 'rel', 'canonical', 'href'), url);
    assert.equal(attr(html, 'meta', 'property', 'og:url', 'content'), url);
    assert.match(attr(html, 'meta', 'name', 'robots', 'content'), /^index,follow/);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
    assert.ok(hub.includes(`href="/blog/${file}"`));
    const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    const nodes = scripts.flatMap(match => {
      const data = JSON.parse(match[1]);
      return data['@graph'] || [data];
    });
    const posts = nodes.filter(item => item['@type'] === 'BlogPosting');
    assert.equal(posts.length, 1);
    const post = posts[0];
    assert.equal(post.mainEntityOfPage, url);
    assert.equal(text(post.headline).replace(/[.]$/, ''), text(headings[0][1]).replace(/[.]$/, ''));
    assert.equal(post.description, attr(html, 'meta', 'name', 'description', 'content'));
    assert.equal(post.datePublished, attr(html, 'meta', 'property', 'article:published_time', 'content'));
    assert.equal(post.dateModified, attr(html, 'meta', 'property', 'article:modified_time', 'content'));
    assert.ok(Number.isFinite(Date.parse(post.datePublished)));
    assert.ok(Date.parse(post.dateModified) >= Date.parse(post.datePublished));
    const author = post.author.name ? post.author : nodes.find(item => item['@id'] === post.author['@id']);
    assert.ok(author?.name && author?.url);
    const byline = html.match(/<a\b[^>]*rel="author"[^>]*>([\s\S]*?)<\/a>/);
    assert.ok(byline, 'Visible author link required');
    assert.equal(text(byline[1]), author.name);
    assert.equal(attr(html, 'a', 'rel', 'author', 'href'), author.url);
  });

  test(`${file}: local destinations and image candidates exist`, () => {
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
    for (const match of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
      references.push(...match[1].split(',').map(item => item.trim().split(/\s+/)[0]));
    }
    for (const ref of references) {
      if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(ref) || ref === '/_vercel/insights/script.js') continue;
      const [rawPath, fragment] = ref.split('#');
      let destination = rawPath ? path.resolve(rawPath.startsWith('/') ? root : blog, decodeURIComponent(rawPath.split('?')[0]).replace(/^\//, '')) : path.join(blog, file);
      assert.ok(fs.existsSync(destination), `Missing ${ref}`);
      if (fs.statSync(destination).isDirectory()) destination = path.join(destination, 'index.html');
      if (fragment) {
        assert.ok(fs.readFileSync(destination, 'utf8').includes(`id="${decodeURIComponent(fragment)}"`), `Missing anchor ${ref}`);
      }
    }
    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      assert.match(match[0], /\balt="[^"]*"/);
      assert.match(match[0], /\bwidth="\d+"/);
      assert.match(match[0], /\bheight="\d+"/);
    }
    const preload = html.match(/<link\b[^>]*as="image"[^>]*>/)?.[0];
    const eager = html.match(/<img\b[^>]*loading="eager"[^>]*>/)?.[0];
    if (preload && eager) {
      assert.equal(preload.match(/imagesrcset="([^"]+)"/)?.[1], eager.match(/\bsrcset="([^"]+)"/)?.[1]);
      assert.equal(preload.match(/imagesizes="([^"]+)"/)?.[1], eager.match(/\bsizes="([^"]+)"/)?.[1]);
    }
  });
}

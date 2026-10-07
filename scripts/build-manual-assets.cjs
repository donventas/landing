// Mechanical image encoding only: no generative edits, retouching or cropping.
// Usage: NODE_PATH=<bundled packages> node scripts/build-manual-assets.cjs <master.png>
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
(async () => {
  const source = process.argv[2];
  if (!source || !fs.existsSync(source)) throw Error('Pass the selected generated PNG master');
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 1536 || metadata.height !== 1024) throw Error('Expected 1536 × 1024 master');
  const qa = path.join(root, '.qa-manual');
  fs.mkdirSync(qa, { recursive: true });
  fs.copyFileSync(source, path.join(qa, 'manual-busqueda-v3-master.png'));
  const files = [];
  for (const width of [480, 960, 1536]) {
    const name = `assets/editorial/manual-busqueda-v3-${width}.webp`;
    await sharp(source).resize({ width }).webp({ quality: 82, effort: 6 }).toFile(path.join(root, name));
    files.push(name);
  }
  const social = 'assets/editorial/manual-busqueda-v3-social.jpg';
  // Contain the complete scene; do not lose the booklet or either character in 1.91:1.
  await sharp(source).resize(1200, 630, { fit: 'contain', background: '#eeeae5' }).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, social));
  files.push(social);
  const results = [];
  for (const file of files) {
    const bytes = fs.readFileSync(path.join(root, file));
    const info = await sharp(bytes).metadata();
    results.push({ file, bytes: bytes.length, width: info.width, height: info.height, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  }
  const masterSha256 = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  fs.writeFileSync(path.join(qa, 'assets.json'), JSON.stringify({masterSha256, files: results}, null, 2));
  console.log(JSON.stringify({masterSha256, files: results}, null, 2));
})();

// Format-only export: preserve the approved cover without cropping either character.
const path = require('node:path');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = path.resolve(__dirname, '..');
sharp(path.join(root, 'assets/editorial/hub-el-don-v1-720.webp'))
  .jpeg({quality: 88, mozjpeg: true})
  .toFile(path.join(root, 'og-blog-el-don-v1.jpg'))
  .then(info => console.log(info))
  .catch(error => { console.error(error); process.exitCode = 1; });

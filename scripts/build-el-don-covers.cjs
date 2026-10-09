// Format/size derivatives only. All creative edits were made with built-in image_gen.
const sharp = require('C:/Users/artur/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const generated = 'C:/Users/artur/.codex/generated_images/01a0e3a5-89f9-7ed2-a646-85577507f784';
const jobs = [
  ['hub-el-don-v1', 'exec-4dd61dfb-da17-4cc1-882a-175e92fb5891.png', [480,720]],
  ['fundador-el-don-v1', 'exec-2e69cc2a-a877-43c8-8e14-675a5be726d8.png', [480,768,1024]],
  ['barberia-el-don-v1', 'exec-5290af8e-20bd-443f-8b6e-1d283ff18a75.png', [480,960,1440]],
  ['joyeria-el-don-v1', 'exec-0bfd271b-9341-4f74-8c12-29f6ccb3489a.png', [480,960,1440]],
];
(async()=>{
  fs.mkdirSync(path.join(root,'.qa-el-don'),{recursive:true});
  for(const [name,file,widths] of jobs){
    const source=path.join(generated,file);
    fs.copyFileSync(source,path.join(root,'.qa-el-don',`${name}-master.png`));
    for(const width of widths){
      const out=path.join(root,'assets/editorial',`${name}-${width}.webp`);
      await sharp(source).resize({width}).webp({quality:80,effort:6}).toFile(out);
      console.log(path.basename(out),fs.statSync(out).size);
    }
  }
  for (const [name, output] of [['barberia-el-don-v1','og-article-entender-el-don-v1.jpg'],['joyeria-el-don-v1','og-marca-el-don-v1.jpg']]) {
    await sharp(path.join(root,'.qa-el-don',`${name}-master.png`))
      .resize(1200,630,{fit:'contain',background:'#11161E'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,output));
  }
  // These PNGs are browser renders of the editable social-cards/fundacional*.html templates.
  for(const height of [630,900,1200]){
    const source=path.join(root,'.qa-el-don',`social-${height}.png`);
    if(fs.existsSync(source))await sharp(source).jpeg({quality:88,mozjpeg:true})
      .toFile(path.join(root,`og-fundacional-el-don-v1-1200x${height}.jpg`));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});

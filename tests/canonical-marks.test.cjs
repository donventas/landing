const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pages=['index.html','branding.html','diagnostico.html','blog/index.html','blog/por-que-nacio-don-ventas.html','blog/contenido-que-atrae-clientes.html',...fs.readdirSync(path.join(root,'15_LEGAL')).filter(x=>x.endsWith('.html')).map(x=>'15_LEGAL/'+x)];
test('protected web marks match Runtime canon 3.0 pinned at 0c002aa',()=>{
 for(const [p,sha] of Object.entries({'favicon.svg':'972c449b8a1341cba4e0377f09a47b45200fe4b50a1ce4f3e182ee143b1326e4','assets/brand/donventas-wordmark-b6-reverse.svg':'94f2f1d53617e8611ca759b97ee3b7e390d60bb1587dbc2f5e0312ebce29edde','assets/brand/donventas-symbol-b-reverse.svg':'b7ff4ddcb3fb38a956c87c90815a184261d3e821646c1cf3dc189d76ebc7003e'}))assert.equal(crypto.createHash('sha256').update(read(p).replace(/\r\n/g,'\n')).digest('hex'),sha,p);
});
test('all public heads including unpacked legal documents have versioned icons',()=>{
 for(const p of pages){const html=read(p);const packed=html.match(/<script[^>]+__bundler.template[^>]*>([\s\S]*?)<\/script>/);for(const doc of [html,...(packed?[JSON.parse(packed[1])]:[])]){const head=doc.split('</head>')[0];for(const icon of ['favicon.svg','favicon-32.png','apple-touch-icon.png'])assert.ok(head.includes('/'+icon+'?v=canon-3-20261004'),p+' '+icon);}}
});
test('blog and diagnostic navigation consume B6 instead of hand-drawn legacy marks',()=>{
 for(const p of pages.filter(p=>p.startsWith('blog/')||p==='diagnostico.html')){const html=read(p);assert.match(html,/class="brand-wordmark" src="\/assets\/brand\/donventas-wordmark-b6-reverse.svg"/);assert.ok(!html.includes('M22 16 L22 84 L58 50 Z'),p);for(const mascot of html.match(/<svg class="(?:eldon|feature-watermark|manifesto-mark)"[\s\S]*?<\/svg>/g)||[])assert.ok(!mascot.includes('#F2F5F9'),p);}
});
test('raster favicons have exact delivery dimensions and an ICO fallback',()=>{
 for(const [p,size] of [['favicon-32.png',32],['favicon-192.png',192],['apple-touch-icon.png',180]]){const b=fs.readFileSync(path.join(root,p));assert.equal(b.readUInt32BE(16),size);assert.equal(b.readUInt32BE(20),size);}
 const ico=fs.readFileSync(path.join(root,'favicon.ico'));assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),1);assert.equal(ico.readUInt32LE(14),ico.length-22);
});
test('social templates no longer consume the retired horizontal mark',()=>{
 for(const p of fs.readdirSync(path.join(root,'social-cards')).filter(x=>x.endsWith('.html')))assert.ok(!read('social-cards/'+p).includes('horizontal-curvas-reverse.svg'),p);
});
test('exported social PNGs retain the declared 1200 by 630 frame',()=>{
 for(const p of ['og-content.png','og-diagnostico.png','og-branding.png']){const b=fs.readFileSync(path.join(root,p));assert.equal(b.readUInt32BE(16),1200,p);assert.equal(b.readUInt32BE(20),630,p);}
});

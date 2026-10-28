'use strict';
// Narrow, reproducible asset integration: never changes the shared proposal image.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=process.argv[2];
if(!source)throw Error('source_directory_required');
const assets={
 'hero-entrega-escritorio-p11.png':'C7322CCDAACD01C8C006B5B1608078D86EB9F1AD3A992E5E1F91EE66E85F4C66',
 'hero-entrega-movil-p11.png':'4C53CAC0955A43E746B3496F134480548EBCCFDE85FBC071FC136E596DA80067'
};
const prefix='/assets/portal-launch/bici-story/video-base/assets/naturalidad-p04/';
for(const [name,expected] of Object.entries(assets)){
 const bytes=fs.readFileSync(path.join(source,name));
 if(crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase()!==expected)throw Error('source_hash_changed:'+name);
 fs.copyFileSync(path.join(source,name),path.join(root,prefix.slice(1),name));
}
const target=path.join(root,'portafolio/vuelta-27/index.html'),html=fs.readFileSync(target,'utf8');
const before=html.match(/<header class="proposal-cover[\s\S]*?<\/header>/)?.[0];
const picture=`<picture class="surface-media"><source media="(max-width:680px)" srcset="${prefix}hero-entrega-movil-p11.png"><img src="${prefix}hero-entrega-escritorio-p11.png" width="1942" height="809" alt="Una niña recibe su bicicleta reparada junto a su madre y el mecánico, afuera del taller conceptual de Vuelta 27."></picture>`;
if(!/<div class="shop-opening shop-hero photo-surface"><picture[\s\S]*?<\/picture>/.test(html))throw Error('hero_not_found');
const updated=html.replace(/(<div class="shop-opening shop-hero photo-surface">)<picture[\s\S]*?<\/picture>/,'$1'+picture)
 .replace(/<figure class="scene"><div class="shop-scene">[\s\S]*?<\/figure>/,'');
if(updated.match(/<header class="proposal-cover[\s\S]*?<\/header>/)?.[0]!==before)throw Error('proposal_changed');
fs.writeFileSync(target,updated);console.log('Hero candidate integrated; proposal unchanged.');

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validate}=require('../lib/article-comments/service.cjs'),gifts=require('../blog/article-gifts.json');
const slug='como-crear-una-marca',gift=gifts.articles[slug],root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('brand creation options are explicit server-owned choices and not automatic commercial intent',()=>{
 const body={article_id:slug,submission_key:'12345678-1234-4123-8123-123456789abc',email:'qa@example.test',name:'',newsletter:false,website:'',survey:{version:gifts.version,answers:gift.questionOptions.map(options=>options[0])}};
 const data=validate(body);assert.equal(data.newsletter,false);assert.equal(data.name,'');assert.match(data.message,/Tengo una idea/);
 for(const option of ['','arbitrary value','<script>alert(1)</script>']){const invalid=structuredClone(body);invalid.survey.answers[0]=option;assert.throws(()=>validate(invalid),{code:'invalid',field:'survey'});}
 for(let index=0;index<3;index++)for(const option of gift.questionOptions[index]){const valid=structuredClone(body);valid.survey.answers[index]=option;assert.equal(validate(valid).survey.answers[index],option);}
});
test('new article consumes approved artwork consistently and has no draft questionnaire',()=>{
 const html=read('blog/'+slug+'.html');assert.doesNotMatch(html,/\/previews\/|reading-poll|draft-gift|La Cuqui/);
 assert.match(html,/cafetería ficticia/);assert.match(html,/data-gift-discovery="steps"/);
 const og=html.match(/property="og:image" content="([^"]+)"/)[1],tw=html.match(/name="twitter:image" content="([^"]+)"/)[1];assert.equal(og,tw);assert.match(og,/portada-social-v1.jpg$/);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(schema.image.url,og);
 assert.ok(fs.statSync(path.join(root,new URL(og).pathname)).size<250000);
 const hub=JSON.parse(read('blog/index.html').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);const list=hub['@graph'][0].mainEntity;
 assert.equal(list.numberOfItems,9);assert.ok(list.itemListElement.some(item=>item.url.endsWith('/'+slug+'.html')));
});
test('migration only adds the article to guarded intake and fails closed on drift',()=>{
 const sql=read('supabase/migrations/008_article_brand_creation.sql');assert.match(sql,/article_allowlist_drift/);assert.match(sql,/dv_article_receive_v1/);assert.match(sql,/como-crear-una-marca/);assert.doesNotMatch(sql,/grant |drop table|disable row level/i);
});

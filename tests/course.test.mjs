import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createHash} from 'node:crypto';import {stages,tasks,criteria} from '../content/course.mjs';import '../src/core.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function validate(d){
 const products=new Map(d.products.map(p=>[p.id,p])),stock=new Map(d.stock.map(s=>[s.id,s])),orders=new Map(d.orders.map(o=>[o.id,o])),users=new Map(d.users.map(u=>[u.id,u]));
 assert.equal(products.size,31);assert.equal(stock.size,92);assert.equal(orders.size,10);assert.equal(users.size,20);assert.equal(d.items.length,30);
 assert.equal(new Set(d.stock.map(s=>s.product_id+':'+s.size)).size,92);
 assert(d.stock.every(s=>products.has(s.product_id)&&d.sizes.includes(s.size)&&Number.isInteger(s.available)&&s.available>=0));
 assert(d.orders.every(o=>users.has(o.user_id)&&!o.stock_accounted));
 assert(d.items.every(i=>orders.has(i.order_id)&&stock.has(i.stock_id)&&i.quantity>0));
}
test('original sample imports every row and resolves explicit model aliases',()=>{
 const sample=read('content/sample.json');
 validate(sample);
 for(const product of sample.products)assert(fs.existsSync('materials/resources/Images/'+product.image));
});
test('all 30 authored variants preserve referential integrity and provide full source inputs',()=>{const variants=read('content/variants.json');assert.equal(variants.length,30);for(const v of variants){const d=read(`content/variants/${v.id}/data.json`);validate(d);assert(d.users.every(u=>u.login.startsWith(v.id.toLowerCase()+'_')));for(const name of ['products','stock','sizes','users','orders','items'])assert(fs.existsSync(`content/variants/${v.id}/${name}.csv`));}});
test('independently recomputed control prices use previous calendar month',()=>{for(const id of ['sample',...read('content/variants.json').map(v=>v.id)]){const d=read(id==='sample'?'content/sample.json':`content/variants/${id}/data.json`),control=read(id==='sample'?'docs/sample-control.json':`docs/variant-controls/${id}.json`);const aprilOrders=new Set(d.orders.filter(o=>o.date>='2026-04-01'&&o.date<'2026-05-01').map(o=>o.id));const stock=new Map(d.stock.map(s=>[s.id,s]));const sold=new Set(d.items.filter(i=>aprilOrders.has(i.order_id)).map(i=>stock.get(i.stock_id).product_id));for(const p of d.products){const cents=BigInt(Math.round(Number(p.price)*100));const discounted=!sold.has(p.id);const expected=Number(discounted?(cents*3n+2n)/4n:cents)/100;const actual=control.find(c=>c.id===p.id);assert.equal(Number(actual.price),expected);assert.equal(actual.discount,discounted);assert.equal(actual.quantity,d.stock.filter(s=>s.product_id===p.id).reduce((n,s)=>n+s.available,0));}}});
test('four requirements and official invariant criteria total 75',()=>{assert.equal(tasks.length,4);assert.equal(criteria.reduce((n,c)=>n+c[1],0),75);assert(stages.flatMap(s=>s.steps).every(x=>x.title&&x.why&&x.actions.length&&x.check));});
test('every teaching file is included in code for the learning and presentation route',()=>{const context={};vm.runInNewContext(fs.readFileSync('site/content.js','utf8'),context);for(const s of stages.flatMap(s=>s.steps))if(s.file)assert(context.COURSE.code[s.file],s.file);assert.equal(context.COURSE.stages.length,5);});
test('ER describes every SQL table, field and foreign key',()=>{const er=read('content/er.json');assert.equal(er.tables.length,10);assert.equal(er.links.length,10);for(const l of er.links){assert(er.tables.find(t=>t.id===l.source).fields.some(f=>f.id===l.field&&f.fk));assert(er.tables.find(t=>t.id===l.target).fields.some(f=>f.id===l.key&&f.pk));}assert(fs.statSync('materials/ER.pdf').size>10000);});
test('training pauses, mock cannot pause, finished attempts cap elapsed time',()=>{const C=globalThis.ExamCore;let t=C.transition(C.freshTimer(210*60,'training',1000),'start',1000);t=C.transition(t,'pause',6000);assert.equal(C.timerView(t,50000).used,5000);assert.equal(C.restoreTimer(JSON.stringify(t),210*60,'training').status,'paused');assert.throws(()=>C.transition(C.transition(C.freshTimer(60,'mock',0),'start',0),'pause',1000));t=C.transition(t,'start',60000);t=C.transition(t,'finish',90000000);assert.equal(C.timerView(t).used,t.durationMs);});
function zipEntries(name) {
 const zip = fs.readFileSync(`site/downloads/${name}.zip`);
 const entries = new Map();
 let offset = 0;
 while (zip.readUInt32LE(offset) === 0x04034b50) {
  const nameStart = offset + 30;
  const nameEnd = nameStart + zip.readUInt16LE(offset + 26);
  const bodyStart = nameEnd + zip.readUInt16LE(offset + 28);
  const bodyEnd = bodyStart + zip.readUInt32LE(offset + 18);
  entries.set(zip.subarray(nameStart, nameEnd).toString(), zip.subarray(bodyStart, bodyEnd));
  offset = bodyEnd;
 }
 return entries;
}

test('all exam downloads are complete and cover the stock and discount boundaries', () => {
 const bundle = zipEntries('exam-30-variants');
 const variants=read('content/variants.json');
 const sample=read('content/sample.json');
 const schema=fs.readFileSync('scripts/schema.sql','utf8');
 const context={};
 vm.runInNewContext(fs.readFileSync('site/content.js','utf8'),context);
 assert.equal(bundle.size,30);
 assert.equal(new Set(variants.map(variant=>variant.title)).size,30);
 for (const variant of variants) {
  const name = `exam-${variant.id}`;
  const files = zipEntries(name);
  assert.deepEqual(bundle.get(name+'.zip'),fs.readFileSync('site/downloads/'+name+'.zip'));
  for (const input of ['data.json','Задание.md','products.csv','stock.csv','sizes.csv','users.csv','orders.csv','items.csv']) {
   assert.deepEqual(files.get(input),fs.readFileSync(`content/variants/${variant.id}/${input}`));
  }
  const data=JSON.parse(files.get('data.json'));
  const variantSchema=fs.readFileSync(`content/variants/${variant.id}/database.sql`,'utf8');
  assert(variantSchema.includes(schema));
  assert.deepEqual(Object.fromEntries(Object.entries(data).map(([key,rows])=>[key,rows.length])),
    Object.fromEntries(Object.entries(sample).map(([key,rows])=>[key,rows.length])));
  const brief=files.get('Задание.md').toString().replaceAll('\r\n','\n');
  assert(brief.startsWith(`# ${variant.id} · ${variant.title}\n`));
  assert(!brief.includes('Чудо Обувь'));
  const lines=Array.from(brief.matchAll(/^[1-4]\. (.+)$/gm),match=>match[1]);
  assert.equal(lines.length,4);
  assert.deepEqual(lines,Array.from(context.COURSE.variantTasks[variant.id]));
  assert(lines[2].startsWith(tasks[2].text)&&lines[3].startsWith(tasks[3].text));
  const missing=data.products.filter(product=>!files.has('Ресурсы/Images/'+product.image));
  assert.deepEqual(missing.map(product=>product.image),['missing.png']);
  for (const resource of ['description.html','style-guide.html','Ресурсы/logo.png','Ресурсы/logo.ico','Ресурсы/picture.png']) assert(files.has(resource),resource);
  const control=read(`docs/variant-controls/${variant.id}.json`);
  const quantities=new Set(control.map(row=>row.quantity));
  assert([0,3,4,5,6].every(value=>quantities.has(value)),variant.id);
  assert.deepEqual(new Set(control.map(row=>row.discount)),new Set([false,true]),variant.id);
  assert(![...files.keys()].some(name => name.endsWith('.sql')));
 }
});

test('the example archive contains sources, the sample database and the available Windows build', () => {
 const source = zipEntries('prog-demo-example');
 for (const name of ['.gitignore', 'ProgDemo.sln', 'materials/ER.pdf', 'docs/launch.html', 'examples/WinForms/ProgDemo.WinForms.csproj']) {
  assert(source.has(name), name);
 }
 const sample = fs.readFileSync('content/sample.sql');
 assert.deepEqual(source.get('content/sample.sql'), sample);

 const context = {};
 vm.runInNewContext(fs.readFileSync('site/content.js', 'utf8'), context);
 if (context.COURSE.windowsBuild) {
  for (const name of ['ProgDemo.WinForms.exe', 'ProgDemo.WinForms.runtimeconfig.json', 'Assets/picture.png']) {
   assert(source.has('Windows/'+name), name);
  }
  const projectBuild = 'examples/WinForms/bin/Release/net10.0-windows';
  if (fs.existsSync(projectBuild+'/ProgDemo.WinForms.exe')) {
   assert(source.get('Windows/ProgDemo.WinForms.dll').equals(fs.readFileSync(projectBuild+'/ProgDemo.WinForms.dll')), 'ZIP must use the current project Release');
  }
 } else {
  assert(![...source.keys()].some(name=>name.startsWith('Windows/')));
 }
 assert(!fs.existsSync('site/downloads/prog-demo-windows.zip'));
});
test('original supplied source files keep their recorded bytes',()=>{for(const f of read('docs/source-manifest.json'))assert.equal(createHash('sha256').update(fs.readFileSync('materials/'+f.path)).digest('hex'),f.sha256,f.path);});
test('supplied PDF and ZIP match the independently recorded input baseline',()=>{for(const f of read('docs/input-baseline.json'))assert.equal(createHash('sha256').update(fs.readFileSync('materials/original/'+f.name)).digest('hex'),f.sha256,f.name);});
test('profile part cannot claim unpublished tasks or points',()=>{const p=read('content/profile.json');assert.equal(p.document,null);assert.equal(p.tasks.length,0);assert.equal(p.points,null);});

import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {stages,tasks,criteria,sourceWorkbooks,stageOutputs} from '../content/course.mjs';
import {buildGuideRedirects,renderLessonDetails} from './render_guides.mjs';
import {buildLessonSlides} from './lesson_slides.mjs';
import {stages as wpfStages} from '../content/postgresql/course.mjs';
import {buildErData} from './er-data.mjs';
import {buildErLayout} from './er-layout.mjs';
import '../src/core.js';
const stacks = {
  mysql:{name:'Windows Forms + MySQL / MariaDB', tools:'Windows · Visual Studio · C# и .NET 10 · DBeaver', deck:'deck.html'},
  postgresql:{name:'WPF + PostgreSQL', tools:'Windows · Visual Studio · C# и .NET 10 · pgAdmin', deck:'deck-wpf.html'}
};
const localNames = new Set(['bin', 'obj', '.vs', '__pycache__', '.ds_store', 'thumbs.db', 'launchsettings.json']);
function isCourseFile(file) {
  const name = path.basename(file).toLowerCase();
  return !localNames.has(name) && !name.endsWith('.user');
}

const out='site';fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync('src'))fs.copyFileSync('src/'+f,out+'/'+f);
fs.rmSync(out+'/materials',{recursive:true,force:true});
fs.cpSync('materials',out+'/materials',{recursive:true,filter:isCourseFile});
fs.rmSync(out+'/docs',{recursive:true,force:true});fs.mkdirSync(out+'/docs',{recursive:true});
fs.copyFileSync('docs/launch.html',out+'/docs/launch.html');
buildGuideRedirects(out+'/docs');
fs.copyFileSync('docs/launch-postgresql.html',out+'/docs/launch-postgresql.html');
for(const file of ['docs/launch.html','docs/launch-postgresql.html','materials/description.html','materials/style-guide.html']){
  const target=out+'/'+file;
  const html=fs.readFileSync(target,'utf8').replace('<style>', '<link rel="stylesheet" href="../typography.css"><style>')
    .replace('</style>', 'body{max-width:none;font:var(--text-body)/1.6 var(--font-ui)}h1{font-size:var(--text-page)}h2{font-size:var(--text-section)}code,pre{font-family:var(--font-code)}</style>');
  fs.writeFileSync(target,html);
}
fs.mkdirSync(out+'/downloads',{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const code={};
function walk(dir,fn){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(!isCourseFile(f.name))continue;const p=path.join(dir,f.name).replaceAll('\\','/');if(f.isDirectory())walk(p,fn);else fn(p,fs.readFileSync(p));}}
for(const dir of ['examples','scripts','content/postgresql'])walk(dir,(p,b)=>{if(/\.(cs|csproj|sql|py|xaml)$/.test(p)&&!p.endsWith('/vm.py'))code[p]=b.toString('utf8');});
code['content/sample.sql']=fs.readFileSync('content/sample.sql','utf8');
for (const [file,source] of Object.entries(code)) {
  if (!file.startsWith('examples/') && !file.startsWith('content/postgresql/')) continue;
  const destination=path.join(out,'code',file+'.txt');
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination,source);
}

const variants=read('content/variants.json'),variantBriefs={},variantTasks={},variantArchives={};
for (const {id} of variants) {
  const dir='content/variants/'+id, files={};
  variantBriefs[id]=fs.readFileSync(dir+'/Задание.md','utf8').replaceAll('\r\n','\n');
  const numbered=[...variantBriefs[id].matchAll(/^([1-4])\. (.+)$/gm)];
  if (numbered.length!==tasks.length||numbered.some((match,index)=>Number(match[1])!==index+1)) {
    throw new Error('Неверная нумерация заданий варианта '+id);
  }
  variantTasks[id]=numbered.map(match=>match[2]);
  walk(dir,(file,bytes)=>{if(!file.endsWith('.sql'))files[file.slice(dir.length+1)]=bytes;});
  const archive='exam-'+id+'.zip';
  variantArchives[archive]=ExamCore.zip(files);
  fs.writeFileSync(out+'/downloads/'+archive,variantArchives[archive]);
}
fs.writeFileSync(out+'/downloads/exam-30-variants.zip',ExamCore.zip(variantArchives));
const example={};
for(const dir of ['examples','materials'])walk(dir,(p,b)=>{
  if(!p.startsWith('examples/Wpf/')&&!p.startsWith('materials/ER-postgresql.'))example[p]=b;
});
walk('docs',(p,b)=>{if(/\.(md|json)$/.test(p))example[p]=b;});
for(const file of ['.gitignore','content/sample.sql','README.md','ProgDemo.sln','docs/launch.html'])example[file]=fs.readFileSync(file);
const original={};walk('materials/original',(p,b)=>original[p.slice('materials/original/'.length)]=b);fs.writeFileSync(out+'/downloads/original-inputs.zip',ExamCore.zip(original));
const taskInputs={};
walk('materials/resources',(p,b)=>taskInputs[p.slice('materials/'.length)]=b);
for(const file of ['description.html','style-guide.html'])taskInputs[file]=fs.readFileSync('materials/'+file);
fs.writeFileSync(out+'/downloads/task-inputs.zip',ExamCore.zip(taskInputs));
const release=['examples/WinForms/bin/Release/net10.0-windows','output/windows'].find(p=>fs.existsSync(p+'/ProgDemo.WinForms.exe'));
if (release) {
  walk(release,(file,bytes)=>example['Windows/'+file.slice(release.length+1)]=bytes);
}
fs.writeFileSync(out+'/downloads/prog-demo-example.zip',ExamCore.zip(example));
const wpfExample={};
for(const dir of ['examples/Wpf','examples/Core','examples/Import','content/postgresql','materials/resources'])
  walk(dir,(p,b)=>{if(!p.endsWith('.mjs'))wpfExample[p]=b;});
for(const file of ['ProgDemo.PostgreSql.slnx','docs/launch-postgresql.html','materials/ER-postgresql.pdf'])
  wpfExample[file]=fs.readFileSync(file);
const wpfRelease='examples/Wpf/bin/Release/net10.0-windows';
const wpfWindowsBuild=fs.existsSync(wpfRelease+'/ProgDemo.Wpf.exe');
if(wpfWindowsBuild)
  walk(wpfRelease,(file,bytes)=>wpfExample['Windows/'+file.slice(wpfRelease.length+1)]=bytes);
fs.writeFileSync(out+'/downloads/prog-demo-wpf.zip',ExamCore.zip(wpfExample));
fs.rmSync(out+'/downloads/prog-demo-windows.zip',{force:true});
const screens=read('content/screens.json');
for(const image of Object.values(screens)){
  if(!image.detail)continue;
  const {crop,size:[width,height],...detail}=image.detail;
  const file=image.file.replace(/\.[^.]+$/,'-detail.svg');
  const jpeg=fs.readFileSync(image.file).toString('base64');
  fs.writeFileSync(out+'/'+file,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${crop.join(' ')}"><image href="data:image/jpeg;base64,${jpeg}" width="${width}" height="${height}"/></svg>`);
  image.detail={...detail,file};
}
const launchGuide=fs.readFileSync('docs/launch.html','utf8').match(/<body>\s*<h1>.*?<\/h1>([\s\S]*?)<\/body>/i)[1];
const wpfLaunchGuide=fs.readFileSync('docs/launch-postgresql.html','utf8').match(/<body>\s*<h1>.*?<\/h1>([\s\S]*?)<\/body>/i)[1];
const lessonBlocks={};
for(const guide of ['Forms-designer','Visual-Studio','DBeaver','Database-fields','Import']){
  for(const [title,html] of Object.entries(renderLessonDetails(fs.readFileSync(`docs/${guide}.md`,'utf8')))){
    if(Object.hasOwn(lessonBlocks,title))throw new Error('Раздел повторяется: '+title);
    lessonBlocks[title]=html;
  }
}
const usedDetails=stages.flatMap(stage=>stage.steps.flatMap(step=>step.details||[]));
if(usedDetails.length!==Object.keys(lessonBlocks).length||
   new Set(usedDetails).size!==usedDetails.length||
   usedDetails.some(section=>!lessonBlocks[section])){
  throw new Error('Каждый раздел инструкции должен соответствовать одной карточке маршрута');
}
const lessonDetails=Object.fromEntries(Object.entries(lessonBlocks).map(([title,blocks])=>[title,blocks.join('\n')]));
const er=read('content/er.json');
const erGuide=await buildErData(er);
fs.writeFileSync(out+'/er-data.js','globalThis.ER_GUIDE='+JSON.stringify(erGuide)+';');
const erDetails=[
  {title:'Роль и пользователь', fields:{roles:['id','name'],users:['id','login','role_id']},
    caption:'Пользователь хранит ссылку на роль. Одна роль назначается нескольким пользователям.',
    script:'Укажите на users.role_id и проведите по стрелке к roles.id. Название роли хранится в справочнике. При оформлении и изменении заказа приложение сверяет роль с записью пользователя в базе.'},
  {title:'Размерный остаток модели', fields:{products:['id','name'],sizes:['id','label'],stock_items:['id','product_id','size_id','available']},
    caption:'Пара «модель + размер» определяет строку остатка. Для заказа используется доступное количество в этой строке.',
    script:'Проследите две связи от stock_items. Поле product_id определяет модель, size_id определяет размер. Два размера одной модели могут иметь разные остатки. Сумма остатков даёт количество для каталога.'},
  {title:'Заказ и его позиции', fields:{orders:['id','order_date'],stock_items:['id','product_id','size_id'],order_items:['id','order_id','stock_id','quantity','unit_price']},
    caption:'Строка связывает заказ с размерной позицией и хранит количество и цену за пару.',
    script:'Начните с номера заказа и найдите по нему строки order_items. В каждой строке stock_id определяет модель и размер, а unit_price сохраняет цену на момент оформления. Покажите, как из этих строк получается сумма заказа.'}
];
async function erSlideImages(file, schema) {
  const images=[];
  for(const [index,{fields,title,caption,script}] of erDetails.entries()){
    const tables=schema.tables.filter(table=>fields[table.id]).map(table=>({
      ...table,fields:table.fields.filter(field=>fields[table.id].includes(field.id))
    }));
    const links=schema.links.filter(link=>fields[link.from]?.includes(link.field)&&fields[link.to]?.includes(link.target));
    const graph=await buildErLayout({tables,links});
    const escape=ExamCore.escape;
    const cards=graph.nodes.map(({id,x,y,width,height})=>{
      const table=tables.find(item=>item.id===id);
      const rows=table.fields.map((field,i)=>`<text x="12" y="${93+i*44}" font-size="17">${escape(field.id)}${field.pk?' · PK':field.fk?' · FK':''}</text>`).join('');
      return `<g transform="translate(${x} ${y})"><rect width="${width}" height="${height}" rx="10" fill="#fff" stroke="#c6d0df"/><path d="M 0 65 H ${width}" stroke="#c6d0df"/><text x="12" y="26" font-size="17" font-weight="700">${escape(table.title)}</text><text x="12" y="48" font-size="15" fill="#526175">${escape(id)}</text>${rows}</g>`;
    }).join('');
    const wires=graph.edges.flatMap(edge=>edge.sections.map(section=>{
      const points=[section.endPoint,...(section.bendPoints||[]).toReversed(),section.startPoint];
      const child=points[0],parent=points.at(-1);
      return `<polyline points="${points.map(point=>point.x+','+point.y).join(' ')}" fill="none" stroke="#a51f42" stroke-width="2" marker-end="url(#fk)"/><text x="${child.x-16}" y="${child.y-6}">N</text><text x="${parent.x+8}" y="${parent.y-6}">1</text>`;
    })).join('');
    const fragment=file.replace('.svg','-detail-'+(index+1)+'.svg');
    fs.writeFileSync(out+'/'+fragment,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${graph.width} ${graph.height}" font-family="system-ui,sans-serif" fill="#202a3a"><defs><marker id="fk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#a51f42"/></marker></defs><rect width="100%" height="100%" fill="#eef2f7"/>${cards}${wires}</svg>`);
    images.push({file:fragment,title,caption,script});
  }
  return [{file,title:'Связи базы данных «Чудо Обувь»',
    caption:'Обзор десяти таблиц. Связи пользователей, остатков и заказов раскрыты на следующих слайдах.',
    script:'На схеме три узла для показа. Сначала разберите права пользователя, затем остатки по размеру, после этого заказ и его позиции. На следующих слайдах эти связи видны крупнее.'}, ...images];
}
const mysqlErImages=await erSlideImages('materials/ER.svg',erGuide.stacks.mysql);
const postgresErImages=await erSlideImages('materials/ER-postgresql.svg',erGuide.stacks.postgresql);
const data={lessonDetails,sourceWorkbooks,stageOutputs,workbooks:read('content/workbooks.json'),launchGuide,wpfLaunchGuide,stacks,stages,wpfStages,tasks,criteria,variants,variantBriefs,variantTasks,code,windowsBuild:!!release,wpfWindowsBuild,kim:'materials/original/КИМ 09.02.07-2-2027 Том 1.pdf',er,screens};
fs.writeFileSync(out+'/content.js','globalThis.COURSE='+JSON.stringify(data)+';');
const previousIndexes=[0,0];
const previousRoute={
  documents:[3,4,9,17,18,19,20,21],
  M1:[23,35,36,39,52,57,61,64,68,71,75,78,82,86,96,103,109,114,122,129,133,142,146,147,155,160,165],
  M2:[167,168,173,177,178,181,182,183,184,188,193,205,210,214,220,233,234],
  M3:[236,243,244,256,261,273,274,275,276,277,278],
  M4:[280,281,286,294,299,308,309,312,320,321,322,327,328,329,334,335,342]
};
const previousRouteIndexes=[];
const slides = [{kind:'cover',chapter:'intro',title:'Демонстрационный экзамен',
  script:'На примере «Чудо Обувь» мы пройдём четыре задания базового уровня. Начнём с исходных данных, затем проверим, как одна модель и один размер проходят от базы до подтверждённого заказа.'}];
const chapters = [{id:'intro',label:'Демонстрационный экзамен',index:0}];
for (const stage of stages) {
  const chapter={id:stage.id,label:stage.title,index:slides.length,steps:[]};
  chapters.push(chapter);
  previousIndexes.push(slides.length);
  for (const [index,step] of stage.steps.entries()) {
    chapter.steps.push({title:step.title,index:slides.length});
    const oldImage=screens[step.shot||step.file];
    previousIndexes.push(slides.length);
    if(oldImage&&[step.why,...step.actions,step.check].join(' ').length>650)previousIndexes.push(slides.length);
    if(step.code)previousIndexes.push(slides.length);
    slides.push(...buildLessonSlides(stage,step,index,screens,lessonBlocks,mysqlErImages));
  }
  const title='Что сохранить';
  chapter.steps.push({title,index:slides.length});
  slides.push({kind:'content',chapter:stage.id,step:stage.steps.length,title,items:stageOutputs[stage.id].map(([name,note])=>name+' · '+note),
    script:'Сопоставьте результаты на слайде с файлами и окнами, которые группа только что проверила. Уточните, где студент найдёт каждый результат в своём проекте.'});
  previousRouteIndexes.push([previousRoute[stage.id][0]-1,chapter.index]);
  for(const [index,oldIndex] of previousRoute[stage.id].entries()){
    previousRouteIndexes.push([oldIndex,chapter.steps[index]?.index??chapter.steps.at(-1).index]);
  }
}
fs.writeFileSync(out+'/deck-data.js','globalThis.TEACHER_DECK='+JSON.stringify({
  code:'09.02.07-2-2027',stackName:stacks.mysql.name,chapters,slides,previousIndexes,previousRouteIndexes
})+';');
const wpfSlides=[{...slides[0]}], wpfChapters=[{...chapters[0]}];
for(const stage of wpfStages){
  const chapter={id:stage.id,label:stage.title,index:wpfSlides.length,steps:[]};
  wpfChapters.push(chapter);
  for(const [index,step] of stage.steps.entries()){
    chapter.steps.push({title:step.title,index:wpfSlides.length});
    wpfSlides.push(...buildLessonSlides(stage,step,index,screens,{},postgresErImages));
  }
  const outputs=stageOutputs[stage.id].map(([name,note])=>name.replace('Windows Forms','WPF')+' · '+note);
  chapter.steps.push({title:'Что сохранить',index:wpfSlides.length});
  wpfSlides.push({kind:'content',chapter:stage.id,step:stage.steps.length,title:'Что сохранить',items:outputs,
    script:'Сопоставьте результаты на слайде с файлами и окнами, которые группа только что проверила. Уточните, где студент найдёт каждый результат в своём проекте.'});
}
fs.writeFileSync(out+'/deck-wpf-data.js','globalThis.TEACHER_DECK='+JSON.stringify({
  code:'09.02.07-2-2027',stack:'postgresql',stackName:stacks.postgresql.name,chapters:wpfChapters,slides:wpfSlides
})+';');
fs.writeFileSync(out+'/deck-wpf.html',fs.readFileSync('src/deck.html','utf8').replace('deck-data.js','deck-wpf-data.js'));
for (const page of ['index.html','deck.html','deck-wpf.html']) {
  const html=fs.readFileSync(out+'/'+page,'utf8').replace(/\b(src|href)="([^"?]+\.(?:js|css))"/g,
    (_,attr,file)=>`${attr}="${file}?v=${createHash('sha256').update(fs.readFileSync(out+'/'+file)).digest('hex').slice(0,12)}"`);
  fs.writeFileSync(out+'/'+page,html);
}
fs.writeFileSync(out+'/.nojekyll','');
console.log(`Built ${stages.reduce((n,s)=>n+s.steps.length,0)} steps, ${slides.length} slides, 4 tasks, 30 variants.`);

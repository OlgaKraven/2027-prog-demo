import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {stages,tasks,criteria} from '../content/course.mjs';
import {buildGuides} from './render_guides.mjs';
import '../src/core.js';
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
for(const f of ['launch.html','import-decisions.html'])fs.copyFileSync('docs/'+f,out+'/docs/'+f);
buildGuides(out+'/docs');
fs.mkdirSync(out+'/downloads',{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const code={};
function walk(dir,fn){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(!isCourseFile(f.name))continue;const p=path.join(dir,f.name).replaceAll('\\','/');if(f.isDirectory())walk(p,fn);else fn(p,fs.readFileSync(p));}}
for(const dir of ['examples','scripts'])walk(dir,(p,b)=>{if(/\.(cs|csproj|sql|py)$/.test(p)&&!p.endsWith('/vm.py'))code[p]=b.toString('utf8');});
code['content/sample.sql']=fs.readFileSync('content/sample.sql','utf8');
for (const [file,source] of Object.entries(code)) {
  if (!file.startsWith('examples/')) continue;
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
for(const dir of ['examples','materials'])walk(dir,(p,b)=>example[p]=b);
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
fs.rmSync(out+'/downloads/prog-demo-windows.zip',{force:true});
const screens=fs.existsSync('content/screens.json')?read('content/screens.json'):{};
const launchGuide=fs.readFileSync('docs/launch.html','utf8').match(/<body>\s*<h1>.*?<\/h1>([\s\S]*?)<\/body>/i)[1];
const data={workbooks:read('content/workbooks.json'),launchGuide,stages,tasks,criteria,variants,variantBriefs,variantTasks,code,windowsBuild:!!release,kim:'materials/original/КИМ 09.02.07-2-2027 Том 1.pdf',er:read('content/er.json'),erSvg:fs.readFileSync('materials/ER.svg','utf8'),screens};
fs.writeFileSync(out+'/content.js','globalThis.COURSE='+JSON.stringify(data)+';');
const slides = [{kind:'cover',chapter:'intro',title:'Демонстрационный экзамен'}];
const chapters = [{id:'intro',label:'Демонстрационный экзамен',index:0}];
slides.push({
  kind:'content',chapter:'intro',title:'Базовый уровень',
  facts:[['4','задания'],['210','минут'],['75','баллов']],
  body:'Спроектируйте базу данных, создайте каталог и реализуйте оформление и управление заказами.',
  links:[['Условие КИМ',data.kim+'#page=35'],['Готовый пример','./?mode=examples']]
});
for (const stage of stages) {
  chapters.push({id:stage.id,label:stage.title,index:slides.length});
  slides.push({kind:'section',chapter:stage.id,title:stage.title,body:stage.output});
  for (const step of stage.steps) {
    const image = screens[step.shot||step.file];
    const slide = {
      kind:'content',chapter:stage.id,title:step.title,body:step.why,actions:step.actions,check:step.check,
      ...(image?{image}:{}), ...(step.guide?{links:[[step.guide.title,step.guide.path]]}:{})
    };
    const textLength = [step.why,...step.actions,step.check].join(' ').length;
    if (image && textLength>650) {
      slides.push({kind:slide.kind,chapter:stage.id,title:step.title,body:step.why,image});
      slides.push({...slide,title:step.title+' · порядок действий',body:undefined,image:undefined});
    } else {
      slides.push(slide);
    }
    if (step.code) slides.push({kind:'code',chapter:stage.id,title:'Код · '+step.title,code:step.code});
  }
}
fs.writeFileSync(out+'/deck-data.js','globalThis.TEACHER_DECK='+JSON.stringify({
  code:'09.02.07-2-2027',stackName:'Windows Forms + MySQL / MariaDB',chapters,slides
})+';');
for (const page of ['index.html','deck.html']) {
  const html=fs.readFileSync(out+'/'+page,'utf8').replace(/\b(src|href)="([^"?]+\.(?:js|css))"/g,
    (_,attr,file)=>`${attr}="${file}?v=${createHash('sha256').update(fs.readFileSync(out+'/'+file)).digest('hex').slice(0,12)}"`);
  fs.writeFileSync(out+'/'+page,html);
}
fs.writeFileSync(out+'/.nojekyll','');
console.log(`Built ${stages.reduce((n,s)=>n+s.steps.length,0)} steps, ${slides.length} slides, 4 tasks, 30 variants.`);

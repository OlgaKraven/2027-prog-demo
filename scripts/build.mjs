import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {stages,tasks,criteria} from '../content/course.mjs';
import {buildGuides} from './render_guides.mjs';
import '../src/core.js';
const out='site';fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync('src'))fs.copyFileSync('src/'+f,out+'/'+f);
fs.cpSync('materials',out+'/materials',{recursive:true});
fs.rmSync(out+'/docs',{recursive:true,force:true});fs.mkdirSync(out+'/docs',{recursive:true});
for(const f of ['launch.html','import-decisions.html'])fs.copyFileSync('docs/'+f,out+'/docs/'+f);
buildGuides(out+'/docs');
fs.mkdirSync(out+'/downloads',{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const code={};
function walk(dir,fn){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(['bin','obj','.vs','__pycache__'].includes(f.name))continue;const p=path.join(dir,f.name).replaceAll('\\','/');if(f.isDirectory())walk(p,fn);else fn(p,fs.readFileSync(p));}}
for(const dir of ['examples','scripts'])walk(dir,(p,b)=>{if(/\.(cs|csproj|sql|py)$/.test(p)&&!p.endsWith('/vm.py'))code[p]=b.toString('utf8');});
code['content/sample.sql']=fs.readFileSync('content/sample.sql','utf8');
const variants=read('content/variants.json'),variantBriefs={};
for(const v of variants){const dir='content/variants/'+v.id;variantBriefs[v.id]=fs.readFileSync(dir+'/Задание.md','utf8');const files={};walk(dir,(p,b)=>{if(!p.endsWith('.sql'))files[p.slice(dir.length+1)]=b;});walk('materials/resources',(p,b)=>{if(!p.endsWith('.xlsx'))files['Ресурсы/'+p.slice('materials/resources/'.length)]=b;});for(const name of ['description.html','style-guide.html'])files[name]=fs.readFileSync('materials/'+name);fs.writeFileSync(`${out}/downloads/exam-${v.id}.zip`,ExamCore.zip(files));}
const example={};for(const dir of ['examples','materials/resources'])walk(dir,(p,b)=>example[p]=b);example['content/sample.sql']=fs.readFileSync('content/sample.sql');example['README.md']=fs.readFileSync('README.md');example['ProgDemo.sln']=fs.readFileSync('ProgDemo.sln');example['materials/ER.pdf']=fs.readFileSync('materials/ER.pdf');fs.writeFileSync(out+'/downloads/prog-demo-example.zip',ExamCore.zip(example));
const original={};walk('materials/original',(p,b)=>original[p.slice('materials/original/'.length)]=b);fs.writeFileSync(out+'/downloads/original-inputs.zip',ExamCore.zip(original));
const originals=fs.readdirSync('materials/original').map(name=>({name,path:'materials/original/'+name}));
const release=['output/windows','examples/WinForms/bin/Release/net10.0-windows'].find(p=>fs.existsSync(p+'/ProgDemo.WinForms.exe'));
if(release){const binary={};walk(release,(p,b)=>binary[p.slice(release.length+1)]=b);fs.writeFileSync(out+'/downloads/prog-demo-windows.zip',ExamCore.zip(binary));}
const screens=fs.existsSync('content/screens.json')?read('content/screens.json'):{};
const data={stages,tasks,criteria,variants,variantBriefs,code,originals,windowsBuild:!!release,kim:'materials/original/КИМ 09.02.07-2-2027 Том 1.pdf',er:read('content/er.json'),erSvg:fs.readFileSync('materials/ER.svg','utf8'),screens};
fs.writeFileSync(out+'/content.js','globalThis.COURSE='+JSON.stringify(data)+';');
const index=fs.readFileSync(out+'/index.html','utf8').replace(/\b(src|href)="([^"?]+\.(?:js|css))"/g,(_,a,f)=>`${a}="${f}?v=${createHash('sha256').update(fs.readFileSync(out+'/'+f)).digest('hex').slice(0,12)}"`);fs.writeFileSync(out+'/index.html',index);fs.writeFileSync(out+'/.nojekyll','');
console.log(`Built ${stages.reduce((n,s)=>n+s.steps.length,0)} steps, 4 tasks, 30 variants.`);

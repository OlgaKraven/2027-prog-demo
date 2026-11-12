import fs from 'node:fs';

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function destination(href) {
  if (href.startsWith('../examples/')) return '../code/'+href.slice(3)+'.txt';
  if (/^[A-Za-z-]+\.md(?:#.*)?$/.test(href)) return href.replace('.md','.html');
  return href;
}
function inline(text) {
  const tokens=[];
  const token=html=>`\u0000${tokens.push(html)-1}\u0000`;
  text=text.replace(/`([^`]+)`|(!?)\[([^\]]*)\]\(([^)]+)\)/g,(_,code,image,label,href)=>{
    if (code!==undefined) return token(`<code>${escape(code)}</code>`);
    const path=destination(href);
    const url=escape(path.startsWith('../')?path.slice(3):/^[\w-]+\.html(?:#.*)?$/.test(path)?'docs/'+path:path);
    return token(image
      ? `<figure class="microshot"><button class="image-open" data-image="${url}" aria-label="Увеличить: ${escape(label)}"><img src="${url}" alt="${escape(label)}" loading="lazy"></button><figcaption>${escape(label)}</figcaption></figure>`
      : `<a href="${url}">${escape(label)}</a>`);
  });
  return escape(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\u0000(\d+)\u0000/g,(_,i)=>tokens[i]);
}

// Render the limited Markdown used by the student guides.
function renderBlocks(markdown) {
  const lines=markdown.replaceAll('\r\n','\n').split('\n');
  const blocks=[];
  const cells=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim());
  for(let i=0;i<lines.length;) {
    const line=lines[i].trim();
    if(!line){i++;continue;}
    if(line.startsWith('```')) {
      const code=[];i++;
      while(i<lines.length&&!lines[i].trim().startsWith('```'))code.push(lines[i++]);
      blocks.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);i++;continue;
    }
    if(line.startsWith('|')&&/^\|?[\s:|-]+\|?$/.test(lines[i+1]?.trim()??'')) {
      const header=cells(line);i+=2;const rows=[];
      while(i<lines.length&&lines[i].trim().startsWith('|'))rows.push(cells(lines[i++]));
      blocks.push(`<div class="material-table lesson-data-table" tabindex="0" role="region" aria-label="Таблица свойств"><table><thead><tr>${header.map(s=>`<th scope="col">${inline(s)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(s=>`<td>${inline(s)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);continue;
    }
    const list=line.match(/^(- |\d+\. )(.+)$/);
    if(list){const tag=list[1]==='- '?'ul':'ol',items=[];const start=tag==='ol'&&parseInt(list[1])>1?` start="${parseInt(list[1])}"`:'';while(i<lines.length){const item=lines[i].trim().match(tag==='ul'?/^- (.+)$/:/^\d+\. (.+)$/);if(!item)break;items.push(`<li>${inline(item[1])}</li>`);i++;}blocks.push(`<${tag}${start}>${items.join('')}</${tag}>`);continue;}
    if(line.startsWith('![')){blocks.push(inline(line));i++;continue;}
    const paragraph=[line];i++;
    while(i<lines.length&&lines[i].trim()&&!/^(#|\||```|- |\d+\. )/.test(lines[i].trim()))paragraph.push(lines[i++].trim());
    blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return blocks;
}

export function renderLessonDetails(markdown) {
  const [header,...sections]=markdown.replaceAll('\r\n','\n').split(/^#{2,3} (.+)$/gm);
  const introduction=header.replace(/^# .+$/m,'').trim();
  const cards={};
  for(let i=0;i<sections.length;i+=2){
    const section=i===0&&introduction?introduction+'\n\n'+sections[i+1]:sections[i+1];
    cards[sections[i]]=renderBlocks(section);
  }
  return cards;
}

export function buildGuideRedirects(output) {
  const routes={
    'DBeaver':['M1','Запустите сервер и проверьте подключение'],
    'Database-fields':['M1','roles'],
    'Forms-designer':['M2','Подготовка к работе'],
    'Import':['M1','Создайте консольный проект'],
    'Visual-Studio':['documents','Подготовьте Windows'],
    'import-decisions':['M1','Проверьте сопоставление']
  };
  for(const [name,[module,card]] of Object.entries(routes)){
    const route='../?'+new URLSearchParams({mode:'learn',module,stack:'mysql',view:'steps',card});
    fs.writeFileSync(`${output}/${name}.html`,`<!doctype html><html lang="ru"><meta charset="utf-8"><title>Маршрут обучения</title><meta http-equiv="refresh" content="0; url=${escape(route)}"><p><a href="${escape(route)}">Открыть карточку маршрута</a></p></html>`);
  }
}

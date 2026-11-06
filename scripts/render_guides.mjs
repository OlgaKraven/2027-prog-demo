import fs from 'node:fs';

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function destination(href) {
  if (href.startsWith('../examples/')) return 'https://github.com/OlgaKraven/2027-prog-demo/blob/main/'+href.slice(3);
  if (/^[A-Za-z-]+\.md(?:#.*)?$/.test(href)) return href.replace('.md','.html');
  return href;
}
function inline(text) {
  const tokens=[];
  const token=html=>`\u0000${tokens.push(html)-1}\u0000`;
  text=text.replace(/`([^`]+)`|(!?)\[([^\]]*)\]\(([^)]+)\)/g,(_,code,image,label,href)=>{
    if (code!==undefined) return token(`<code>${escape(code)}</code>`);
    const url=escape(destination(href));
    return token(image ? `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${escape(label)}" loading="lazy"></a>` : `<a href="${url}">${escape(label)}</a>`);
  });
  return escape(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\u0000(\d+)\u0000/g,(_,i)=>tokens[i]);
}

// Render the limited Markdown used by the student guides.
export function renderGuide(markdown) {
  const lines=markdown.replaceAll('\r\n','\n').split('\n');
  const blocks=[],toc=[];let section=0;
  const cells=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim());
  for(let i=0;i<lines.length;) {
    const line=lines[i].trim();
    if(!line){i++;continue;}
    if(line.startsWith('```')) {
      const code=[];i++;
      while(i<lines.length&&!lines[i].trim().startsWith('```'))code.push(lines[i++]);
      blocks.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);i++;continue;
    }
    const heading=line.match(/^(#{1,3}) (.+)$/);
    if(heading){const level=heading[1].length,id=`section-${section++}`;blocks.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);if(level===2)toc.push(`<a href="#${id}">${inline(heading[2])}</a>`);i++;continue;}
    if(line.startsWith('|')&&/^\|?[\s:|-]+\|?$/.test(lines[i+1]?.trim()??'')) {
      const header=cells(line);i+=2;const rows=[];
      while(i<lines.length&&lines[i].trim().startsWith('|'))rows.push(cells(lines[i++]));
      blocks.push(`<div class="guide-table" tabindex="0" role="region" aria-label="Таблица свойств"><table><thead><tr>${header.map(s=>`<th scope="col">${inline(s)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(s=>`<td>${inline(s)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);continue;
    }
    const list=line.match(/^(- |\d+\. )(.+)$/);
    if(list){const tag=list[1]==='- '?'ul':'ol',items=[];while(i<lines.length){const item=lines[i].trim().match(tag==='ul'?/^- (.+)$/:/^\d+\. (.+)$/);if(!item)break;items.push(`<li>${inline(item[1])}</li>`);i++;}blocks.push(`<${tag}>${items.join('')}</${tag}>`);continue;}
    const paragraph=[line];i++;
    while(i<lines.length&&lines[i].trim()&&!/^(#|\||```|- |\d+\. )/.test(lines[i].trim()))paragraph.push(lines[i++].trim());
    blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  const title=lines.find(s=>s.startsWith('# '))?.slice(2)??'Методика';
  return `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · ДЭ 2027</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="../prog.css"><style>
  .guide{max-width:1200px;margin:0 auto;padding:24px 32px 80px}.guide h1{font-size:clamp(28px,4vw,44px);line-height:1.18}.guide h2{margin-top:48px;scroll-margin-top:24px}.guide p,.guide li{overflow-wrap:anywhere}.guide img{display:block;max-width:100%;height:auto;margin:20px auto;border:1px solid var(--line);border-radius:10px}.guide code{font:14px/1.6 Consolas,monospace;overflow-wrap:anywhere}.guide pre{padding:20px;background:var(--soft);border:1px solid var(--line);border-radius:10px;overflow:auto;white-space:pre-wrap}.guide-table{overflow:auto;margin:24px 0;border:1px solid var(--line);border-radius:12px}.guide table{border-collapse:collapse;width:100%;font-size:15px;background:var(--paper)}.guide th,.guide td{padding:12px 14px;vertical-align:top;border-bottom:1px solid var(--line);text-align:left;min-width:100px}.guide th{background:var(--soft)}.guide-nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin-bottom:32px}.guide-toc{display:grid;gap:8px;padding:20px;background:var(--paper);border:1px solid var(--line);border-radius:12px}.dark.guide-page{--blue:#9ab5ff}@media(max-width:600px){.guide{padding:18px 16px 48px}.guide td,.guide th{padding:10px;font-size:14px}}
  </style><body class="guide-page"><script>try{document.body.classList.toggle('dark',JSON.parse(localStorage.getItem('2027-prog-demo:v1:dark'))===true)}catch{}</script><main class="guide"><nav class="guide-nav" aria-label="Методические материалы"><a href="../?mode=learn">Вернуться к обучению</a><a href="DBeaver.html">Конструкторы БД</a><a href="Database-fields.html">Поля таблиц</a><a href="Forms-designer.html">Конструктор форм</a><a href="Visual-Studio.html">Настройка Visual Studio</a><a href="Import.html">Импорт данных</a></nav><nav class="guide-toc" aria-label="Содержание">${toc.join('')}</nav>${blocks.join('\n')}</main></body></html>`;
}

export function buildGuides(output) {
  for(const name of ['DBeaver','Database-fields','Forms-designer','Import','Visual-Studio'])
    fs.writeFileSync(`${output}/${name}.html`,renderGuide(fs.readFileSync(`docs/${name}.md`,'utf8')));
}

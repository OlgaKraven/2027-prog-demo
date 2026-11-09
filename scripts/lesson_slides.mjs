// Continue dense lesson material across slides while keeping the original order.
const unescape = value => value.replace(/&(amp|lt|gt|quot);/g,(_,entity)=>({amp:'&',lt:'<',gt:'>',quot:'"'}[entity]));
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const length = html => unescape(html.replace(/<[^>]*>/g,'')).length;
function groups(items,maxItems,maxLength){
  const pages=[];
  let page=[],size=0;
  for(const item of items){
    const weight=length(item);
    if(page.length&&(page.length===maxItems||size+weight>maxLength)){
      pages.push(page);
      page=[];
      size=0;
    }
    page.push(item);
    size+=weight;
  }
  if(page.length)pages.push(page);
  return pages;
}

function demonstration(blocks){
  const pages=[];
  let paragraphs=[];
  const flush=()=>{
    for(const group of groups(paragraphs,3,570))pages.push({detailHtml:group.join(''),label:'Порядок работы'});
    paragraphs=[];
  };
  for(const source of blocks){
    const block=source.replace(/<a href="(?:\?mode=[^"]*|docs\/(?:DBeaver|Database-fields|Forms-designer|Import|Visual-Studio|import-decisions)\.html(?:#[^"]*)?)">([^<]+)<\/a>/g,'$1');
    if(block.startsWith('<p>')){
      paragraphs.push(block);
      continue;
    }
    flush();
    if(block.startsWith('<figure')){
      const [,file,caption]=block.match(/<img src="([^"]+)" alt="([^"]*)"/);
      pages.push({image:{file:unescape(file),caption:unescape(caption)},label:'Снимок'});
    }else if(block.startsWith('<pre>')){
      pages.push({code:unescape(block.slice(11,-13)),label:'Команда'});
    }else if(block.includes('<table>')){
      const [,header,body]=block.match(/<table>(<thead>.*?<\/thead>)<tbody>(.*?)<\/tbody><\/table>/);
      const columns=header.match(/<th scope=/g).length;
      for(const rows of groups(body.match(/<tr>.*?<\/tr>/g),columns<=4?10:6,600)){
        pages.push({detailHtml:'<table>'+header+'<tbody>'+rows.join('')+'</tbody></table>',label:'Таблица'});
      }
    }else{
      const [,tag,start]=block.match(/^<(ol|ul)(?: start="(\d+)")?>/);
      let number=Number(start||1);
      for(const items of groups(block.match(/<li>.*?<\/li>/g),4,510)){
        const attrs=tag==='ol'&&number>1?' start="'+number+'"':'';
        pages.push({detailHtml:'<'+tag+attrs+'>'+items.join('')+'</'+tag+'>',label:'Действия'});
        number+=items.length;
      }
    }
  }
  flush();
  return pages;
}

export function buildLessonSlides(stage,step,index,screens,lessonBlocks){
  const database=stage.id==='M1';
  const pages=[];
  const addText=(html,label='Порядок работы')=>{
    const last=pages.at(-1);
    const rows=last?.detailHtml?.match(/<tr>/g)?.length??0;
    if(last?.detailHtml&&rows<=6&&length(last.detailHtml+html)<=(rows?500:660)){
      last.detailHtml+=html;
    }else{
      pages.push({detailHtml:html,label});
    }
  };
  const context='<p>'+escape(step.why)+'</p>';
  const check='<p class="callout"><strong>'+(database?'Как проверить результат':'Проверьте себя')+'</strong>'+escape(step.check)+'</p>';
  if(!database)addText(context);
  if(!step.details||step.detailsSupplement){
    const actions='<ol>'+step.actions.map(action=>'<li>'+escape(action)+'</li>').join('')+'</ol>';
    for(const page of demonstration([actions]))addText(page.detailHtml);
  }
  for(const [i,section] of (step.details||[]).entries()){
    const detail=demonstration(lessonBlocks[section]);
    if(i)detail[0].heading=section;
    for(const page of detail){
      if(page.detailHtml&&!page.heading&&!page.detailHtml.includes('<table>'))addText(page.detailHtml);
      else pages.push(page);
    }
  }
  if(step.erWorkspace)pages.push({
    image:{file:'materials/ER.svg',caption:'Таблицы и связи схемы «Чудо Обувь».'},
    label:'Готовая ER-схема'
  });
  if(step.code)pages.push({code:step.code,label:'Код'});
  const image=!step.details&&screens[step.shot||step.file];
  if(image)pages.push({image,label:'Снимок'});
  const result=check+(database?'<p><strong>Зачем это нужно.</strong> '+escape(step.why)+'</p>':'');
  addText(result,database?'Как проверить результат':'Проверьте себя');
  return pages.map(({label,...page},i)=>({
    ...page,kind:page.code?'code':'detail',chapter:stage.id,step:index,
    title:i===0?step.title:label+' · '+(i+1),
    ...(i?{eyebrow:'Шаг '+(index+1)+' · '+step.title}:{}),
    ...(i===pages.length-1?{check:step.check}:{}),
    ...(!i&&step.file&&!step.details?{source:step.file}:{})
  }));
}

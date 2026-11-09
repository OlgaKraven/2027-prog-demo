// Continue dense lesson material across slides while keeping the original order.
const unescape = value => value.replace(/&(amp|lt|gt|quot);/g,(_,entity)=>({amp:'&',lt:'<',gt:'>',quot:'"'}[entity]));
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
    for(const group of groups(paragraphs,3,570))pages.push({detailHtml:group.join('')});
    paragraphs=[];
  };
  for(const block of blocks){
    if(block.startsWith('<p>')){
      paragraphs.push(block);
      continue;
    }
    flush();
    if(block.startsWith('<figure')){
      const [,file,caption]=block.match(/<img src="([^"]+)" alt="([^"]*)"/);
      pages.push({image:{file:unescape(file),caption:unescape(caption)}});
    }else if(block.startsWith('<pre>')){
      pages.push({code:unescape(block.slice(11,-13))});
    }else if(block.includes('<table>')){
      const [,header,body]=block.match(/<table>(<thead>.*?<\/thead>)<tbody>(.*?)<\/tbody><\/table>/);
      const columns=header.match(/<th scope=/g).length;
      for(const rows of groups(body.match(/<tr>.*?<\/tr>/g),columns<=4?10:6,600)){
        pages.push({detailHtml:'<table>'+header+'<tbody>'+rows.join('')+'</tbody></table>'});
      }
    }else{
      const [,tag,start]=block.match(/^<(ol|ul)(?: start="(\d+)")?>/);
      let number=Number(start||1);
      for(const items of groups(block.match(/<li>.*?<\/li>/g),4,510)){
        const attrs=tag==='ol'&&number>1?' start="'+number+'"':'';
        pages.push({detailHtml:'<'+tag+attrs+'>'+items.join('')+'</'+tag+'>'});
        number+=items.length;
      }
    }
  }
  flush();
  return pages;
}

export function buildLessonSlides(stage,step,index,screens,lessonBlocks){
  const chapter=stage.id, title=step.title;
  const detail=(step.details||[]).flatMap((section,i)=>demonstration(lessonBlocks[section])
    .map((page,j)=>({...page,...(i&&j===0?{heading:section}:{})})));
  if(step.code)detail.push({code:step.code});
  if(step.erWorkspace){
    detail.push({
      image:{file:'materials/ER.svg',caption:'Таблицы и связи схемы «Чудо Обувь».'},
      links:[['Интерактивная ER-схема','./?'+new URLSearchParams({mode:'learn',module:stage.id,view:'steps',card:index})]]
    });
  }
  const image=screens[step.shot||step.file];
  const hasImage=image&&detail.some(page=>page.image?.file===image.file);
  const actions=!step.details||step.detailsSupplement?step.actions:undefined;
  const textLength=[step.why,...(actions||[]),step.check].join(' ').length;
  const splitImage=image&&!hasImage&&textLength>570;
  if(splitImage)detail.unshift({image});
  const first={
    kind:'content',chapter,title,body:step.why,actions,
    ...(!detail.length?{check:step.check}:{}),
    ...(image&&!hasImage&&!splitImage?{image}:{})
  };
  if(!detail.length)return [first];
  return [first,...detail.map((page,i)=>({
    ...page,kind:page.code?'code':'detail',chapter,title,
    eyebrow:'Демонстрация шага · '+(i+1)+' / '+detail.length
  })),{kind:'content',chapter,title,check:step.check}];
}

const {chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const out=path.resolve('output/browser');fs.mkdirSync(out,{recursive:true});let browser;
(async()=>{
browser=await chromium.launch({headless:true});const errors=[],records=[];let microstepsChecked=0;
for(const width of [390,768,1440])for(const dark of [false,true]){
 const context=await browser.newContext({viewport:{width,height:1000}});await context.addInitScript(d=>localStorage.setItem('2027-prog-demo:v1:dark',JSON.stringify(d)),dark);const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 const go=async(mode,module='documents')=>{await page.goto(`http://127.0.0.1:4209/?mode=${mode}&module=${module}`);await page.locator('.site-nav').waitFor();};
 const shot=async(name,selector)=>{if(selector)await page.locator(selector).scrollIntoViewIfNeeded();else await page.evaluate(()=>window.scrollTo(0,0));const w=await page.evaluate(()=>document.documentElement.scrollWidth);assert(w<=width+1,`${width} ${name} overflow ${w}`);assert.equal(await page.locator('main textarea').count(),0);await page.screenshot({path:path.join(out,`${width}-${dark?'dark':'light'}-${name}.png`)});records.push({width,dark,state:name,documentWidth:w});};
 await page.goto('http://127.0.0.1:4209/?mode=learn&module=documents&view=map');
 const layout=await page.locator('.learning-map').evaluate(map=>{
  const stages=map.querySelector('.map-nodes');
  const detail=map.querySelector('.map-detail');
  return {
   sideBySide:detail.getBoundingClientRect().left>=stages.getBoundingClientRect().right,
   stageColumns:getComputedStyle(stages).gridTemplateColumns.split(' ').length,
   markerWidth:stages.querySelector('.map-circle').getBoundingClientRect().width
  };
 });
 assert.deepEqual(layout,{sideBySide:width>760,stageColumns:1,markerWidth:48});
 await page.getByRole('button',{name:'Открыть подготовку →'}).click();
 assert.equal(await page.locator('.lesson-files .material-list a').count(),2);
 await page.getByRole('link',{name:'Задания базового уровня · КИМ'}).click();
 assert.match(await page.locator('.lesson-files iframe').getAttribute('src'),/#page=35$/);
 assert.equal(await page.getByText(/Метод_рекомендации|Создание базы в DBeaver/).count(),0);
 assert(await page.getByRole('link',{name:'Скачать исходные файлы · ZIP'}).isVisible());
 await page.getByRole('button',{name:'Перейти к шагам →'}).click();
 await page.getByRole('button',{name:'К маршруту обучения'}).click();
 assert(await page.getByRole('button',{name:'Продолжить с шага 1 →'}).isVisible());
 await go('learn');await shot('learn');
 assert.equal(await page.locator('.study-step .material-list, #materials-open').count(),0);
 const stages=await page.evaluate(()=>COURSE.stages.map(s=>({id:s.id,count:s.steps.length})));
 for(const s of stages){
  await go('learn',s.id);
  for(let n=0;n<s.count;n++){
   await page.locator('#lesson-steps').click();
   await page.locator('[data-jump-step="'+n+'"]').click();
   assert(await page.locator('#lesson-step-title').innerText());
   assert((await page.locator('.lesson-explanation :is(ol li, .step-instructions p, .step-instructions pre, .step-instructions tbody tr)').count())>0,`У шага ${s.id}/${n+1} отсутствует содержимое`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   microstepsChecked++;
  }
 }
 await go('training');await page.locator('[data-timer=start]').click();await page.locator('[data-timer=pause]').click();assert(await page.locator('.training-workspace').isHidden());await page.reload();assert(await page.locator('.pause-screen').isVisible());await shot('paused','.pause-screen');await page.locator('.timer-card [data-timer=start]').click();await page.locator('[data-timer=finish]').click();assert.equal(await page.locator('[data-check]:not(:disabled)').count(),0);await shot('finished','.attempt-result');await page.locator('[data-timer=reset]').click();assert.equal(await page.locator('#clock').innerText(),'03:30:00');assert.equal(await page.getByText(/протокол/i).count(),0);
 await go('mock');assert.equal(await page.locator('[data-timer=pause]').count(),0);assert.equal(await page.locator('#variant option').count(),30);await shot('mock','.attempt-layout');
 await page.goto('http://127.0.0.1:4209/?mode=learn&module=M1&view=brief');
 assert.equal(await page.locator('.lesson-files [data-material-path]').count(),7);
 assert.equal(await page.getByRole('link',{name:'Руководство по стилю'}).count(),0);
 await page.getByRole('link',{name:'Products_import.xlsx',exact:true}).click();
 assert.equal(await page.locator('.material-table tbody tr').count(),5);
 assert(await page.getByText('Первые 5 записей из 31.').isVisible());
 assert.equal(context.pages().length,1);
 await page.getByRole('button',{name:'Справка',exact:true}).click();
 await page.getByRole('tab',{name:'Ситуации'}).click();
 assert.equal(await page.locator('.lesson-situations details').count(),0);
 assert(await page.getByText(/снимите Not Null/).isVisible());
 await page.getByRole('button',{name:'Шаги',exact:true}).click();
 await page.locator('#lesson-steps').click();await page.getByRole('button',{name:'Свяжите таблицы внешними ключами',exact:true}).click();
 assert.equal(await page.locator('.lesson-data-table tbody tr').count(),10);
 assert.equal(await page.locator('.study-step iframe').count(),0);
 await page.getByRole('button',{name:'Следующий шаг',exact:true}).click();
 assert(await page.getByRole('heading',{name:/Задайте составную уникальность/}).isVisible());
 await page.locator('#lesson-steps').click();await page.getByRole('button',{name:'Создайте консольный импортёр',exact:true}).click();
 const importerFile=page.getByRole('link',{name:'CsvInput.cs',exact:true});
 assert(await importerFile.isVisible());
 assert.match(await importerFile.getAttribute('href'),/code\/examples\/Import\/CsvInput\.cs\.txt$/);
 await page.locator('#lesson-steps').click();await page.locator('[data-jump-step="1"]').click();
 await page.getByRole('button',{name:'Построить ER-схему',exact:true}).click();
 assert.equal(await page.locator('dialog[open]').count(),0);
 await page.locator('#er-next').click();
 assert(await page.locator('#er-select-roles').isVisible());
 const assertErPosition=async id=>{
   await page.waitForFunction(id=>{
     const title=document.getElementById('er-select-'+id);
     const diagram=document.querySelector('.er-live-diagram');
     if(!title||!diagram)return false;
     const a=title.getBoundingClientRect(), b=diagram.getBoundingClientRect();
     return a.left>=b.left-1&&a.right<=b.right+1&&a.top>=b.top-1&&a.bottom<=b.bottom+1;
   },id);
 };
 await page.locator('#er-jump').selectOption({label:'19. manufacturers'});
 await assertErPosition('manufacturers');
 await page.locator('#er-next').click();await assertErPosition('manufacturers-id');
 await page.locator('#er-prev').click();await assertErPosition('manufacturers');
 await page.reload();await assertErPosition('manufacturers');
 const accountStep=await page.locator('#er-jump option').evaluateAll(options=>options.find(o=>o.textContent.endsWith('orders.stock_accounted')).value);
 await page.locator('#er-jump').selectOption(accountStep);
 await assertErPosition('orders-stock_accounted');
 assert(await page.locator('.er-origin').getByText(/Импортированная история получает 0/).isVisible());
 assert(await page.locator('.er-origin').getByText('Свойства в SQL',{exact:true}).isVisible());
 await page.locator('#er-full').click();await shot('er');
 await page.locator('#er-select-products-image').focus();await page.keyboard.press('Enter');
 assert(await page.locator('.er-origin').getByText('products.image',{exact:true}).isVisible());
 await page.locator('#er-source').click();
 assert(await page.locator('dialog[open] .material-table').isVisible());
 await page.keyboard.press('Escape');
 await page.locator('#er-help').click();assert(await page.locator('#er-reading').isVisible());
 await page.locator('#er-expand').click();assert.equal(await page.locator('dialog[open] #er-workspace').count(),1);
 await page.keyboard.press('Escape');await page.locator('.study-step #er-workspace').waitFor({state:'visible'});
 await go('examples');await page.locator('#open-file').click();assert((await page.locator('.code-preview').innerText()).length>20);await page.keyboard.press('Escape');
 await go('teacher');await page.locator('#deck-open').click();
 await page.locator('.slide-cover').waitFor();await shot('presentation');
 await page.locator('#next').click();await shot('presentation-step');
 await go('learn');await page.locator('[data-mode=training]').click();await page.goBack();assert.equal(new URL(page.url()).searchParams.get('mode'),'learn');
 await context.close();
}
await browser.close();fs.writeFileSync('docs/browser-checks.json',JSON.stringify({records,errors,microstepsChecked},null,2)+'\n');assert.equal(errors.length,0);console.log(JSON.stringify({screens:records.length,microsteps:microstepsChecked,errors}));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});

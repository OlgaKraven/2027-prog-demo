(()=>{'use strict';
const D=COURSE,C=ExamCore,E=C.escape,prefix='2027-prog-demo:v1:',root=document.getElementById('app');
let fallback={},storageOK=true;
const get=(k,v=null)=>{try{return JSON.parse(localStorage.getItem(prefix+k))??v;}catch{storageOK=false;return fallback[k]??v;}};
const set=(k,v)=>{fallback[k]=v;try{localStorage.setItem(prefix+k,JSON.stringify(v));}catch{storageOK=false;}};
const modes=[['overview','Обзор'],['learn','Обучение'],['training','Тренировка'],['mock','Пробный экзамен'],['examples','Примеры'],['teacher','Преподавателю']];
const modeIcons = {
  overview: 'M12 2.5 2 11h3v9a1 1 0 0 0 1 1h3.5v-6h5v6H18a1 1 0 0 0 1-1v-9h3z',
  learn: 'M6 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm3.5 2h6a4 4 0 0 1 0 8H9a2 2 0 1 0 0 4h7.2l-2-2 1.4-1.4L20 19l-4.4 4.4-1.4-1.4 2-2H9a4 4 0 1 1 0-8h6.5a2 2 0 0 0 0-4h-6z',
  training: 'M9 1h6v3H9zM11 4h2v1h-2zM19 7l1.8-1.8 1.4 1.4-1.8 1.8zM21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-10-5h2v4.5l2.2 2.2-1.4 1.4-2.8-2.8z',
  mock: 'M9 3a3 3 0 0 1 6 0h3a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 1.2v2h4v-2zm-2 9.1 3.1 3.1 5.5-5.5-1.4-1.4-4.1 4.1-1.7-1.7z',
  examples: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2 2h16V7H4zm5.4 2.6L6 14l3.4 3.4 1.2-1.2L8.4 14l2.2-2.2zm5.2 0-1.2 1.2 2.2 2.2-2.2 2.2 1.2 1.2L18 14z',
  teacher: 'M2 3h20v14h-9v2h4v2H7v-2h4v-2H2zm4.2 9 1.3 1.3 3-3 3 1.5 4.3-4.3-1.3-1.3-3.3 3.3-3-1.5z'
};
const toolIcons = {
  moon: 'M20.8 15.2A9 9 0 0 1 8.8 3.2a9.2 9.2 0 1 0 12 12Z',
  sun: 'M17.5 12a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0ZM11 1h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM3.5 4.9l1.4-1.4L7 5.6 5.6 7zm13.5 13.5 1.4-1.4 2.1 2.1-1.4 1.4zm0-12.8 2.1-2.1 1.4 1.4L18.4 7zM3.5 19.1 5.6 17 7 18.4l-2.1 2.1z',
  tour: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-7 2.4-2.4 7 7-2.4z'
};
function readRoute(restore=false) {
  const query = new URLSearchParams(location.search);
  const requestedMode = query.get('mode') || (restore ? get('mode','overview') : 'overview');
  const requestedStage = query.get('module') || (restore ? get('stage','documents') : 'documents');
  const requestedVariant = query.get('variant') || (restore ? get('variant','V01') : 'V01');
  const requestedStack = query.get('stack') || (restore ? get('stack','mysql') : 'mysql');
  const view = query.get('view');
  return {
    mode: requestedMode==='criteria'||modes.some(([id])=>id===requestedMode) ? requestedMode : 'overview',
    stage: D.stages.some(item=>item.id===requestedStage) ? requestedStage : 'documents',
    variant: D.variants.some(item=>item.id===requestedVariant) ? requestedVariant : 'V01',
    stack: Object.hasOwn(D.stacks,requestedStack) ? requestedStack : 'mysql',
    learningView: ['map','brief','steps','help'].includes(view) ? view : query.has('module') ? 'steps' : 'map'
  };
}
let {mode,stage,variant,stack,learningView} = readRoute(true);
let dark = get('dark',false);
const isWpf = () => stack==='postgresql';
const learningStages = () => isWpf()?D.wpfStages:D.stages;
const progressKey = key => isWpf()?'postgresql:'+key:key;
const stageDone = id => get(progressKey('done:'+id),false);
const erPdf = () => isWpf()?'materials/ER-postgresql.pdf':'materials/ER.pdf';
const btn=(text,attrs='',primary=false)=>`<button class="btn${primary?' primary':''}" ${attrs}>${text}</button>`;
const link=(text,path)=>`<a class="btn" href="${E(path)}" target="_blank" rel="noopener">${E(text)}</a>`;
const current=()=>learningStages().find(s=>s.id===stage),scope=()=>mode+':'+(mode==='mock'?variant:'sample'),timer=()=>C.restoreTimer(JSON.stringify(get('timer:'+scope())),210*60,mode);
const header = (title, text) => `<div class="route-heading"><h1 tabindex="-1">${E(title)}</h1>${text?'<p>'+E(text)+'</p>':''}</div>`;
function iconButton(title, path, attributes) {
  return `<button type="button" class="btn" data-icon-button aria-label="${E(title)}" ${attributes}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="${path}"/></svg>
    <span class="icon-tooltip" aria-hidden="true">${E(title)}</span>
  </button>`;
}
function overview() {
  return `<section class="hero study-intro">
    <div class="banner-copy">
      <h1>Демонстрационный экзамен</h1>
      <ul class="banner-facts" aria-label="Параметры экзамена">
        <li>Базовый уровень</li><li><span>Время экзамена</span> <time datetime="PT3H30M">3 ч 30 мин</time></li>
      </ul>
      <p class="lead">В четырёх заданиях вы спроектируете базу данных, создадите каталог обуви и реализуете оформление заказов и работу с ними.</p>
      <div class="button-row">${btn('Открыть маршрут обучения →','data-mode="learn"',true)}</div>
    </div>
    <div class="banner-mascot"><img src="mascot-exam.png" width="680" height="680" alt="Носорог-студент готовится к демоэкзамену"></div>
  </section>${criteria()}`;
}
const shortStages = ['Старт', 'База', 'Каталог', 'Заказ', 'Сдача'];
function stageNavigation(items, active, practice = false) {
  const completed = items.filter(item=>practice ? mode==='training' && practiceDone(item.id) : stageDone(item.id));
  return `<nav class="stage-nav" aria-label="${practice?'Задания':'Этапы обучения'}">
    <div class="stage-nav-caption"><strong>${practice?'Задания':'Этапы'}</strong>
      ${mode==='mock'?'':`<span>Выполнено ${completed.length} из ${items.length}</span>`}
    </div>
    <ol class="stage-nav-list" role="list">${items.map((item,index)=>{
      const done = completed.includes(item);
      const number = index+Number(practice);
      return `<li><button type="button" class="stage-nav-node" ${practice?`data-task="${index}"`:`data-stage="${item.id}"`}
        aria-label="${number} · ${E(item.title)} · ${stageTiming(item.id)}${done?' · Выполнено':''}" ${item.id===active?'aria-current="step"':''} ${done?'data-completed':''}>
        <span class="stage-nav-marker" aria-hidden="true">${done?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':number}</span>
        <span class="stage-nav-label" aria-hidden="true">${E(item.title)}<small>${stageTiming(item.id)}</small></span>
        <span class="stage-nav-short" aria-hidden="true">${shortStages[number]}</span>
      </button></li>`;
    }).join('')}</ol>
  </nav>`;
}
const {sourceWorkbooks,stageOutputs}=D;
const preparation = 'Компания «Чудо Обувь» занимается продажей обуви. В четырёх заданиях вы подготовите базу данных, создадите каталог, реализуете оформление заказов и добавите управление заказами для менеджера и администратора.';
function stageTiming(id) {
  const task = D.tasks.find(entry=>entry.id===id);
  return task ? task.minutes+' мин' : 'Перед началом';
}
function stageTitle(item) {
  return item.module+(item.id==='documents'?'':' · '+stageTiming(item.id));
}
const previousLessonSteps={
  documents:[0,1,3,4,5,6,7],
  M1:[0,1,2,3,17,20,21,22,23,19,26],
  M2:[0,1,2,3,4,5,6,7,8,11,13,15,16],
  M3:[0,1,2,3,5,6,7,8,9,10],
  M4:[0,1,5,6,7,8,9,10,11,12,13,14,16]
};
const databaseCards=[0,1,2,3,13,14,15,16,17,18,20,21,22,23,24,25,19,26];
const lessonStepKey=id=>isWpf()?progressKey('step:'+id):['M1','M4'].includes(id)?'step:'+id+':route':previousLessonSteps[id]?'step:'+id+':cards':'step:'+id;
function savedLessonStep(id) {
  const saved=get(lessonStepKey(id));
  if(isWpf()||saved!==null||!previousLessonSteps[id])return saved;
  if(id==='M1'||id==='M4'){
    const intermediate=get('step:'+id+':cards');
    if(intermediate!==null)return id==='M1'?(databaseCards[intermediate]??0):Math.min(intermediate===15?16:intermediate,16);
  }
  const previous=get('step:'+id);
  return previous===null?null:(previousLessonSteps[id][previous]??0);
}
const requestedCard=new URLSearchParams(location.search).get('card');
if(mode==='learn'&&learningView==='steps'&&requestedCard){
  const steps=current().steps;
  const index=/^\d+$/.test(requestedCard)?Math.min(Number(requestedCard),steps.length)
    : steps.findIndex(step=>requestedCard==='designer'?step.details:step.title===requestedCard||step.details?.includes(requestedCard));
  if(index>=0)set(lessonStepKey(stage),index);
}
function resumeView(id) {
  return savedLessonStep(id)!==null || stageDone(id) ? 'steps' : 'brief';
}
function stageResult(item) {
  return `<strong>Что сохранить</strong><ul class="result-files">${stageOutputs[item.id].map(([name,note])=>
    `<li>${name.includes('.')?`<code>${E(name)}</code>`:E(isWpf()?name.replace('Windows Forms','WPF'):name)} · ${E(note)}</li>`).join('')}</ul>`;
}
function stackPicker() {
  return `<div class="map-stack">
    <label for="stack">Стек обучения</label>
    <select id="stack"><button type="button"><selectedcontent></selectedcontent></button>
      ${Object.entries(D.stacks).map(([id,{name,tools}])=>`<option value="${id}" ${stack===id?'selected':''}>
        <span>${E(name)}</span><span class="stack-tools"><span class="stack-separator"> · </span>${E(tools)}</span>
      </option>`).join('')}
    </select>
  </div>`;
}
function learningMap() {
  const opened = get(progressKey('opened-stage'),'documents');
  const stages = learningStages();
  return `<section class="map-panel">
    <div class="map-intro"><h1 tabindex="-1">Маршрут обучения</h1><p>Сначала разберите исходные документы. Дальше каждый этап даёт результат для следующего.</p></div>
    ${stackPicker()}
    <div class="learning-map">
      <ol class="map-nodes" aria-label="Этапы обучения">${stages.map((item,index)=>{
        const done = stageDone(item.id);
        const current = !done && item.id===opened;
        const status = done?' · Завершён':current?' · Текущий этап':'';
        return `<li><button type="button" class="map-node" data-map-stage="${item.id}" aria-pressed="${item.id===stage}"
          ${current?'aria-current="step"':''} ${done?'data-completed':''}>
          <span class="map-circle" aria-hidden="true">${done?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':index}</span>
          <span><strong>${E(item.title)}</strong><small>${E(stageTitle(item)+status)}</small></span>
        </button></li>`;
      }).join('')}</ol>
      <article class="map-detail" aria-label="Выбранный этап">
        ${stages.map(item=>{
          const saved = savedLessonStep(item.id);
          const task = D.tasks.find(entry=>entry.id===item.id);
          const action = stageDone(item.id) ? 'Открыть этап'
            : saved===item.steps.length ? 'Что сохранить'
            : saved!==null ? 'Продолжить с шага '+(saved+1)
            : task ? 'Прочитать условие' : 'Открыть подготовку';
          return `<div class="map-stage-preview" ${item.id===stage?'':'inert'}>
            <div class="map-stage-content">
              <p class="section-code">${E(stageTitle(item))}</p>
              <h2>${E(item.title)}</h2><p>${E(task?.text||preparation)}</p>
              ${stageResult(item)}
            </div>
            ${btn(action+' →',`data-stage="${item.id}" data-lesson-view="${resumeView(item.id)}"`,true)}
          </div>`;
        }).join('')}
      </article>
    </div>
  </section>`;
}
const materialDocuments = [
  {name:'Задания базового уровня · КИМ',path:D.kim,page:35},
  {name:'Описание предметной области',path:'materials/description.html'},
  {name:'Руководство по стилю',path:'materials/style-guide.html'}
];
const materialWorkbooks = sourceWorkbooks.map(name=>({name,path:'materials/resources/'+name}));
const materialDownload = {name:'Скачать исходные файлы · ZIP',path:'downloads/task-inputs.zip',download:true};
function stageMaterials(stageId,training=false) {
  const [condition,description,style]=materialDocuments;
  const taskCondition = (number,page)=>({...condition,name:training?'КИМ · задание '+number+' · PDF':'Условие задания '+number+' · КИМ',page});
  return {
    documents:[condition,materialDownload],
    M1:[taskCondition(1,35),description,...materialWorkbooks,...(training?[materialDownload]:[])],
    M2:[taskCondition(2,37),style],
    M3:[taskCondition(3,39),...(training?materialWorkbooks.filter(file=>file.name==='Users_import.xlsx'):[])],
    M4:[taskCondition(4,41)]
  }[stageId];
}
function lessonBrief(lesson) {
  const task = D.tasks.find(entry=>entry.id===lesson.id);
  return `<div class="lesson-brief">
    ${assignmentFiles(stageMaterials(lesson.id))}
    <p>${E(task?.text||preparation)}</p>
    ${task?stageResult(lesson):''}
    ${btn(savedLessonStep(lesson.id)===null?'Перейти к шагам →':stepIndex(lesson)===lesson.steps.length?'Что сохранить →':'Продолжить с шага '+(stepIndex(lesson)+1)+' →','data-lesson-view="steps"',true)}
  </div>`;
}
function assignmentFiles(files) {
  return `<section class="lesson-files"><h3>Материалы задания</h3>${materialReader(files)}</section>`;
}
function materialReader(files) {
  return `<div class="material-reader">
    <ul class="material-list">${files.map(({name,path,page,download})=>
      `<li><a href="${E(path+(page?'#page='+page:''))}" ${download?'download':`data-material-path="${E(path)}" data-page="${page||''}"`}>${E(name)}</a></li>`).join('')}</ul>
    <div class="material-preview" data-material-preview></div>
  </div>`;
}
function drawMaterial(preview,{name,path,page},showTitle=true) {
  const workbook=D.workbooks[path.split('/').pop()];
  const source=path+(page?'#page='+page:'');
  const body=workbook? `<p>Первые ${workbook.rows.length} записей из ${workbook.total}.</p>
    <div class="material-table" tabindex="0" aria-label="Данные книги"><table>
    <thead><tr>${workbook.columns.map(column=>`<th scope="col">${E(column)}</th>`).join('')}</tr></thead>
    <tbody>${workbook.rows.map(row=>`<tr>${workbook.columns.map(column=>`<td>${E(row[column]??'')}`).join('')}</tr>`).join('')}</tbody></table></div>`
    :D.code[path]? `<pre class="code-preview" tabindex="0">${E(D.code[path])}</pre>`
    :`<iframe src="${E(source)}" title="${E(name)}"></iframe>`;
  const download=D.code[path]?'code/'+path+'.txt':path;
  preview.innerHTML=`<div class="material-preview-head">${showTitle?`<h4 tabindex="-1">${E(name)}</h4>`: ''}
    <a href="${E(download)}" download>Скачать файл</a></div>${body}`;
}
function bindMaterialReaders(container) {
  container.querySelectorAll('.material-reader').forEach(reader=>{
    const links=reader.querySelectorAll('[data-material-path]');
    links.forEach(anchor=>anchor.onclick=event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      links.forEach(item=>item.removeAttribute('aria-current'));
      anchor.setAttribute('aria-current','true');
      const preview=reader.querySelector('[data-material-preview]');
      drawMaterial(preview,{name:anchor.textContent,path:anchor.dataset.materialPath,page:anchor.dataset.page});
      preview.querySelector('h4').focus();
    });
  });
}
const lessonScenarios = {
  documents: [
    ['DBeaver запустился, но подключение не проходит','Убедитесь, что сервер MySQL или MariaDB запущен. Сверьте адрес и порт сервера с настройками подключения. DBeaver сам сервер не запускает.'],
    ['Где искать таблицы после распаковки','Откройте папку resources. В ней лежат пять книг *_import.xlsx и папка Images. Сохраните исходные файлы отдельно от папки решения.'],
    ['Неясно, где вводить пароль','Реквизиты СУБД нужны для подключения к базе. Покупатель входит в «Чудо Обувь» по учебному логину.']
  ],
  M1: [
    ['DBeaver пишет Connection refused','Проверьте, запущен ли сервер, и возьмите порт из его настроек. В учебной среде встречаются 3306 и 3307. Снова нажмите Test Connection.'],
    ['Таблица осталась NewTable или с другой кодировкой','Задайте имя, нажмите Tab и сверьте заголовок вкладки. В SQL Preview проверьте свою базу и DEFAULT CHARSET=utf8mb4. При отличии нажмите Cancel и поправьте свойства.'],
    ['Внешний ключ ссылается на другую таблицу','Фильтр categories показывает и subcategories. Выделите точную таблицу categories, выберите PRIMARY и сопоставьте category_id с id. Проверьте оба имени в SQL Preview.'],
    ['Импорт останавливается на request_id','У исторических заказов нет номера запроса. Откройте orders.request_id в редакторе столбца, снимите Not Null и проверьте изменение перед Execute. После ошибки прервите сценарий и выполните ROLLBACK в том же подключении.'],
    ['Не найдена модель для строки остатка','Сверьте наименование и производителя в обеих книгах. Импортёр нормализует пробелы и явно сопоставляет сокращение для «Барбари». Посмотрите отчёт и устраните неоднозначность до повторного запуска.'],
    ['Из Excel получилось 30 заказов','Строки одной покупки повторяют номер. В orders нужен один заголовок на номер, а в order_items — отдельная строка на каждую позицию. В образце 10 заголовков и 30 строк.']
  ],
  M2: [
    ['Каталог пуст или не открывается','Проверьте имя учебной базы и результат SELECT COUNT(*) FROM products. Сверьте строку подключения и убедитесь, что импорт завершился COMMIT.'],
    ['Вместо фотографии пустое место','Сравните products.image с точным именем файла в Assets/Images. Проверьте, что каталог ресурсов копируется в выходную папку и используется заглушка picture.png.'],
    ['Скидка не совпадает со сверкой','Используйте контрольную дату 15.05.2026. Сравните продажи именно предыдущего календарного месяца и расчёт для выбранной модели.']
  ],
  M3: [
    ['Покупатель не может войти','Возьмите логин из Users_import.xlsx, например asidorova. Используйте точное написание. Реквизиты СУБД вводятся в другом окне.'],
    ['У модели нет выбранного размера','Откройте карточку и проверьте складскую позицию с нужным size_id. Для добавления доступен только размер с положительным остатком.'],
    ['После подтверждения остаток изменился неожиданно','Сверьте остаток конкретного размера до и после подтверждения. Если одна позиция недоступна, проверьте откат всей покупки.']
  ],
  M4: [
    ['У менеджера нет кнопки «Изменить дату»','Это действие администратора. Откройте один заказ сначала как papetrov, потом как isivanov и сравните окна.'],
    ['При смене роли появляется предупреждение','Если в корзине есть тестовые позиции, программа спрашивает об очистке. Подтвердите только после проверки корзины или завершения учебного заказа.'],
    ['EXE работает только рядом с исходниками','Перенесите всю папку Release с DLL и Assets. Восстановите SQL в отдельной базе и запустите EXE из скопированной папки.']
  ]
};
function lessonHelp(lesson) {
  if(isWpf())return `<div class="lesson-help"><h3>Как проверить этап</h3>
    <ul>${lesson.steps.map(step=>`<li><strong>${E(step.title)}</strong> · ${E(step.check)}</li>`).join('')}</ul></div>`;
  const database=lesson.id==='M1';
  const scenarios=lessonScenarios[lesson.id].map(([title,answer])=>
    `<section><h4>${E(title)}</h4><p>${E(answer)}</p></section>`).join('');
  const topics=[
    ['summary','Объяснение',database
      ? '<h3>От исходных книг к базе</h3><p>Сначала спроектируйте связи и создайте десять таблиц в DBeaver. Затем импортёр C# читает пять исходных XLSX или шесть CSV учебного варианта и готовит data.sql. Выполните этот файл на пустой схеме, сверьте данные и сохраните SQL и ER в PDF.</p>'
      : '<h3>Как пройти этап</h3><p>Откройте «Условие и файлы», затем выполняйте шаги по порядку. Перед переходом к следующему действию сверьте ожидаемый результат.</p>'],
    ...(database?[
      ['example','Пример','<h3>Одна модель, несколько остатков</h3><p>Если у кроссовок есть размеры 19 и 20, название, фото, состав и цена хранятся в одной строке products. В sizes есть два значения размера. В stock_items — две строки с собственным остатком. Если покупатель заказал размер 19, order_items ссылается именно на эту складскую позицию.</p>'],
      ['terms','Термины','<h3>Ключи и ограничения</h3><dl class="database-terms"><dt>PK</dt><dd>Однозначно определяет строку.</dd><dt>FK</dt><dd>Ссылается на существующую строку другой таблицы.</dd><dt>UNIQUE</dt><dd>Запрещает вторую складскую позицию с той же парой product_id и size_id.</dd><dt>COMMIT и ROLLBACK</dt><dd>Подтверждают или отменяют транзакцию импорта.</dd></dl>']
    ]:[]),
    ['errors','Ситуации',`<h3>Что делать, если возникла ошибка</h3><div class="lesson-situations">${scenarios}</div>`]
  ];
  return `<div class="lesson-help">
    <div class="lesson-views help-topics" role="tablist" aria-label="Темы справки">${topics.map(([id,title],index)=>btn(E(title),
      `id="help-tab-${id}" role="tab" aria-controls="help-panel-${id}" aria-selected="${index===0}" tabindex="${index===0?0:-1}"`)).join('')}</div>
    ${topics.map(([id,,html],index)=>`<section id="help-panel-${id}" role="tabpanel" aria-labelledby="help-tab-${id}" ${index?'hidden':''}>${html}</section>`).join('')}
  </div>`;
}
function bindHelpTopics() {
  const tabs=[...root.querySelectorAll('.help-topics [role="tab"]')];
  function select(tab) {
    for (const item of tabs) {
      item.setAttribute('aria-selected',String(item===tab));
      item.tabIndex=item===tab?0:-1;
      document.getElementById(item.getAttribute('aria-controls')).hidden=item!==tab;
    }
    tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.onclick=()=>select(tab);
    tab.onkeydown=event=>{
      const target={ArrowLeft:tabs[(index+tabs.length-1)%tabs.length],ArrowRight:tabs[(index+1)%tabs.length],Home:tabs[0],End:tabs.at(-1)}[event.key];
      if(target){event.preventDefault();select(target);}
    };
  });
}
function shot(s){const x=D.screens[s.shot||s.file];return x?`<figure class="microshot"><button class="image-open" data-image="${E(x.file)}" aria-label="Увеличить: ${E(x.caption)}"><img src="${E(x.file)}" alt="${E(x.caption)}" loading="lazy"></button><figcaption>${E(x.caption)}</figcaption></figure>`:'';}
function explain(s,database=false) {
  const actions=s.actions.map(action=>`<li>${E(action)}</li>`).join('');
  const check=`<div class="step-result"><strong>${database?'Как проверить результат':'Проверьте себя'}</strong><p>${E(s.check)}</p></div>`;
  if(s.erWorkspace)return `
    <section class="lesson-explanation er-review">
      <h4>Что сверить</h4>
      <p>${E(s.why)}</p>
      <ol>${actions}</ol>
    </section>
    <section class="er-workspace" id="er-workspace" aria-labelledby="er-title"></section>
    ${check}`;
  const reason=`<p class="lesson-reason"><strong>Зачем это нужно.</strong> ${E(s.why)}</p>`;
  return `<section class="lesson-explanation">
    ${database?'':`<h3>Как это понять</h3><p>${E(s.why)}</p>`}
    <h3>${database?'Что сделать':'Что сделать самостоятельно'}</h3>
    ${!s.details||s.detailsSupplement?`<ol>${actions}</ol>`:''}
    ${s.details?`<div class="step-instructions">${s.details.map((section,i)=>`${i?`<h4>${E(section)}</h4>`: ''}${D.lessonDetails[section]}`).join('')}</div>`:''}
    ${s.code?`<pre tabindex="0">${E(s.code)}</pre>`:''}
    ${s.file&&!s.details?`<details><summary>Полный файл для сверки · ${E(s.file)}</summary><p>Сначала разберите действие и поля. Сверка показывает итоговый файл, включая последующие операции.</p><pre tabindex="0">${E(D.code[s.file]||'')}</pre></details>`:''}
    ${s.details?'':shot(s)}
    ${check}
    ${database?reason:''}</section>`;
}
const lessonResultTitle = 'Что сохранить';
const stepIndex = (lesson=current()) => Math.max(0,Math.min(lesson.steps.length,savedLessonStep(lesson.id)??0));
function stepArrow(index,previous,label) {
  const path=previous?'M20 12H4m7-7-7 7 7 7':'M4 12h16m-7-7 7 7-7 7';
  return btn(`<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`,
    `data-step="${index}" aria-label="${label}" title="${label}" aria-keyshortcuts="${previous?'ArrowLeft':'ArrowRight'}"`,!previous);
}
function goToLessonStep(index) {
  set(lessonStepKey(stage),index);
  render();
  document.getElementById('lesson-step-title').focus();
}
function showLessonSteps() {
  const lesson=current(), index=stepIndex(lesson);
  const titles=[...lesson.steps.map(step=>step.title),lessonResultTitle];
  const dialog=modal('Шаги этапа · '+lesson.title,`<ol class="lesson-step-list">${titles.map((title,i)=>
    `<li>${btn(E(title),`data-jump-step="${i}" ${i===index?'aria-current="step"':''}`)}</li>`).join('')}</ol>`);
  dialog.querySelectorAll('[data-jump-step]').forEach(button=>button.onclick=()=>{
    dialog.close();
    goToLessonStep(Number(button.dataset.jumpStep));
  });
  dialog.querySelector('[aria-current="step"]').focus();
}
function learn() {
  if (learningView==='map') return learningMap();
  const lesson=current(), index=stepIndex(lesson), step=lesson.steps[index];
  const stages=learningStages(), done=stageDone(stage), next=stages[stages.indexOf(lesson)+1];
  return `<div class="lesson-top">
    ${header('Обучение',D.stacks[stack].name)}
    ${btn('← К маршруту','data-mode="learn" aria-label="К маршруту обучения"')}
  </div>
  <div class="route-layout lesson-layout">
    ${stageNavigation(stages,stage)}
    <section class="route-panel lesson-card" aria-labelledby="lesson-title">
      <h2 id="lesson-title" tabindex="-1">${E(lesson.title)}</h2>
      <p class="task-meta">${E(stageTitle(lesson))}</p>
      <nav class="lesson-views" aria-label="Разделы этапа">
        ${[['brief','Условие и файлы'],['steps','Шаги'],['help','Справка']].map(([id,title])=>
          btn(title,`data-lesson-view="${id}" ${id===learningView?'aria-current="page"':''}`)).join('')}
      </nav>
      ${learningView==='brief' ? lessonBrief(lesson) : learningView==='help' ? lessonHelp(lesson) : `
        <article class="study-step${step?.erWorkspace?' study-step-er':''}" aria-labelledby="lesson-step-title">
          <header class="step-heading">
            <h3 id="lesson-step-title" tabindex="-1"><span class="lesson-step-number" aria-label="Шаг ${index+1} из ${lesson.steps.length+1}">${index+1}</span><span>${E(step?.title||lessonResultTitle)}</span></h3>
            ${btn('<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>','id="lesson-steps" aria-label="Все шаги" title="Все шаги" aria-haspopup="dialog"')}
          </header>
          ${step?explain(step,lesson.id==='M1'):`<div class="lesson-result">${stageResult(lesson)}</div>`}
          <div class="study-controls${step?'':' lesson-result-controls'}">
            ${index>0?stepArrow(index-1,true,'Предыдущий шаг'):''}
            ${step?stepArrow(index+1,false,index+1===lesson.steps.length?lessonResultTitle:'Следующий шаг'):`
              <label class="lesson-complete"><input type="checkbox" id="done" ${done?'checked':''}> Этап выполнен</label>
              ${done?(next?btn('Далее · '+E(next.title)+' →',`data-stage="${next.id}"`,true):btn('Перейти к тренировке →','data-mode="training"',true)):''}
            `}
          </div>
        </article>
      `}
    </section>
  </div>`;
}
const practiceIndex = () => Math.max(0,Math.min(D.tasks.length-1,get('task:'+scope(),0)));
const practiceDone = id => get('task-done:'+scope()+':'+id,false);
const taskClock = () => get('task-clock:'+scope()) || {anchor:0,spent:{},alerted:{}};
const taskSpent = (clock,id,used) => (clock.spent[id] || 0) + Math.max(0,used-clock.anchor);
let showVariantBrief = false;
let timerAudio;

function enableTimerSound() {
  if (!get('timer-sound',true) || !window.AudioContext) return;
  timerAudio ??= new AudioContext();
  timerAudio.resume().catch(()=>{});
}
function signalTimer() {
  if (!get('timer-sound',true) || timerAudio?.state!=='running') return;
  const tone=timerAudio.createOscillator(), volume=timerAudio.createGain();
  const now=timerAudio.currentTime;
  tone.frequency.value=660;
  volume.gain.setValueAtTime(.12,now);
  volume.gain.exponentialRampToValueAtTime(.001,now+.5);
  tone.connect(volume).connect(timerAudio.destination);
  tone.start(now);
  tone.stop(now+.5);
}
function timerBox(attempt,index,mock) {
  const {status} = attempt;
  const finished=status==='finished', running=status==='running', idle=status==='idle';
  const startLabel = mock?'Начать':idle?'Начать тренировку':'Продолжить тренировку';
  const main = finished?btn('Начать заново','data-timer="reset"',true)
    : running ? (mock?'':btn('Пауза','data-timer="pause"',true)) : btn(startLabel,'data-timer="start"',true);
  return `<section class="timer-card" aria-label="${mock?'Время пробного экзамена':'Время тренировки'}">
    <div class="training-timer-top">
      <span class="eyebrow">${mock?'Пробный экзамен':'Тренировка'}</span>
      <output class="training-clock" id="clock" aria-live="off">${C.format(C.timerView(attempt).left)}</output>
      <span id="timer-status" role="status"></span>
      <progress id="timer-progress" aria-label="Использованное время" max="1" value="0"></progress>
      ${mock?'':`<div class="timer-task"><span id="task-clock-label">Время на задание ${index+1}</span><output id="task-clock" aria-labelledby="task-clock-label" aria-live="off"></output></div>`}
    </div>
    <div class="training-timer-controls">${main}${!finished&&(!idle||mock)?btn('Завершить',`data-timer="finish" ${idle?'disabled':''}`):''}</div>
    ${mock?'':`<div class="attempt-actions">
      <label><input type="checkbox" id="timer-sound" ${get('timer-sound',true)?'checked':''}> Звук таймера</label>
      ${running||status==='paused'?btn('Сбросить тренировку','data-timer="reset"'):''}
    </div>`}
    ${mock&&!finished?'<p class="timer-hint">После начала время идёт непрерывно, даже при закрытой странице.</p>':''}
  </section>`;
}
function conditionParagraphs(text) {
  return text.split(/(?<=[.!?])\s+(?=[А-ЯЁ])/u).map(line=>`<p>${E(line)}</p>`).join('');
}
function variantBrief(entry,index) {
  const lines=D.variantBriefs[entry.id].split(/\r?\n/).filter(line=>line.trim()&&!line.startsWith('# '));
  const items=D.variantTasks[entry.id];
  return `<article class="training-task">
    <header class="mock-brief-heading">
      <div><h2>${E(entry.title)}</h2><p class="task-meta">Условие варианта · ${entry.id}</p></div>
      ${btn('К заданию '+(index+1),`data-task="${index}"`)}
    </header>
    <section class="practice-condition">
      ${lines.filter(line=>!/^\d+\. /.test(line)).map(line=>`<p>${E(line)}</p>`).join('')}
      <ol>${items.map(item=>`<li>${E(item)}</li>`).join('')}</ol>
    </section>
  </article>`;
}
function practice() {
  const attempt=timer(), {status}=attempt, mock=mode==='mock';
  const index=practiceIndex(), task=D.tasks[index], locked=status==='paused'||status==='finished';
  const entry=D.variants.find(item=>item.id===variant);
  const checked=task.checks.map((_,i)=>get('check:'+scope()+':'+task.id+':'+i,false));
  const taskCard = `<article class="training-task">
    <h2>${E(task.title)}</h2>
    <p class="task-meta">Задание ${index+1} · ${task.minutes} мин${mock?' · '+entry.id+' · '+E(entry.title):''}</p>
    <section class="practice-condition"><h3>Условие задания</h3>${conditionParagraphs(mock?D.variantTasks[entry.id][index]:task.text)}</section>
    ${mock?'':assignmentFiles(stageMaterials(task.id,true))}
    ${mock||locked?'':`<div class="task-support">${btn('Подсказка к заданию',`data-help="${task.id}"`)}</div>`}
    <section class="self-check training-checklist" aria-labelledby="training-check-title">
      <header><h3 id="training-check-title">Самопроверка</h3><span id="training-check-count" aria-live="polite">${checked.filter(Boolean).length} из ${checked.length}</span></header>
      ${task.checks.map((text,i)=>`<label><input type="checkbox" data-check="${task.id}:${i}" ${locked?'disabled':''} ${checked[i]?'checked':''}>${E(text)}</label>`).join('')}
      ${mock?'<p class="small">Отметки служат для самопроверки.</p>':`<label class="task-complete"><input type="checkbox" id="task-complete" ${locked?'disabled':''} ${practiceDone(task.id)?'checked':''}> Задание выполнено</label>`}
    </section>
  </article>`;
  return `<section class="training-page practice-page training-compact ${mock?'mock-exam':''}">
    <header class="workspace-intro">
      <div><h1>${mock?'Пробный экзамен':'Тренировка'}</h1><p>${mock?'30 учебных вариантов · 4 задания · 75 баллов':'«Чудо Обувь» · официальный образец КИМ'}</p></div>
    </header>
    <div class="attempt-layout">
      ${timerBox(attempt,index,mock)}
      <div class="attempt-content">
        ${mock?`<div class="mock-variant-bar">
          <div class="training-source"><label>Вариант<select id="variant" ${status==='running'?'disabled':''}>${D.variants.map(item=>`<option value="${item.id}" ${item.id===variant?'selected':''}>${item.id} · ${E(item.title)}</option>`).join('')}</select></label></div>
          <div class="mock-variant-actions">${btn('Условие варианта',`id="mock-brief" aria-pressed="${showVariantBrief}"`)}
            <a class="btn" href="downloads/exam-${entry.id}.zip" download>Файлы ${entry.id} · ZIP</a></div>
        </div>`:''}
        ${status==='paused'?'<section class="pause-screen" tabindex="-1" aria-labelledby="pause-title"><h2 id="pause-title">Тренировка на паузе</h2><p>Отсчёт остановлен. Условия и отметки снова появятся после продолжения.</p></section>':
          status==='finished'?'<section class="attempt-result" tabindex="-1" role="status"><h2>Попытка завершена</h2><p>Отметки сохранены. Можно начать новую попытку.</p></section>':''}
        <div class="training-workspace" ${status==='paused'?'hidden':''}>
          ${stageNavigation(D.tasks,showVariantBrief&&mock?null:task.id,true)}
          ${mock&&showVariantBrief?variantBrief(entry,index):taskCard}
        </div>
      </div>
    </div>
  </section>`;
}
const exampleAccounts = [['Клиент','asidorova'],['Менеджер','papetrov'],['Администратор','isivanov']];
const exampleDescriptions = {
  'CatalogForm.cs':'Показывает каталог. Применяет поиск, фильтр категории и сортировку цены к одному списку.',
  'ConnectionForm.cs':'Принимает реквизиты MySQL / MariaDB и проверяет подключение к учебной базе.',
  'LoginForm.cs':'Принимает логин клиента, менеджера или администратора и передаёт его на проверку.',
  'ProductForm.cs':'Показывает модель, размеры и остатки. Добавляет выбранную позицию в корзину.',
  'BasketForm.cs':'Показывает позиции заказа, позволяет изменить количество, подтвердить заказ или отказаться.',
  'OrdersForm.cs':'Открывает список заказов менеджеру и администратору.',
  'OrderDetailsForm.cs':'Показывает состав заказа и действия, доступные администратору.',
  'sample.sql':'Создаёт таблицы и загружает исходные модели, остатки, пользователей и заказы.',
  'schema.sql':'Описывает структуру таблиц, ключи и ограничения без учебных данных.',
  'Store.cs':'Выполняет запросы каталога, проверяет роли и сохраняет изменения заказов в базе.'
};
function describeExampleFile(file) {
  const name=file.split('/').at(-1);
  if (exampleDescriptions[name]) return exampleDescriptions[name];
  if (name.endsWith('.Designer.cs')) return 'Компоненты, свойства и размещение элементов формы, сохранённые Visual Studio Designer.';
  if (name.endsWith('.csproj')) return 'Параметры проекта .NET и ссылки на его зависимости.';
  if (file.startsWith('examples/Import/')) return 'Читает исходные таблицы Excel или CSV и готовит SQL для импорта данных.';
  if (file.startsWith('examples/Checks/')) return 'Проверяет бизнес-правила, права ролей и операции с заказами.';
  return 'Вспомогательный файл примера. Откройте его, чтобы посмотреть код.';
}
function exampleFilePicker(id,selected) {
  const files=Object.keys(D.code).filter(file=>isWpf()
    ? /^examples\/(Wpf|Core|Import)\//.test(file)||file.startsWith('content/postgresql/')
    : (file.startsWith('examples/')||file.endsWith('.sql'))&&!/^examples\/Wpf\/|^content\/postgresql\//.test(file));
  return `<label class="example-file-label">Файл<select id="${id}">${files.map(file=>
    `<option ${file===selected?'selected':''}>${E(file)}</option>`).join('')}</select></label>`;
}
function examples() {
  const selected=isWpf()?'examples/Wpf/MainWindow.xaml':'examples/WinForms/CatalogForm.cs';
  const archive=isWpf()?'prog-demo-wpf.zip':'prog-demo-example.zip';
  const windowsBuild=isWpf()?D.wpfWindowsBuild:D.windowsBuild;
  const shots=['login','examples/WinForms/CatalogForm.cs','examples/WinForms/BasketForm.cs','examples/WinForms/OrdersForm.cs'];
  return `<section class="training-page example-page">
    ${header('Готовый пример','Скачайте рабочий проект «Чудо Обувь» с учебными данными.')}
    ${stackPicker()}
    <div class="example-grid">
      <article class="route-panel">
        <h2>${E(D.stacks[stack].name)}</h2>
        <p>В архиве есть решение Visual Studio, SQL с учебными данными и ER-диаграмма.${windowsBuild?' Готовая программа находится в папке Windows.':''}</p>
        <div class="example-actions">
          <a class="btn primary" href="downloads/${archive}" download>Скачать готовый пример · ZIP</a>
          ${btn('Инструкция по запуску','id="example-launch" aria-haspopup="dialog"')}
        </div>
        <div class="example-accounts"><p>Откройте окно «Вход» и введите учебный логин.</p>
          <table aria-label="Учебные записи"><thead><tr><th scope="col">Роль</th><th scope="col">Логин</th></tr></thead>
          <tbody>${exampleAccounts.map(([role,login])=>`<tr><th scope="row">${role}</th><td><code>${login}</code></td></tr>`).join('')}</tbody></table>
        </div>
        <div class="example-actions">${link('ER · PDF',erPdf())}</div>
      </article>
      <article class="route-panel">
        <h2>Внутри проекта</h2><p>Откройте файл, чтобы прочитать и скопировать код.</p>
        ${exampleFilePicker('example-file',selected)}
        <p id="example-file-description" class="file-description" aria-live="polite">${describeExampleFile(selected)}</p>
        ${btn('Открыть файл','id="open-file"')}
      </article>
    </div>
    ${isWpf()?'':`<h2 class="example-gallery-heading">Работающая информационная система</h2>
    <p>Рассмотрите вход, каталог, корзину и список заказов на снимках из Windows.</p>
    <div class="screenshot-index">${shots.map(key=>shot({shot:key})).join('')}</div>`}
  </section>`;
}
function exampleInstructions() {
  modal('Инструкция по запуску',`<div class="example-instructions">${isWpf()?D.wpfLaunchGuide:D.launchGuide}</div>`);
}
function criteria() {
  const total = D.criteria.reduce((sum,[,points])=>sum+points,0);
  return `<section class="route-panel overview-criteria" id="criteria" aria-labelledby="criteria-title">
    <div class="criteria-heading"><h2 id="criteria-title">Критерии оценки</h2><span>${total} баллов</span></div>
    <p class="criteria-source">КИМ 09.02.07-2-2027 · таблица 7 · базовый уровень</p>
    <div class="criteria-table-wrap"><table class="criteria-table" aria-labelledby="criteria-title">
      <thead><tr><th scope="col">Критерий</th><th scope="col">Баллы</th></tr></thead>
      <tbody>${D.criteria.map(([name,points])=>`<tr><th scope="row">${E(name)}</th><td>${points}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row">Итого</th><td>${total}</td></tr></tfoot>
    </table></div>
    ${link('Открыть КИМ · PDF',D.kim)}
  </section>`;
}
function teacher() {
  return `<section class="training-page">
    ${header('Преподавателю','Разбор официального образца ДЭ 2027. Режим показа открывает отдельное окно для аудитории.')}
    <div class="button-row">${btn('Данные преподавателя','id="teacher-settings"')}</div>
    ${Object.entries(D.stacks).map(([id,{name,deck}])=>`<section class="teacher-stack" aria-labelledby="teacher-${id}">
      <h2 id="teacher-${id}">${E(name)}</h2>
      <article class="route-panel">
        <h3>Чудо Обувь</h3>
        <div class="button-row">
          <a class="btn primary" id="deck-open${id==='mysql'?'':'-postgresql'}" href="${deck}">Открыть презентацию</a>
          <a class="btn" href="${deck}?print=1&amp;dialog=1" target="_blank" rel="noopener">Печать / сохранить PDF</a>
        </div>
      </article>
    </section>`).join('')}
  </section>`;
}
function modal(title,html='',extra=''){const d=document.createElement('dialog');d.className='course-dialog '+extra;d.setAttribute('aria-label',title);d.innerHTML=`<header class="modal-head"><h2>${E(title)}</h2>${btn('Закрыть','data-close')}</header><div class="modal-body">${html}</div>`;document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();return d;}
function showMaterial(file) {
  const dialog=modal(file.name,'<div class="material-preview"></div>');
  drawMaterial(dialog.querySelector('.material-preview'),file,false);
}
const tourTopics = [
  {title:'С чего начать',mode:'overview',items:[
    'На «Обзоре» проверьте тему, время и критерии оценки. На базовом уровне четыре задания, 210 минут и 75 баллов.',
    'В «Обучении» откройте карту. Сначала подготовьте Windows и исходники, затем переходите к базе, каталогу, заказу и сдаче.'
  ]},
  {title:'Условие и исходные файлы',mode:'learn',items:[
    'Выберите этап на карте и откройте «Условие и файлы». В начале этапа указан список материалов для этого задания.',
    'КИМ открывается на нужной странице. Для книг Excel можно посмотреть первые строки или скачать книгу целиком. ZIP с исходными файлами находится в подготовке.'
  ]},
  {title:'Как проходить шаги',mode:'learn',items:[
    'Выполните действие на карточке и сверьте результат. Стрелки ведут назад и вперёд. Кнопка «Все шаги» открывает список карточек этапа.',
    'В «Справке» есть объяснения и типичные ситуации с решениями. На последней карточке «Что сохранить» отметьте этап выполненным.',
    'Текущая карточка и отметки сохраняются в этом браузере. С карты можно продолжить с последнего открытого шага.'
  ]},
  {title:'Как разобрать ER-схему',mode:'learn',items:[
    'В задании «База данных и импорт» откройте шаг «Постройте ER-схему». Двигайтесь по этапам стрелками или выбирайте нужную таблицу и поле.',
    'Справа показаны назначение, источник и свойства поля. Для сверки переключитесь на готовую схему или скачайте её в PDF.'
  ]},
  {title:'Тренировка по образцу',mode:'training',items:[
    'Используйте официальный образец «Чудо Обувь». Переключайте задания слева, отмечайте результаты в «Самопроверке» и при необходимости открывайте подсказки.',
    'Таймер тренировки можно остановить и продолжить. После завершения или сброса доступна новая попытка.'
  ]},
  {title:'Пробный экзамен',mode:'mock',items:[
    'До старта выберите один из 30 вариантов, прочитайте его условие и скачайте ZIP рядом с выбором варианта.',
    'После начала 210 минут идут непрерывно, даже если закрыть страницу. Для самопроверки используйте отметки по каждому заданию.'
  ]},
  {title:'Готовый пример',mode:'examples',items:[
    'Скачайте ZIP с решением Visual Studio, SQL и программой Windows. В инструкции указано, как восстановить учебную базу и запустить приложение.',
    'Откройте исходный файл в браузере, посмотрите ER-схему или сравните окна со снимками работающего приложения.'
  ]},
  {title:'Материалы для преподавателя',mode:'teacher',items:[
    'Откройте презентацию и выберите этап или шаг через «Содержание». Действия, таблицы и снимки показываются на слайдах демонстрации.',
    'Заполните данные для титульного слайда. «Режим показа» открывает отдельное окно для аудитории, а сценарий остаётся у преподавателя. Для PDF откройте версию для печати.'
  ]}
];
function tour(){
  let index=0;
  const dialog=modal('Гид по курсу','','course-tour');
  const body=dialog.querySelector('.modal-body');
  function draw(focus){
    const topic=tourTopics[index];
    const section=modes.find(([id])=>id===topic.mode)[1];
    body.innerHTML=`<p class="tour-position">Раздел ${index+1} из ${tourTopics.length}</p>
      <h3 tabindex="-1">${E(topic.title)}</h3>
      <ul>${topic.items.map(text=>`<li>${E(text)}</li>`).join('')}</ul>
      <p><a href="?mode=${topic.mode}&amp;stack=${stack}${topic.mode==='learn'?'&amp;view=map':''}">Открыть раздел «${E(section)}»</a></p>
      <div class="button-row">${btn('Назад',`id="tour-prev" ${index===0?'disabled':''}`)}
        ${btn(index===tourTopics.length-1?'Готово':'Далее','id="tour-next"',true)}</div>`;
    body.querySelector('#tour-prev').onclick=()=>{index--;draw(true);};
    body.querySelector('#tour-next').onclick=()=>{if(index===tourTopics.length-1)dialog.close();else{index++;draw(true);}};
    if(focus)body.querySelector('h3').focus();
  }
  draw(true);
}
function settings(){const d=modal('Настройка перед занятием',`<div class="settings-form">${['ФИО преподавателя','Должность','Кафедра или лаборатория'].map((name,i)=>`<label>${name}<input data-teacher="${i}" value="${E(get('teacher:'+i,''))}"></label>`).join('')}</div>`);d.querySelectorAll('[data-teacher]').forEach(e=>e.oninput=()=>set('teacher:'+e.dataset.teacher,e.value));}
function fileModal(file) {
  const dialog=modal('Исходники примера',`${exampleFilePicker('code-file',file)}
    <p class="file-description" aria-live="polite"></p>
    <div class="button-row">${btn('Копировать код','id="copy-code"')}</div>
    <pre class="code-preview" tabindex="0"></pre>`);
  const picker=dialog.querySelector('#code-file'), code=dialog.querySelector('pre');
  const description=dialog.querySelector('.file-description'), copy=dialog.querySelector('#copy-code');
  const draw=()=>{
    description.textContent=describeExampleFile(picker.value);
    code.textContent=D.code[picker.value];
    copy.textContent='Копировать код';
  };
  picker.onchange=draw;
  copy.onclick=async()=>{
    try{
      await navigator.clipboard.writeText(code.textContent);
      copy.textContent='Скопировано';
    }catch{
      const range=document.createRange();
      range.selectNodeContents(code);
      const selection=window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copy.textContent='Код выделен. Нажмите Ctrl+C или ⌘C';
    }
  };
  draw();
}
function bindImages(el){el.querySelectorAll('[data-image]').forEach(e=>e.onclick=()=>modal('Иллюстрация',`<img style="max-width:100%;height:auto" src="${E(e.dataset.image)}" alt="Реальный экран приложения">`));}
function navigate(next) {
  const previous = location.href;
  if(next.mode) mode=next.mode;
  if(next.stage) stage=next.stage;
  if(next.stack) stack=next.stack;
  if(next.view) learningView=next.view;
  render();
  const target = location.href;
  if (target!==previous) {
    history.replaceState(null,'',previous);
    history.pushState(null,'',target);
  }
  if (!next.preserveScroll) window.scrollTo(0,0);
}
function render() {
  set('mode',mode);set('stage',stage);set('variant',variant);set('stack',stack);
  document.body.classList.toggle('dark',dark);
  const url = new URLSearchParams({mode,module:stage,stack,variant});
  if (mode==='learn') {
    url.set('view',learningView);
    if (learningView!=='map') set(progressKey('opened-stage'),stage);
    if (learningView==='steps' && savedLessonStep(stage)===null) set(lessonStepKey(stage),0);
  }
  history.replaceState(null,'','?'+url);
  const views = {overview,learn,training:practice,mock:practice,examples,criteria,teacher};
  root.innerHTML = `<div class="shell">
    <header class="top">
      <a class="brand" href="?mode=overview&amp;stack=${stack}"><span class="brand-emblem">ДЭ</span><span><strong>09.02.07 · Информационные системы и программирование</strong><small>Программист · 2027</small></span></a>
      <div class="top-tools">
        ${iconButton(dark?'Включить светлую тему':'Включить тёмную тему',dark?toolIcons.sun:toolIcons.moon,'id="theme"')}
        ${iconButton('Гид по курсу',toolIcons.tour,'id="tour-open" aria-haspopup="dialog"')}
      </div>
    </header>
    <nav class="site-nav" aria-label="Основные разделы">${modes.map(([id,title])=>iconButton(title,modeIcons[id],`data-mode="${id}" ${mode===id||(mode==='criteria'&&id==='overview')?'aria-current="page"':''}`)).join('')}</nav>
    <main id="main" tabindex="-1">
      ${storageOK?'':'<p class="notice">Хранилище браузера недоступно. Отметки и прогресс сохраняются до закрытия страницы.</p>'}
      ${views[mode]()}
    </main>
  </div>`;
  bind();tick();
}
function bind() {
  root.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{
    const next = button.dataset.mode;
    const inNavigation = button.closest('.site-nav');
    navigate({mode:next,view:'map'});
    const focus = inNavigation
      ? root.querySelector(`.site-nav [data-mode="${next}"]`)
      : root.querySelector('.map-intro h1');
    focus?.focus({preventScroll:true});
  });
  root.querySelectorAll('[data-stage]').forEach(button=>button.onclick=()=>{
    const next = button.dataset.stage;
    navigate({stage:next,view:button.dataset.lessonView||resumeView(next)});
    root.querySelector('#lesson-title').focus({preventScroll:true});
  });
  root.querySelectorAll('[data-map-stage]').forEach(button=>button.onclick=()=>{
    const next = button.dataset.mapStage;
    navigate({stage:next,view:'map',preserveScroll:true});
    root.querySelector(`[data-map-stage="${next}"]`).focus({preventScroll:true});
  });
  root.querySelectorAll('[data-lesson-view]:not([data-stage])').forEach(button=>button.onclick=()=>{
    navigate({view:button.dataset.lessonView,preserveScroll:true});
    root.querySelector('.lesson-views [aria-current="page"]').focus();
  });
  root.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>goToLessonStep(Number(button.dataset.step)));
  root.querySelectorAll('[data-task]').forEach(button=>button.onclick=()=>{
    const index = Number(button.dataset.task);
    const previous=practiceIndex();
    if (mode==='training' && previous!==index) {
      const clock=taskClock(), attempt=timer(), used=Math.min(C.timerView(attempt).used,attempt.durationMs);
      const taskId=D.tasks[previous].id;
      clock.spent[taskId]=taskSpent(clock,taskId,used);
      clock.anchor=used;
      set('task-clock:'+scope(),clock);
    }
    showVariantBrief=false;
    set('task:'+scope(),index);
    render();
    root.querySelector(`.stage-nav [data-task="${index}"]`).focus({preventScroll:true});
  });
  document.getElementById('tour-open').onclick=tour;
  root.querySelectorAll('[data-check]').forEach(input=>input.onchange=()=>{
    set('check:'+scope()+':'+input.dataset.check,input.checked);
    root.querySelector('#training-check-count').textContent=root.querySelectorAll('[data-check]:checked').length+' из '+root.querySelectorAll('[data-check]').length;
  });
  root.querySelectorAll('[data-help]').forEach(button=>button.onclick=()=>{
    set('timer:'+scope(),C.transition(timer(),'assisted'));
    navigate({mode:'learn',stage:button.dataset.help,view:'steps'});
  });
  root.querySelectorAll('[data-timer]').forEach(button=>button.onclick=()=>{
    if (button.dataset.timer==='reset') {
      for (const task of D.tasks) {
        task.checks.forEach((_,i)=>set('check:'+scope()+':'+task.id+':'+i,false));
        set('task-done:'+scope()+':'+task.id,false);
      }
      set('task-clock:'+scope(),null);
      showVariantBrief=false;
      set('timer:'+scope(),C.freshTimer(210*60,mode));
      set('task:'+scope(),0);
    } else {
      if (mode==='training' && button.dataset.timer==='start') enableTimerSound();
      set('timer:'+scope(),C.transition(timer(),button.dataset.timer));
    }
    render();
    const focus=root.querySelector('.pause-screen, .attempt-result') || root.querySelector('[data-timer="start"], [data-timer="pause"], [data-timer="finish"]');
    focus?.focus({preventScroll:true});
  });
  const on = (id,fn,event='onclick') => {
    const element = document.getElementById(id);
    if (element) element[event]=fn;
  };
  on('theme',()=>{
    dark=!dark;
    set('dark',dark);
    render();
    document.getElementById('theme').focus({preventScroll:true});
  });
  bindMaterialReaders(root);
  bindHelpTopics();
  const erHost=document.getElementById('er-workspace');
  if(erHost){
    const erKey=progressKey('er-step');
    ExamErGuide.mount(erHost,{
      stack, pdf:erPdf(), materials:stageMaterials('M1'),
      get:()=>get(erKey,0), set:(_,value)=>set(erKey,value),
      openSource:name=>showMaterial(materialWorkbooks.find(file=>file.name===name))
    });
  }
  on('stack',event=>{
    navigate({stack:event.target.value,preserveScroll:true});
    document.getElementById('stack').focus({preventScroll:true});
  },'onchange');
  on('lesson-steps',showLessonSteps);
  on('done',event=>{
    set(progressKey('done:'+stage),event.target.checked);
    render();
    document.getElementById('done').focus({preventScroll:true});
  },'onchange');
  on('variant',event=>{variant=event.target.value;showVariantBrief=false;render();document.getElementById('variant').focus();},'onchange');
  on('mock-brief',()=>{showVariantBrief=!showVariantBrief;render();document.getElementById('mock-brief').focus();});
  on('timer-sound',event=>{set('timer-sound',event.target.checked);enableTimerSound();},'onchange');
  on('task-complete',event=>{
    set('task-done:'+scope()+':'+D.tasks[practiceIndex()].id,event.target.checked);
    render();
    document.getElementById('task-complete').focus({preventScroll:true});
  },'onchange');
  on('example-launch',exampleInstructions);
  on('example-file',event=>{
    document.getElementById('example-file-description').textContent=describeExampleFile(event.target.value);
  },'onchange');
  on('open-file',()=>fileModal(document.getElementById('example-file').value));
  on('teacher-settings',settings);
  bindImages(root);
}
function tick() {
  const clockNode=document.getElementById('clock');
  if(!clockNode)return;
  const attempt=timer(), view=C.timerView(attempt);
  if(view.expired&&attempt.status!=='finished') {
    if(mode==='training')signalTimer();
    set('timer:'+scope(),C.transition(attempt,'finish'));
    render();
    return;
  }
  clockNode.textContent=C.format(view.left);
  document.getElementById('timer-progress').value=view.progress;
  const status=({idle:'Готов к началу',running:'Идёт отсчёт',paused:'На паузе',finished:view.expired?'Время истекло':'Завершено'})[attempt.status];
  const statusNode=document.getElementById('timer-status');
  if(statusNode.textContent!==status)statusNode.textContent=status;
  if(mode==='training') {
    const task=D.tasks[practiceIndex()], clock=taskClock();
    const left=task.minutes*60000-taskSpent(clock,task.id,Math.min(view.used,attempt.durationMs));
    document.getElementById('task-clock').textContent=left<=0?'Время вышло':C.format(left);
    if(left<=0&&attempt.status==='running'&&!clock.alerted[task.id]) {
      clock.alerted[task.id]=true;
      set('task-clock:'+scope(),clock);
      signalTimer();
    }
  }
}
document.addEventListener('keydown',event=>{
  if (mode!=='learn'||learningView!=='steps'||!['ArrowLeft','ArrowRight'].includes(event.key)
      ||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||document.querySelector('dialog[open]')
      ||event.target.closest?.('input,select,textarea,[contenteditable],a,button:not([data-step]),pre,#er-workspace')) return;
  const next=stepIndex()+(event.key==='ArrowLeft'?-1:1);
  if (next<0||next>current().steps.length) return;
  event.preventDefault();
  goToLessonStep(next);
});
window.addEventListener('popstate',()=>{
  ExamErGuide.closeExpanded();
  ({mode,stage,variant,stack,learningView}=readRoute());
  render();
});
render();setInterval(tick,500);
})();

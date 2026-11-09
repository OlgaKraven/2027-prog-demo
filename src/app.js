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
  const view = query.get('view');
  return {
    mode: requestedMode==='criteria'||modes.some(([id])=>id===requestedMode) ? requestedMode : 'overview',
    stage: D.stages.some(item=>item.id===requestedStage) ? requestedStage : 'documents',
    variant: D.variants.some(item=>item.id===requestedVariant) ? requestedVariant : 'V01',
    learningView: ['map','brief','steps','help'].includes(view) ? view : query.has('module') ? 'steps' : 'map'
  };
}
let {mode,stage,variant,learningView} = readRoute(true);
let dark = get('dark',false);
const btn=(text,attrs='',primary=false)=>`<button class="btn${primary?' primary':''}" ${attrs}>${text}</button>`;
const link=(text,path)=>`<a class="btn" href="${E(path)}" target="_blank" rel="noopener">${E(text)}</a>`;
const current=()=>D.stages.find(s=>s.id===stage),scope=()=>mode+':'+(mode==='mock'?variant:'sample'),timer=()=>C.restoreTimer(JSON.stringify(get('timer:'+scope())),210*60,mode);
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
      <div class="button-row">${btn('Открыть маршрут обучения →','data-mode="learn"',true)}${btn('Материалы задания','id="materials-open"')}</div>
    </div>
    <div class="banner-mascot"><img src="mascot-exam.png" width="680" height="680" alt="Носорог-студент готовится к демоэкзамену"></div>
  </section>${criteria()}`;
}
const shortStages = ['Старт', 'База', 'Каталог', 'Заказ', 'Сдача'];
function stageNavigation(items, active, practice = false) {
  const completed = items.filter(item=>practice ? mode==='training' && practiceDone(item.id) : get('done:'+item.id,false));
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
const sourceWorkbooks = ['Products_import.xlsx','Stock_Items_import.xlsx','Sizes_import.xlsx','Users_import.xlsx','Orders_import.xlsx'];
const preparation = 'Компания «Чудо Обувь» занимается продажей обуви. В четырёх заданиях вы подготовите базу данных, создадите каталог, реализуете оформление заказов и добавите управление заказами для менеджера и администратора.';
const stageOutputs = {
  documents: [['Рабочая папка','для проекта и исходных файлов'], ...sourceWorkbooks.map(name=>[name,'исходная книга Excel'])],
  M1: [['ER-диаграмма.pdf','таблицы, поля, ключи и связи'], ['SQL-скрипт','структура базы и исходные данные']],
  M2: [['Проект Windows Forms','каталог и расчёт скидки'], ['Результаты проверки','цены, доступность размеров и остатки']],
  M3: [['Проект Windows Forms','вход, поиск, карточка и корзина'], ['Контрольный заказ','дата, позиции и обновлённый остаток']],
  M4: [['Исходники','проект и README с функциональностью'], ['Папка Release','исполняемые файлы и ресурсы'], ['SQL и ER PDF','материалы для восстановления и проверки базы']]
};
function stageTiming(id) {
  const task = D.tasks.find(entry=>entry.id===id);
  return task ? task.minutes+' мин' : 'Перед началом';
}
function stageTitle(item) {
  return item.module+(item.id==='documents'?'':' · '+stageTiming(item.id));
}
function resumeView(id) {
  return get('step:'+id)!==null || get('done:'+id,false) ? 'steps' : 'brief';
}
function stageResult(item) {
  return `<strong>Что сохранить</strong><ul class="result-files">${stageOutputs[item.id].map(([name,note])=>
    `<li>${name.includes('.')?`<code>${E(name)}</code>`:E(name)} · ${E(note)}</li>`).join('')}</ul>`;
}
function learningMap() {
  const opened = get('opened-stage','documents');
  return `<section class="map-panel">
    <div class="map-intro"><h1 tabindex="-1">Маршрут обучения</h1><p>Сначала разберите исходные документы. Дальше каждый этап даёт результат для следующего.</p></div>
    <section class="map-stack" aria-labelledby="map-stack-title">
      <strong id="map-stack-title">Стек обучения</strong>
      <div class="map-stack-value">Windows Forms + MySQL / MariaDB<span>Windows · Visual Studio · C# и .NET 10 · DBeaver</span></div>
    </section>
    <div class="learning-map">
      <ol class="map-nodes" aria-label="Этапы обучения">${D.stages.map((item,index)=>{
        const done = get('done:'+item.id,false);
        const current = !done && item.id===opened;
        const status = done?' · Завершён':current?' · Текущий этап':'';
        return `<li><button type="button" class="map-node" data-map-stage="${item.id}" aria-pressed="${item.id===stage}"
          ${current?'aria-current="step"':''} ${done?'data-completed':''}>
          <span class="map-circle" aria-hidden="true">${done?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':index}</span>
          <span><strong>${E(item.title)}</strong><small>${E(stageTitle(item)+status)}</small></span>
        </button></li>`;
      }).join('')}</ol>
      <article class="map-detail" aria-label="Выбранный этап">
        ${D.stages.map(item=>{
          const saved = get('step:'+item.id);
          const task = D.tasks.find(entry=>entry.id===item.id);
          const action = get('done:'+item.id,false) ? 'Открыть этап'
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
function lessonBrief(lesson) {
  const task = D.tasks.find(entry=>entry.id===lesson.id);
  return `<div class="lesson-brief">
    <p>${E(task?.text||preparation)}</p>
    ${lesson.id==='M1'?`<section class="lesson-files"><h3>Приложения и примеры</h3>${materialReader(databaseMaterials())}</section>${stageResult(lesson)}`:task ? stageResult(lesson) : `<section class="lesson-files"><h3>Исходные документы</h3>
      <ul>${sourceWorkbooks.map(name=>`<li><a href="materials/resources/${E(name)}" data-workbook="${E(name)}">${E(name)}</a></li>`).join('')}</ul>
    </section>`}
    <div class="button-row">${lesson.id==='M1'?'':btn('Материалы задания','id="materials-open"')}<a class="btn" href="downloads/original-inputs.zip" download>Приложения · ZIP</a></div>
    ${btn(get('step:'+lesson.id)===null?'Перейти к шагам →':stepIndex(lesson)===lesson.steps.length?'Что сохранить →':'Продолжить с шага '+(stepIndex(lesson)+1)+' →','data-lesson-view="steps"',true)}
  </div>`;
}
const databaseMaterials = () => [
  {name:'Условие КИМ · задание 1', path:D.kim, page:35},
  ...sourceWorkbooks.map(name=>({name,path:'materials/resources/'+name})),
  {name:'Описание предметной области',path:'materials/description.html'},
  {name:'Создание базы в DBeaver',path:'docs/DBeaver.html'},
  {name:'Перечень полей и ключей',path:'docs/Database-fields.html'},
  {name:'Подготовка данных в C#',path:'docs/Import.html'},
  {name:'ER готового примера',path:'materials/ER.pdf'}
];
function materialReader(files) {
  return `<div class="material-reader">
    <label>Материал<select data-material-choice><option value="">Выберите документ</option>${files.map(({name,path,page})=>
      `<option value="${E(path)}" data-page="${page||''}">${E(name)}</option>`).join('')}</select></label>
    <div class="material-preview" data-material-preview aria-live="polite"></div>
  </div>`;
}
function bindMaterialReaders(container) {
  container.querySelectorAll('.material-reader').forEach(reader=>{
    const select=reader.querySelector('[data-material-choice]');
    const preview=reader.querySelector('[data-material-preview]');
    const draw=()=>{
      const path=select.value;
      if(!path){preview.replaceChildren();return;}
      const option=select.selectedOptions[0], name=option.textContent, page=option.dataset.page;
      const workbook=D.workbooks[path.split('/').pop()];
      const source=path+(page?'#page='+page:'');
      const body=workbook? `<p>Первые ${workbook.rows.length} записей из ${workbook.total}.</p>
        <div class="material-table" tabindex="0" aria-label="Данные книги"><table>
        <thead><tr>${workbook.columns.map(column=>`<th scope="col">${E(column)}</th>`).join('')}</tr></thead>
        <tbody>${workbook.rows.map(row=>`<tr>${workbook.columns.map(column=>`<td>${E(row[column]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
        : /\.(html|pdf)$/.test(path)?`<iframe src="${E(source)}" title="${E(name)}" loading="lazy"></iframe>`:'';
      preview.innerHTML=`<div class="material-preview-head"><h4>${E(name)}</h4>
        <a href="${E(path)}" download>Скачать файл</a></div>${body}`;
    };
    select.onchange=draw;
    draw();
  });
}
const lessonScenarios = {
  documents: [
    ['DBeaver запустился, но подключение не проходит','Убедитесь, что сервер MySQL или MariaDB запущен. Сверьте адрес и порт сервера с настройками подключения. DBeaver сам сервер не запускает.'],
    ['В архиве несколько папок и ZIP','Распакуйте и внешний комплект, и вложенный архив приложения. Найдите пять книг *_import.xlsx. Отдельно сохраните исходники и папку своего решения.'],
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
  const database=lesson.id==='M1';
  const scenarios=lessonScenarios[lesson.id].map(([title,answer])=>
    `<details><summary>${E(title)}</summary><p>${E(answer)}</p></details>`).join('');
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
  const reason=`<p class="lesson-reason"><strong>Зачем это нужно.</strong> ${E(s.why)}</p>`;
  const guide=s.guide?(database?`<details class="step-guide"><summary>${E(s.guide.title)}</summary>
    <iframe src="${E(s.guide.path)}" title="${E(s.guide.title)}" loading="lazy"></iframe></details>`:
    `<div class="button-row">${link(s.guide.title,s.guide.path)}</div>`):'';
  return `<section class="lesson-explanation">
    ${database?'':`<h3>Как это понять</h3><p>${E(s.why)}</p>`}
    <h3>${database?'Что сделать':'Что сделать самостоятельно'}</h3>
    <ol>${s.actions.map(a=>`<li>${E(a)}</li>`).join('')}</ol>
    ${s.erStep===undefined?'':btn('Построить ER-схему',`data-step="${s.erStep}"`)}
    ${s.erWorkspace?'<section class="er-workspace" id="er-workspace" aria-label="Построение ER-схемы"></section>':''}
    ${s.code?`<pre tabindex="0">${E(s.code)}</pre>`:''}
    ${s.file?`<details><summary>Полный файл для сверки · ${E(s.file)}</summary><p>Сначала разберите действие и поля. Сверка показывает итоговый файл, включая последующие операции.</p><pre tabindex="0">${E(D.code[s.file]||'')}</pre></details>`:''}
    ${database?shot(s)+guide:guide+shot(s)}
    <div class="step-result"><strong>${database?'Как проверить результат':'Проверьте себя'}</strong><p>${E(s.check)}</p></div>
    ${database?reason:''}</section>`;
}
const lessonResultTitle = 'Что сохранить';
const stepIndex = (lesson=current()) => Math.max(0,Math.min(lesson.steps.length,get('step:'+lesson.id,0)));
function stepArrow(index,previous,label) {
  const path=previous?'M20 12H4m7-7-7 7 7 7':'M4 12h16m-7-7 7 7-7 7';
  return btn(`<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`,
    `data-step="${index}" aria-label="${label}" title="${label}" aria-keyshortcuts="${previous?'ArrowLeft':'ArrowRight'}"`,!previous);
}
function goToLessonStep(index) {
  set('step:'+stage,index);
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
  const done=get('done:'+stage,false), next=D.stages[D.stages.indexOf(lesson)+1];
  return `<div class="lesson-top">
    ${header('Обучение','Чудо Обувь')}
    ${btn('← К маршруту','data-mode="learn" aria-label="К маршруту обучения"')}
  </div>
  <div class="route-layout lesson-layout">
    ${stageNavigation(D.stages,stage)}
    <section class="route-panel lesson-card" aria-labelledby="lesson-title">
      <h2 id="lesson-title" tabindex="-1">${E(lesson.title)}</h2>
      <p class="task-meta">${E(stageTitle(lesson))}</p>
      <nav class="lesson-views" aria-label="Разделы этапа">
        ${[['brief','Условие и файлы'],['steps','Шаги'],['help','Справка']].map(([id,title])=>
          btn(title,`data-lesson-view="${id}" ${id===learningView?'aria-current="page"':''}`)).join('')}
      </nav>
      ${learningView==='brief' ? lessonBrief(lesson) : learningView==='help' ? lessonHelp(lesson) : `
        ${stage==='documents'?`<div class="button-row">${btn('Материалы задания','id="materials-open"')}</div>`:''}
        <article class="study-step" aria-labelledby="lesson-step-title">
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
function practiceMaterials() {
  return `<div class="button-row"><a class="btn" href="downloads/original-inputs.zip" download>Приложения · ZIP</a>
    ${link('КИМ · PDF',D.kim+'#page=35')}</div>`;
}
function trainingSample() {
  modal('Условие КИМ и приложения',`<div class="practice-condition"><p>Краткое описание четырёх заданий «Чудо Обувь». Полные формулировки доступны в КИМ.</p>
    ${D.tasks.map((task,i)=>`<section><h3>Задание ${i+1}. ${E(task.title)}</h3>${conditionParagraphs(task.text)}</section>`).join('')}
    ${practiceMaterials()}</div>`);
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
    <section class="task-support"><h3>Материалы для справки</h3><div class="button-row">
      <a class="btn" href="downloads/exam-30-variants.zip" download>Все 30 вариантов · ZIP</a>
      ${link('Как перенести решение на свой вариант','docs/Visual-Studio.html#section-8')}
      ${link('Официальный КИМ · PDF',D.kim+'#page=35')}
    </div></section>
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
    ${mock?'':`<div class="task-support">${practiceMaterials()}${locked?'':btn('Подсказка к заданию',`data-help="${task.id}"`)}</div>`}
    <section class="self-check training-checklist" aria-labelledby="training-check-title">
      <header><h3 id="training-check-title">Самопроверка</h3><span id="training-check-count" aria-live="polite">${checked.filter(Boolean).length} из ${checked.length}</span></header>
      ${task.checks.map((text,i)=>`<label><input type="checkbox" data-check="${task.id}:${i}" ${locked?'disabled':''} ${checked[i]?'checked':''}>${E(text)}</label>`).join('')}
      ${mock?'<p class="small">Отметки служат для самопроверки.</p>':`<label class="task-complete"><input type="checkbox" id="task-complete" ${locked?'disabled':''} ${practiceDone(task.id)?'checked':''}> Задание выполнено</label>`}
    </section>
  </article>`;
  return `<section class="training-page practice-page training-compact ${mock?'mock-exam':''}">
    <header class="workspace-intro">
      <div><h1>${mock?'Пробный экзамен':'Тренировка'}</h1><p>${mock?'30 учебных вариантов · 4 задания · 75 баллов':'«Чудо Обувь» · официальный образец КИМ'}</p></div>
      ${!mock&&status!=='paused'?btn('Условие КИМ и приложения','id="training-sample" aria-haspopup="dialog"'):''}
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
  'sample.sql':'Создаёт учебную базу и загружает исходные модели, остатки, пользователей и заказы.',
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
  const files=Object.keys(D.code).filter(file=>file.startsWith('examples/')||file.endsWith('.sql'));
  return `<label class="example-file-label">Файл<select id="${id}">${files.map(file=>
    `<option ${file===selected?'selected':''}>${E(file)}</option>`).join('')}</select></label>`;
}
function examples() {
  const selected='examples/WinForms/CatalogForm.cs';
  const shots=['login','examples/WinForms/CatalogForm.cs','examples/WinForms/BasketForm.cs','examples/WinForms/OrdersForm.cs'];
  return `<section class="training-page example-page">
    ${header('Готовый пример','Скачайте рабочий проект «Чудо Обувь» с учебными данными.')}
    <div class="example-grid">
      <article class="route-panel">
        <h2>Windows Forms и MySQL / MariaDB</h2>
        <p>В архиве есть решение Visual Studio, SQL с учебными данными и ER-диаграмма.${D.windowsBuild?' Готовая программа находится в папке Windows.':''}</p>
        <div class="example-actions">
          <a class="btn primary" href="downloads/prog-demo-example.zip" download>Скачать готовый пример · ZIP</a>
          ${btn('Инструкция по запуску','id="example-launch" aria-haspopup="dialog"')}
        </div>
        <div class="example-accounts"><p>Откройте окно «Вход» и введите учебный логин.</p>
          <table aria-label="Учебные записи"><thead><tr><th scope="col">Роль</th><th scope="col">Логин</th></tr></thead>
          <tbody>${exampleAccounts.map(([role,login])=>`<tr><th scope="row">${role}</th><td><code>${login}</code></td></tr>`).join('')}</tbody></table>
        </div>
        <div class="example-actions">${btn('Построить ER-схему','id="er-launch"')}${link('ER · PDF','materials/ER.pdf')}${link('Решения импорта','docs/import-decisions.html')}</div>
      </article>
      <article class="route-panel">
        <h2>Внутри проекта</h2><p>Откройте файл, чтобы прочитать и скопировать код.</p>
        ${exampleFilePicker('example-file',selected)}
        <p id="example-file-description" class="file-description" aria-live="polite">${describeExampleFile(selected)}</p>
        ${btn('Открыть файл','id="open-file"')}
      </article>
    </div>
    <h2 class="example-gallery-heading">Работающая информационная система</h2>
    <p>Рассмотрите вход, каталог, корзину и список заказов на снимках из Windows.</p>
    <div class="screenshot-index">${shots.map(key=>shot({shot:key})).join('')}</div>
  </section>`;
}
function exampleInstructions() {
  modal('Инструкция по запуску',`<div class="example-instructions">${D.launchGuide}</div>`);
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
    ${header('Преподавателю','Разбор официального образца ДЭ 2027 для занятия.')}
    <article class="route-panel">
      <h2>Презентация по демоэкзамену</h2>
      <p>Windows Forms + MySQL / MariaDB. На слайдах — четыре задания «Чудо Обувь», пошаговая демонстрация, код и реальные снимки приложения.</p>
      <p>Заполните данные преподавателя для титульного слайда. В режиме показа слайды открываются в отдельном окне для аудитории, а сценарий остаётся у преподавателя.</p>
      <div class="button-row">${btn('Данные преподавателя','id="teacher-settings"')}
        <a class="btn primary" id="deck-open" href="deck.html">Открыть презентацию</a>
        <a class="btn" href="deck.html?print=1&amp;dialog=1" target="_blank" rel="noopener">Печать / сохранить PDF</a>
      </div>
    </article>
  </section>`;
}
function modal(title,html='',extra=''){const d=document.createElement('dialog');d.className='course-dialog '+extra;d.setAttribute('aria-label',title);d.innerHTML=`<header class="modal-head"><h2>${E(title)}</h2>${btn('Закрыть','data-close')}</header><div class="modal-body">${html}</div>`;document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();return d;}
function materials(initial='') {
  const docs=[...D.originals.map(file=>({...file,page:file.path===D.kim?35:undefined})),
    ...databaseMaterials().filter(file=>file.path!==D.kim),
    {name:'Руководство по стилю',path:'materials/style-guide.html'}];
  const dialog=modal('Материалы задания',`${materialReader(docs)}
    <p><a href="downloads/original-inputs.zip" download>Скачать исходный комплект ZIP</a></p>`);
  if(initial)dialog.querySelector('[data-material-choice]').value='materials/resources/'+initial;
  bindMaterialReaders(dialog);
}
function tour(kind='site'){const steps=kind==='lesson'?['Выберите этап в навигации. Чтобы посмотреть весь путь, вернитесь к карте обучения.','Прочитайте «Как это понять», выполните самостоятельные действия и проверьте результат.','Полный файл для сверки раскрывается отдельно. Не заменяйте разбор простым копированием.','Шаг и отметка самостоятельного выполнения сохраняются в этом браузере.']:['Обучение ведёт от исходных данных к работающей программе.','Тренировка использует официальный образец и позволяет поставить работу на паузу.','Пробный экзамен содержит 30 авторских комплектов с отдельными попытками и непрерывным временем.','В примерах доступны исходный код и ER, преподавателю — показ актуальных учебных шагов.'];let i=0;const d=modal('Гид по курсу','','course-tour');function draw(){d.querySelector('.modal-body').innerHTML=`<p class="section-code">${i+1} / ${steps.length}</p><p>${E(steps[i])}</p><div class="button-row">${btn('Назад',`id="tour-prev" ${i===0?'disabled':''}`)}${btn(i===steps.length-1?'Готово':'Далее','id="tour-next"',true)}</div>`;d.querySelector('#tour-prev').onclick=()=>{i--;draw();};d.querySelector('#tour-next').onclick=()=>{if(i===steps.length-1)d.close();else{i++;draw();}};}draw();}
function er(workspace) {
  const embedded=Boolean(workspace);
  const dialog=embedded?null:modal('Построение ER-схемы','<section class="er-workspace" aria-label="Построение ER-схемы"></section>');
  const host=workspace||dialog.querySelector('.er-workspace');
  const {tables,links}=D.er;
  const parts=[{label:'Исходные книги'},...tables.flatMap(table=>[
    {table,label:table.id},
    ...table.fields.map(field=>({table,field,label:table.id+'.'+field.id}))
  ])];
  let index=embedded?Math.max(0,Math.min(parts.length-1,get('er-step',0))):0;
  let full=false, selected=null, expanded=null, zoom=1, fit=false;
  function draw(focusId) {
    const previous=host.querySelector('.er-live-diagram');
    const scroll=[previous?.scrollLeft||0,previous?.scrollTop||0];
    const item=selected||parts[index], {table,field}=item;
    const visible=full?parts:parts.slice(0,index+1);
    const visibleTables=tables.filter(candidate=>visible.some(part=>part.table===candidate));
    const edge=field&&links.find(link=>link.source===table.id&&link.field===field.id);
    const origin=field?.origin||table?.origin;
    const source=origin?.match(/[^\s→]+\.xlsx/)?.[0];
    host.innerHTML=`<header class="er-workspace-heading"><h3>Схема и пояснения</h3>
      ${embedded?btn(expanded?'Вернуться к шагу':'На весь экран','id="er-expand"'):''}</header>
      <div class="er-controls" role="group" aria-label="Вид схемы">
        ${btn('Поэтапное построение',`id="er-steps" aria-pressed="${!full}"`)}
        ${btn('Готовая схема',`id="er-full" aria-pressed="${full}"`)}
        ${btn('Как читать схему','id="er-help" aria-expanded="false" aria-controls="er-reading"')}
        <a href="materials/ER.pdf" download>Скачать ER · PDF</a>
      </div>
      <p id="er-reading" hidden>PK определяет строку, FK ссылается на ключ другой таблицы. Стрелка ведёт от FK к PK. Например, несколько складских позиций ссылаются на одну модель.</p>
      ${full?'':`<div class="er-step-controls">
        <label>Этап построения<select id="er-jump">${parts.map((part,i)=>`<option value="${i}" ${i===index?'selected':''}>${i+1}. ${E(part.label)}</option>`).join('')}</select></label>
        <div class="er-step-buttons">${btn('←',`id="er-prev" aria-label="Предыдущий этап схемы" ${index===0?'disabled':''}`)}
          <span aria-live="polite">${index+1} из ${parts.length}</span>
          ${btn('→',`id="er-next" aria-label="Следующий этап схемы" ${index===parts.length-1?'disabled':''}`,true)}</div>
      </div>`}
      ${visibleTables.length?`<div class="er-zoom-controls" role="group" aria-label="Масштаб схемы">
        ${btn('−','id="er-smaller" aria-label="Уменьшить схему"')}
        ${btn('100%','id="er-scale" aria-label="Вернуть масштаб 100 процентов"')}
        ${btn('+','id="er-larger" aria-label="Увеличить схему"')}
        ${btn('По ширине','id="er-fit"')}
        ${btn('К элементу',`id="er-focus" ${table?'':'disabled'}`)}
      </div>`:''}
      <div class="er-grid">
        ${visibleTables.length?`<div class="er-diagram er-live-diagram" tabindex="0" aria-label="Диаграмма с прокруткой">${D.erSvg}</div>`
          :'<div class="er-empty">Нажмите стрелку вправо или выберите этап, чтобы добавить первую таблицу.</div>'}
        <aside class="er-origin" aria-live="polite">
          ${table?`<h4>${E(item.label)}</h4><p>${E(origin||'')}</p>
            ${field?`<p>Тип <code>${E(field.type)}</code>${field.pk?' · PK':field.fk?' · FK':''}</p>`:''}
            ${edge?`<p><code>${E(edge.source+'.'+edge.field)} → ${E(edge.target+'.'+edge.key)}</code> · ${E(edge.cardinality)}</p>`:''}
            ${source?btn('Открыть '+E(source),'id="er-source"'):''}`
          :'<h4>Исходные книги</h4><p>Выберите таблицу или поле. Справа появится источник и объяснение связи.</p>'}
        </aside>
      </div>`;
    const byId=id=>host.querySelector('#'+id);
    const on=(id,fn)=>{const node=byId(id);if(node)node.onclick=fn;};
    const move=(next,id)=>{
      index=next;selected=null;
      if(embedded)set('er-step',index);
      draw(id);
    };
    on('er-next',()=>move(index+1,'er-next'));
    on('er-prev',()=>move(index-1,'er-prev'));
    if(byId('er-jump'))byId('er-jump').onchange=event=>move(Number(event.target.value),'er-jump');
    on('er-full',()=>{full=true;selected=null;zoom=1;fit=false;draw('er-full');});
    on('er-steps',()=>{full=false;selected=null;zoom=1;fit=false;draw('er-steps');});
    on('er-help',()=>{
      const hint=byId('er-reading');
      hint.hidden=!hint.hidden;
      byId('er-help').setAttribute('aria-expanded',String(!hint.hidden));
    });
    on('er-source',()=>materials(source));
    on('er-expand',()=>{
      if(expanded){expanded.close();return;}
      const anchor=document.createComment('ER workspace');
      host.before(anchor);
      expanded=document.createElement('dialog');
      expanded.className='course-dialog er-expanded';
      expanded.setAttribute('aria-label','Построение ER-схемы');
      expanded.append(host);document.body.append(expanded);
      expanded.addEventListener('close',()=>{
        anchor.replaceWith(host);expanded.remove();expanded=null;draw('er-expand');
      },{once:true});
      expanded.showModal();draw('er-expand');
    });
    const diagram=host.querySelector('.er-diagram svg');
    if(diagram) {
      const visibleFields=new Set(visible.filter(part=>part.field).map(part=>part.label));
      diagram.querySelectorAll('polyline').forEach((line,i)=>{
        const wire=links[i];
        if(!visibleFields.has(wire.source+'.'+wire.field)||!visibleFields.has(wire.target+'.'+wire.key))line.remove();
      });
      const selectPart=(node,part)=>{
        node.setAttribute('role','button');node.setAttribute('tabindex','0');
        node.setAttribute('aria-label',part.label);
        if(part.label===item.label)node.setAttribute('aria-pressed','true');
        node.id='er-select-'+part.label.replace('.','-');
        node.onclick=()=>{selected=part;draw(node.id);};
        node.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();node.onclick();}};
      };
      diagram.querySelectorAll('svg > g > g').forEach((group,i)=>{
        const candidate=tables[i];
        if(!visibleTables.includes(candidate)){group.remove();return;}
        const rows=group.querySelectorAll('text');
        selectPart(rows[0],parts.find(part=>part.table===candidate&&!part.field));
        candidate.fields.forEach((row,j)=>{
          const name=candidate.id+'.'+row.id;
          if(visibleFields.has(name))selectPart(rows[j+1],parts.find(part=>part.label===name));
          else rows[j+1].remove();
        });
      });
      const box=diagram.parentElement;
      const width=full?1680:Math.max(...visibleTables.map(candidate=>candidate.x+candidate.width))+25;
      if(!full){
        const height=Math.max(...visibleTables.map(candidate=>candidate.y+60+25*candidate.fields.length))+25;
        diagram.setAttribute('viewBox',`0 0 ${width} ${height}`);
      }
      const baseWidth=Math.min(width,1250);
      const focusElement=()=>{
        const selectedNode=diagram.querySelector('[aria-pressed="true"]');
        if(!selectedNode)return;
        const bounds=selectedNode.getBoundingClientRect(), viewport=box.getBoundingClientRect();
        box.scrollBy(bounds.left+bounds.width/2-viewport.left-viewport.width/2,
          bounds.top+bounds.height/2-viewport.top-viewport.height/2);
      };
      const scale=()=>{
        diagram.style.minWidth='0';
        diagram.style.width=fit?'100%':(baseWidth*zoom)+'px';
        byId('er-scale').textContent=(fit?Math.round(box.clientWidth/baseWidth*100):Math.round(zoom*100))+'%';
      };
      scale();
      box.scrollTo(...scroll);
      if(['er-jump','er-next','er-prev'].includes(focusId))focusElement();
      on('er-focus',focusElement);
      on('er-smaller',()=>{fit=false;zoom=Math.max(.4,zoom-.15);scale();});
      on('er-larger',()=>{fit=false;zoom=Math.min(2,zoom+.15);scale();});
      on('er-scale',()=>{fit=false;zoom=1;scale();});
      on('er-fit',()=>{fit=true;scale();box.scrollTo(0,0);});
    }
    const target=focusId&&byId(focusId);
    if(target)(target.disabled?byId('er-jump'):target)?.focus({preventScroll:true});
  }
  draw();
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
  set('mode',mode);set('stage',stage);set('variant',variant);
  document.body.classList.toggle('dark',dark);
  const url = new URLSearchParams({mode,module:stage,variant});
  if (mode==='learn') {
    url.set('view',learningView);
    if (learningView!=='map') set('opened-stage',stage);
    if (learningView==='steps' && get('step:'+stage)===null) set('step:'+stage,0);
  }
  history.replaceState(null,'','?'+url);
  const views = {overview,learn,training:practice,mock:practice,examples,criteria,teacher};
  root.innerHTML = `<div class="shell">
    <header class="top">
      <a class="brand" href="?mode=overview"><span class="brand-emblem">ДЭ</span><span><strong>09.02.07 · Информационные системы и программирование</strong><small>Программист · 2027</small></span></a>
      <div class="top-tools">
        ${iconButton(dark?'Включить светлую тему':'Включить тёмную тему',dark?toolIcons.sun:toolIcons.moon,'id="theme"')}
        ${iconButton('Тур по сайту',toolIcons.tour,'data-guide="site" aria-haspopup="dialog"')}
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
  root.querySelectorAll('[data-guide]').forEach(button=>button.onclick=()=>tour(button.dataset.guide));
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
  on('materials-open',()=>materials());
  root.querySelectorAll('[data-workbook]').forEach(link=>link.onclick=event=>{
    event.preventDefault();
    materials(link.dataset.workbook);
  });
  bindMaterialReaders(root);
  bindHelpTopics();
  const erHost=document.getElementById('er-workspace');
  if(erHost)er(erHost);
  on('lesson-steps',showLessonSteps);
  on('done',event=>{
    set('done:'+stage,event.target.checked);
    render();
    document.getElementById('done').focus({preventScroll:true});
  },'onchange');
  on('variant',event=>{variant=event.target.value;showVariantBrief=false;render();document.getElementById('variant').focus();},'onchange');
  on('training-sample',trainingSample);
  on('mock-brief',()=>{showVariantBrief=!showVariantBrief;render();document.getElementById('mock-brief').focus();});
  on('timer-sound',event=>{set('timer-sound',event.target.checked);enableTimerSound();},'onchange');
  on('task-complete',event=>{
    set('task-done:'+scope()+':'+D.tasks[practiceIndex()].id,event.target.checked);
    render();
    document.getElementById('task-complete').focus({preventScroll:true});
  },'onchange');
  on('er-launch',()=>er());
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
      ||event.target.closest?.('input,select,textarea,[contenteditable],a,button:not([data-step]),pre')) return;
  const next=stepIndex()+(event.key==='ArrowLeft'?-1:1);
  if (next<0||next>current().steps.length) return;
  event.preventDefault();
  goToLessonStep(next);
});
window.addEventListener('popstate',()=>{
  ({mode,stage,variant,learningView}=readRoute());
  render();
});
render();setInterval(tick,500);
})();

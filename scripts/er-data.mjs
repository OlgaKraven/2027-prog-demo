import {buildErLayout} from './er-layout.mjs';

const tableTitles = {
  roles:'Роли', users:'Пользователи', categories:'Категории', subcategories:'Подкатегории',
  manufacturers:'Производители', products:'Модели обуви', sizes:'Размеры',
  stock_items:'Размерные остатки', orders:'Заказы', order_items:'Строки заказа'
};
const fieldTitles = {
  id:'Идентификатор', name:'Название', login:'Логин', last_name:'Фамилия',
  first_name:'Имя', patronymic:'Отчество', role_id:'Роль', category_id:'Категория',
  subcategory_id:'Подкатегория', manufacturer_id:'Производитель', image:'Фотография',
  composition:'Состав', description:'Описание', price:'Базовая цена', label:'Размер',
  sort_value:'Число для сортировки', product_id:'Модель', size_id:'Размер', available:'Доступно пар',
  order_date:'Дата заказа', user_id:'Покупатель', created_by:'Автор заказа',
  request_id:'Идентификатор запроса', stock_accounted:'Остаток был списан', order_id:'Заказ',
  stock_id:'Размерная позиция', quantity:'Количество пар', unit_price:'Цена за пару'
};

export async function buildErData(schema) {
  const links = schema.links.map(({source,field,target,key,cardinality}) => ({
    from:source,field,to:target,target:key,cardinality
  }));
  const mysql = {links, tables:schema.tables.map(table => ({
    ...table, title:tableTitles[table.id], why:table.meaning,
    fields:table.fields.map(field => ({
      ...field, title:fieldTitles[field.id], why:field.meaning, location:field.origin,
      file:field.origin.match(/^(.+?\.xlsx)/)?.[1]
    }))
  }))};
  const postgres = {links, tables:mysql.tables.map(table => ({
    ...table, fields:table.fields.map(field => ({
      ...field,
      type:field.type.replace(/^DATETIME$/, 'TIMESTAMP WITHOUT TIME ZONE')
        .replace(/^CHAR\(36\)$/, 'VARCHAR(36)').replace(/^DECIMAL/, 'NUMERIC'),
      ...(field.id === 'stock_accounted' ? {
        default:'true',
        why:'Импортированная история получает false, поскольку исходный остаток уже дан. Новый заказ получает true. Возврат остатка выполняется только для true.'
      } : {})
    }))
  }))};
  return {order:mysql.tables.map(table=>table.id), stacks:{mysql,postgresql:postgres}, layout:await buildErLayout(mysql)};
}

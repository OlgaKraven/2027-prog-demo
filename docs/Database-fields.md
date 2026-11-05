# Свойства полей для конструктора БД

Задайте эти значения в редакторе Columns. NULL=NO означает Not Null; PK — первичный ключ, FK — внешний ключ. SQL для сдачи получают экспортом созданной базы. Эти 41 поле и ограничения созданы в DBeaver 26.2.3 и сверены с MariaDB 10.4.32. [Пошаговая настройка и снимки](DBeaver.md). Импорт и восстановление экспорта проверяются отдельно.

## roles

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| name | VARCHAR(80) | NO |  |

## users

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| login | VARCHAR(100) | NO |  |
| last_name | VARCHAR(100) | NO |  |
| first_name | VARCHAR(100) | NO |  |
| patronymic | VARCHAR(100) | NO |  |
| role_id | INT | NO | FK: roles.id |

## categories

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| name | VARCHAR(100) | NO |  |

## subcategories

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| category_id | INT | NO | FK: categories.id |
| name | VARCHAR(100) | NO |  |

## manufacturers

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| name | VARCHAR(150) | NO |  |

## products

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| subcategory_id | INT | NO | FK: subcategories.id |
| manufacturer_id | INT | NO | FK: manufacturers.id |
| name | VARCHAR(250) | NO |  |
| image | VARCHAR(250) | NO |  |
| composition | TEXT | NO |  |
| description | TEXT | NO |  |
| price | DECIMAL(12,2) | NO |  |

## sizes

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| label | VARCHAR(10) | NO |  |
| sort_value | DECIMAL(5,1) | NO |  |

## stock_items

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| product_id | INT | NO | FK: products.id |
| size_id | INT | NO | FK: sizes.id |
| available | INT | NO |  |

## orders

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| order_date | DATETIME | NO |  |
| user_id | INT | NO | FK: users.id |
| created_by | INT | NO | FK: users.id |
| request_id | CHAR(36) | YES |  |
| stock_accounted | BOOLEAN | NO |  |

## order_items

| Field | Data Type | NULL | Key |
| --- | --- | --- | --- |
| id | INT | NO | PK |
| order_id | INT | NO | FK: orders.id |
| stock_id | INT | NO | FK: stock_items.id |
| quantity | INT | NO |  |
| unit_price | DECIMAL(12,2) | NO |  |

## Дополнительные свойства

- Auto Increment включён у `orders.id` и `order_items.id`; остальные ID импортируются явно.
- У `users.login`: Charset `utf8mb4`, Collation `utf8mb4_bin`, чтобы регистр логина имел значение.
- У `orders.stock_accounted`: Default `1`. Для импортированной истории записывается `0`, чтобы не списывать остатки повторно.
- Уникальны `roles.name`, `users.login`, `categories.name`, `manufacturers.name`, `sizes.label` и `orders.request_id`.
- Составные UNIQUE: `subcategories(category_id,name)`, `products(name,manufacturer_id)`, `stock_items(product_id,size_id)`, `order_items(order_id,stock_id)`.
- CHECK: `products.price>=0`, `stock_items.available>=0`, `order_items.quantity>0`, `order_items.unit_price>=0`.
- У связи `order_items.order_id → orders.id` задайте On Delete CASCADE. Остальные связи используют запрет удаления связанных родительских записей.
- Создайте индекс `orders_order_date_IDX` по `orders.order_date`.

Для составного UNIQUE выбирайте несколько полей одного ограничения в Constraints. Два отдельных уникальных поля не заменяют уникальность их сочетания.

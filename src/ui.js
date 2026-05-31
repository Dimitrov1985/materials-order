'use strict';

const { REGION_NAMES } = require('./regions');

const LINE_WIDTH = 62;

function hr(char = '─') {
  console.log(char.repeat(LINE_WIDTH));
}

function fmt(price) {
  return price.toLocaleString('ru-RU') + ' ₽';
}

function printBanner() {
  console.log();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         ЗАЯВКА НА СТРОИТЕЛЬНЫЕ МАТЕРИАЛЫ                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

/** Выводит каталог, сгруппированный по категориям, с ценами для региона.
 *  Возвращает плоский массив товаров в порядке отображения (для нумерации). */
function printCatalog(catalog, region) {
  console.log();
  console.log(`  Каталог — ${REGION_NAMES[region]}`);
  console.log();

  const categories = [...new Set(catalog.map(p => p.category))];
  const indexed = [];

  categories.forEach(cat => {
    const items = catalog.filter(p => p.category === cat);
    const bar = '─'.repeat(Math.max(0, 40 - cat.length));
    console.log(`  ┌─ ${cat} ${bar}───────────────────┐`);
    items.forEach(p => {
      const num = String(indexed.length + 1).padStart(2);
      const name = p.name.padEnd(42);
      const price = fmt(p.prices[region]).padStart(10);
      console.log(`  │ ${num}. ${name} ${price} / ${p.unit}`);
      indexed.push(p);
    });
    console.log('  └' + '─'.repeat(LINE_WIDTH) + '┘');
    console.log();
  });

  return indexed;
}

/** Выводит карточку заказа и возвращает итоговую сумму. */
function printOrder(product, region, qty, unitPrice, label = '') {
  const total = unitPrice * qty;
  hr();
  if (label) console.log(`  ${label}`);
  console.log(`  Товар  : ${product.name}`);
  console.log(`  Регион : ${REGION_NAMES[region]}`);
  console.log(`  Кол-во : ${qty} ${product.unit}`);
  console.log(`  Цена   : ${fmt(unitPrice)} / ${product.unit}`);
  console.log(`  ИТОГО  : ${fmt(total)}`);
  hr();
  return total;
}

module.exports = { hr, fmt, printBanner, printCatalog, printOrder };

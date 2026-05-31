'use strict';

const { fmt, printOrder } = require('./ui');
const { confirm } = require('./input');
const { saveOrder } = require('./order');

const DISCOUNT = 0.05; // 5 %

/**
 * Запускает логику удержания клиента.
 * Если текущий товар — самый дешёвый в категории, предлагает скидку 5 %.
 * Иначе предлагает более дешёвый аналог в той же категории.
 * Возвращает true, если клиент принял предложение (заявка сохранена).
 */
async function runRetention({ catalog, product, region, qty }) {
  const sameCategory = catalog.filter(p => p.category === product.category);
  const cheapest = sameCategory.reduce((min, p) =>
    p.prices[region] < min.prices[region] ? p : min
  );

  let offered;
  let offeredPrice;
  let note;

  if (cheapest.id === product.id) {
    // Товар уже самый дешёвый → скидка
    offered = product;
    offeredPrice = Math.round(product.prices[region] * (1 - DISCOUNT));
    note = `Скидка ${DISCOUNT * 100}% (удержание клиента)`;

    console.log();
    console.log(`  Выбранный товар уже самый выгодный в категории «${product.category}»!`);
    console.log(`  Специально для вас — персональная скидка ${DISCOUNT * 100} %:`);
    printOrder(offered, region, qty, offeredPrice, '>>> СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ — скидка 5 %');
  } else {
    // Есть более дешёвый аналог
    offered = cheapest;
    offeredPrice = cheapest.prices[region];
    note = `Альтернатива вместо "${product.name}"`;

    const saving = (product.prices[region] - offeredPrice) * qty;
    console.log();
    console.log(`  В категории «${product.category}» есть более выгодный вариант.`);
    console.log(`  Экономия на всём объёме: ${fmt(saving)}`);
    printOrder(offered, region, qty, offeredPrice, '>>> АЛЬТЕРНАТИВНОЕ ПРЕДЛОЖЕНИЕ');
  }

  const accepted = await confirm('  Принимаете предложение? (y/n): ');

  if (accepted) {
    const filepath = saveOrder({ product: offered, region, qty, unitPrice: offeredPrice, note });
    console.log();
    console.log('  Заявка оформлена!');
    console.log(`  Файл сохранён: ${filepath}`);
  }

  return accepted;
}

module.exports = { runRetention };

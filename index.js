'use strict';

const catalog = require('./catalog');
const { printBanner, printOrder } = require('./src/ui');
const { close, selectRegion, selectProduct, selectQty, confirm } = require('./src/input');
const { saveOrder } = require('./src/order');
const { runRetention } = require('./src/retention');

async function main() {
  printBanner();

  const region = await selectRegion();
  const product = await selectProduct(catalog, region);
  const qty = await selectQty(product);

  console.log();
  console.log('  Ваш заказ:');
  const unitPrice = product.prices[region];
  printOrder(product, region, qty, unitPrice);

  const confirmed = await confirm('  Оформляем заявку? (y/n): ');

  if (confirmed) {
    const filepath = saveOrder({ product, region, qty, unitPrice });
    console.log();
    console.log('  Заявка успешно оформлена!');
    console.log(`  Файл сохранён: ${filepath}`);
  } else {
    const retained = await runRetention({ catalog, product, region, qty });
    if (!retained) {
      console.log();
      console.log('  Жаль, что не сложилось. Будем рады видеть вас снова!');
    }
  }
}

main()
  .catch(err => {
    if (err.code !== 'ERR_USE_AFTER_CLOSE') {
      console.error('\nОшибка:', err.message);
    }
  })
  .finally(() => {
    console.log();
    close();
  });

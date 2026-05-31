'use strict';

const fs = require('fs');
const path = require('path');
const { REGION_NAMES } = require('./regions');

/**
 * Сохраняет заявку в JSON-файл рядом с index.js.
 * Возвращает путь к созданному файлу.
 */
function saveOrder({ product, region, qty, unitPrice, note = '' }) {
  const total = unitPrice * qty;

  const order = {
    createdAt: new Date().toISOString(),
    region,
    regionName: REGION_NAMES[region],
    product: {
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
    },
    quantity: qty,
    unitPrice,
    total,
    note,
  };

  const filename = `order_${Date.now()}.json`;
  const filepath = path.resolve(__dirname, '..', filename);
  fs.writeFileSync(filepath, JSON.stringify(order, null, 2), 'utf8');
  return filepath;
}

module.exports = { saveOrder };

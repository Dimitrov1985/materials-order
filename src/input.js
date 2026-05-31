'use strict';

const readline = require('readline');
const { REGIONS, REGION_NAMES } = require('./regions');
const { printCatalog } = require('./ui');

// ─── Readline с очередью ──────────────────────────────────────────────────────
// rl.question() ломается при piped stdin (EOF закрывает интерфейс раньше времени).
// Вместо этого слушаем 'line'-события и храним строки в очереди.

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const lineQueue = [];   // буфер полученных строк
const waitQueue = [];   // буфер ожидающих resolve

rl.on('line', line => {
  if (waitQueue.length > 0) {
    waitQueue.shift()(line);
  } else {
    lineQueue.push(line);
  }
});

rl.on('close', () => {
  // При EOF разбудим всех ожидающих пустой строкой
  while (waitQueue.length > 0) {
    waitQueue.shift()('');
  }
});

/** Выводит prompt и возвращает следующую строку от пользователя. */
function ask(prompt) {
  process.stdout.write(prompt);
  return new Promise(resolve => {
    if (lineQueue.length > 0) {
      resolve(lineQueue.shift());
    } else {
      waitQueue.push(resolve);
    }
  });
}

/** Закрывает readline-интерфейс. */
function close() {
  rl.close();
}

// ─── Шаги выбора ─────────────────────────────────────────────────────────────

async function selectRegion() {
  console.log();
  console.log('Выберите регион доставки:');
  console.log();
  REGIONS.forEach((r, i) => {
    console.log(`  ${i + 1}.  ${REGION_NAMES[r]}  (${r})`);
  });
  console.log();

  for (;;) {
    const raw = (await ask('  Ваш выбор: ')).trim();
    const idx = parseInt(raw, 10) - 1;
    if (Number.isInteger(idx) && idx >= 0 && idx < REGIONS.length) {
      return REGIONS[idx];
    }
    console.log(`  ! Введите номер от 1 до ${REGIONS.length}`);
  }
}

async function selectProduct(catalog, region) {
  const indexed = printCatalog(catalog, region);

  for (;;) {
    const raw = (await ask('  Выберите товар (номер): ')).trim();
    const idx = parseInt(raw, 10) - 1;
    if (Number.isInteger(idx) && idx >= 0 && idx < indexed.length) {
      return indexed[idx];
    }
    console.log(`  ! Введите номер от 1 до ${indexed.length}`);
  }
}

async function selectQty(product) {
  for (;;) {
    const raw = (await ask(`  Количество (${product.unit}): `)).trim();
    const qty = parseInt(raw, 10);
    if (Number.isInteger(qty) && qty > 0) return qty;
    console.log('  ! Введите целое положительное число');
  }
}

async function confirm(prompt) {
  for (;;) {
    const raw = (await ask(prompt)).trim().toLowerCase();
    if (raw === 'y') return true;
    if (raw === 'n') return false;
    console.log('  ! Введите y или n');
  }
}

module.exports = { ask, close, selectRegion, selectProduct, selectQty, confirm };

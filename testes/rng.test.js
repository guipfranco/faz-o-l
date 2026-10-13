const test = require('node:test');
const assert = require('node:assert/strict');
const rng = require('../src/logica/rng');

test('mesma seed gera a mesma sequencia', () => {
  const a = rng.criar(42), b = rng.criar(42);
  const sa = Array.from({ length: 5 }, () => rng.proximo(a));
  const sb = Array.from({ length: 5 }, () => rng.proximo(b));
  assert.deepEqual(sa, sb);
  sa.forEach((x) => assert.ok(x >= 0 && x < 1));
});

test('seeds diferentes divergem', () => {
  assert.notEqual(rng.proximo(rng.criar(1)), rng.proximo(rng.criar(2)));
});

test('inteiro respeita o intervalo', () => {
  const r = rng.criar(7);
  for (let i = 0; i < 200; i++) { const v = rng.inteiro(r, 3, 6); assert.ok(v >= 3 && v < 6 && Number.isInteger(v)); }
});

test('escolher e embaralhar', () => {
  const r = rng.criar(9);
  const lista = [1, 2, 3, 4, 5];
  assert.ok(lista.includes(rng.escolher(r, lista)));
  const emb = rng.embaralhar(r, lista);
  assert.deepEqual([...emb].sort(), lista);
  assert.deepEqual(lista, [1, 2, 3, 4, 5], 'nao altera a original');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const estados = require('../dados/estados');
const mapa = require('../dados/mapaBr');

test('mapa tem os 27 estados com paths fechados e centros dentro da viewBox', () => {
  const [, , w, h] = mapa.viewBox.split(' ').map(Number);
  assert.ok(w > 100 && h > 100);
  for (const e of estados.lista) {
    const d = mapa.estados[e.sigla];
    assert.ok(d, 'falta ' + e.sigla);
    assert.match(d, /^M[\d.\s,L]+Z/);
    assert.ok(d.trim().endsWith('Z'));
    const [cx, cy] = mapa.centros[e.sigla];
    assert.ok(cx >= 0 && cx <= w && cy >= 0 && cy <= h, 'centro fora ' + e.sigla);
  }
  assert.equal(Object.keys(mapa.estados).length, 27);
});

test('mapaBr.js fica abaixo de 200 KB', () => {
  const tam = fs.statSync(path.join(__dirname, '..', 'dados', 'mapaBr.js')).size;
  assert.ok(tam < 200 * 1024, 'tamanho: ' + tam);
});

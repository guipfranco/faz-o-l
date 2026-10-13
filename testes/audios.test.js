const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const frases = require('../dados/frases');

test('LEIA-ME lista todos os ids de frases e todo mp3 da pasta vem de uma frase', () => {
  const dir = path.join(__dirname, '..', 'audios');
  const leiame = fs.readFileSync(path.join(dir, 'LEIA-ME.txt'), 'utf8');
  for (const f of frases.lista) assert.ok(leiame.includes(f.id + '.mp3'), 'falta ' + f.id);
  const ids = new Set(frases.lista.map((f) => f.id));
  for (const n of fs.readdirSync(dir).filter((x) => /\.mp3$/i.test(x))) {
    assert.ok(ids.has(n.replace(/\.mp3$/i, '')), 'mp3 sem frase: ' + n);
  }
});

test('clipes do Medo e Delírio têm id no formato do acervo e não se repetem', () => {
  const vistos = new Set();
  for (const f of frases.lista.filter((x) => x.medoDelirio)) {
    assert.match(f.medoDelirio, /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/, f.id);
    assert.ok(!vistos.has(f.medoDelirio), 'clipe repetido em ' + f.id); vistos.add(f.medoDelirio);
  }
});

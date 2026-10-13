const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const frases = require('../dados/frases');

test('LEIA-ME lista todos os ids de frases e a pasta nao tem mp3 embutido', () => {
  const dir = path.join(__dirname, '..', 'audios');
  const leiame = fs.readFileSync(path.join(dir, 'LEIA-ME.txt'), 'utf8');
  for (const f of frases.lista) assert.ok(leiame.includes(f.id + '.mp3'), 'falta ' + f.id);
  const mp3s = fs.readdirSync(dir).filter((n) => /\.mp3$/i.test(n));
  assert.deepEqual(mp3s, [], 'o repositorio nao deve embutir audios');
});

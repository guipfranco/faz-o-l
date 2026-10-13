const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const arte = require('../arte/gerar');

const RAIZ = path.join(__dirname, '..', 'arte');
const ESPERADOS = [
  ...['lula', 'alckmin', 'marina', 'boulos', 'dilma'].map((n) => 'pecas/' + n + '.svg'),
  ...['bolsonaro', 'flavio', 'damares', 'pazuello', 'salles', 'fakenews'].map((n) => 'obstaculos/' + n + '.svg'),
  'mao-L.svg',
];

test('gerar cria todos os SVGs com largura e altura', () => {
  arte.gerar(RAIZ);
  for (const rel of ESPERADOS) {
    const p = path.join(RAIZ, rel);
    assert.ok(fs.existsSync(p), 'falta ' + rel);
    const s = fs.readFileSync(p, 'utf8');
    assert.ok(s.startsWith('<svg'), rel);
    assert.ok(s.trim().endsWith('</svg>'), rel);
    assert.match(s, /width="(128|256)"/, rel);
    assert.match(s, /height="(128|256)"/, rel);
    assert.ok(!s.includes('undefined'), 'undefined em ' + rel);
  }
  assert.equal(Object.keys(arte.CORES).length, 5);
});

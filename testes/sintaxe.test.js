const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const ARQUIVOS = ['src/namespace.js', 'src/mapa.js', 'src/main.js', 'src/cenas/CenaTabuleiro.js', 'src/cenas/CenaFimDeFase.js',
  'dados/estados.js', 'dados/frases.js', 'dados/fases.js', 'dados/mapaBr.js'];

for (const rel of ARQUIVOS) {
  test('compila: ' + rel, () => {
    const p = path.join(RAIZ, rel);
    if (!fs.existsSync(p)) { assert.fail('arquivo ausente: ' + rel); }
    const fonte = fs.readFileSync(p, 'utf8');
    assert.ok(!/\u2014|\u2013/.test(fonte), 'travessao em ' + rel);
    assert.doesNotThrow(() => new Function(fonte), rel);
  });
}

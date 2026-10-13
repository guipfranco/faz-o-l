const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('phaser embutido tem tamanho plausivel', () => {
  const tam = fs.statSync(path.join(__dirname, '..', 'lib', 'phaser.min.js')).size;
  assert.ok(tam > 1_000_000, 'phaser.min.js menor que 1 MB: ' + tam);
});

test('namespace.js cria FazOL com os grupos', () => {
  const fonte = fs.readFileSync(path.join(__dirname, '..', 'src', 'namespace.js'), 'utf8');
  const sandbox = {};
  new Function('window', fonte)(sandbox);
  assert.deepEqual(Object.keys(sandbox.FazOL).sort(), ['dados', 'logica', 'ui']);
});

test('index.html carrega os scripts na ordem certa e sem modulos ES', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(!/type="module"/.test(html), 'nao pode usar type=module (file://)');
  const ordem = ['lib/phaser.min.js', 'src/namespace.js', 'dados/', 'src/logica/rng.js', 'src/logica/matches.js',
    'src/logica/tabuleiro.js', 'src/logica/especiais.js', 'src/logica/obstaculos.js', 'src/logica/pontuacao.js',
    'src/logica/turno.js', 'src/logica/geradorFases.js', 'src/progresso.js', 'src/voz.js', 'src/mapa.js',
    'src/cenas/CenaTabuleiro.js', 'src/cenas/CenaFimDeFase.js', 'src/main.js'];
  let pos = -1;
  for (const trecho of ordem) {
    const i = html.indexOf(trecho, pos + 1);
    assert.ok(i > pos, 'script fora de ordem ou ausente: ' + trecho);
    pos = i;
  }
});

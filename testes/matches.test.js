const test = require('node:test');
const assert = require('node:assert/strict');
const matches = require('../src/logica/matches');
const { grade } = require('./apoio');

test('sem grupos em grade sem três iguais', () => {
  assert.deepEqual(matches.encontrarGrupos(grade(['LAM', 'AML', 'MLA'])), []);
});

test('linha de 3 horizontal e de 4 vertical', () => {
  const g = grade([
    'LLLA',
    'AMBD',
    'AMDB',
    'ABDL',
    'ADBL']);
  const grupos = matches.encontrarGrupos(g);
  const formas = grupos.map((x) => x.forma).sort();
  assert.deepEqual(formas, ['linha3', 'linha4']);
  const v = grupos.find((x) => x.forma === 'linha4');
  assert.equal(v.peca, 'alckmin');
  assert.equal(v.celulas.length, 4);
});

test('linha de 6 vira linha5', () => {
  const g = grade(['LLLLLL', 'AMBDAM']);
  assert.equal(matches.encontrarGrupos(g)[0].forma, 'linha5');
});

test('forma L e forma T, com canto na interseção', () => {
  const l = grade([
    'LAM',
    'LMA',
    'LLL']);
  const gl = matches.encontrarGrupos(l);
  assert.equal(gl.length, 1);
  assert.equal(gl[0].forma, 'L');
  assert.equal(gl[0].celulas.length, 5);
  assert.deepEqual(gl[0].canto, { l: 2, c: 0 });

  const t = grade([
    'LLL',
    'ALM',
    'MLA']);
  const gt = matches.encontrarGrupos(t);
  assert.equal(gt[0].forma, 'T');
  assert.deepEqual(gt[0].canto, { l: 0, c: 1 });
});

test('células com bloco ou fora da máscara não formam grupo', () => {
  const g = grade(['LLL#', 'AMBD']);
  g[0][1].bloco = { tipo: 'bolsonaro', vida: 2 };
  g[0][1].peca = null;
  assert.deepEqual(matches.encontrarGrupos(g), []);
});

test('podeTrocar exige adjacência, peças, sem corrente e sem bloco', () => {
  const g = grade(['LA', 'MB']);
  assert.ok(matches.podeTrocar(g, { l: 0, c: 0 }, { l: 0, c: 1 }));
  assert.ok(!matches.podeTrocar(g, { l: 0, c: 0 }, { l: 1, c: 1 }), 'diagonal');
  g[0][1].corrente = true;
  assert.ok(!matches.podeTrocar(g, { l: 0, c: 0 }, { l: 0, c: 1 }), 'corrente');
  g[0][1].corrente = false; g[0][1].bloco = { tipo: 'boiada', vida: 1 }; g[0][1].peca = null;
  assert.ok(!matches.podeTrocar(g, { l: 0, c: 0 }, { l: 0, c: 1 }), 'bloco');
});

test('ehJogadaValida: troca que forma match, estrela com peça, duas especiais', () => {
  const g = grade(['LLA', 'AML']);
  assert.ok(matches.ehJogadaValida(g, { l: 0, c: 2 }, { l: 1, c: 2 }));
  assert.ok(!matches.ehJogadaValida(g, { l: 1, c: 0 }, { l: 1, c: 1 }));
  const h = grade(['LA', 'MB']);
  h[0][0].especial = 'estrela';
  assert.ok(matches.ehJogadaValida(h, { l: 0, c: 0 }, { l: 0, c: 1 }));
  const k = grade(['LA', 'MB']);
  k[0][0].especial = 'bomba'; k[0][1].especial = 'listradaH';
  assert.ok(matches.ehJogadaValida(k, { l: 0, c: 0 }, { l: 0, c: 1 }));
});

test('encontrarJogada acha a troca e temJogada responde', () => {
  const g = grade(['LLA', 'AML']);
  const j = matches.encontrarJogada(g);
  assert.ok(j);
  assert.ok(matches.ehJogadaValida(g, j.a, j.b));
  assert.ok(!matches.temJogada(grade(['LA', 'AL'])));
});

test('encontrarJogada não troca peças acorrentadas', () => {
  const g = grade(['LLA', 'AML']);
  g[0][2].corrente = true; g[1][2].corrente = true;
  assert.equal(matches.encontrarJogada(g), null);
});

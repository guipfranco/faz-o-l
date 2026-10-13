const test = require('node:test');
const assert = require('node:assert/strict');
const rng = require('../src/logica/rng');
const matches = require('../src/logica/matches');
const tabuleiro = require('../src/logica/tabuleiro');
const { grade, desenhar } = require('./apoio');

const DEF = { linhas: 8, colunas: 8, jogadas: 20, objetivos: [{ tipo: 'pontos', alvo: 1000 }], limiares: [1000, 2000, 3000] };

test('criar respeita mascara e nao preenche pecas', () => {
  const mascara = Array.from({ length: 3 }, () => [true, false, true]);
  const e = tabuleiro.criar({ ...DEF, linhas: 3, colunas: 3, mascara }, rng.criar(1));
  assert.equal(e.celulas[0][1], null);
  assert.equal(e.celulas[0][0].peca, null);
  assert.equal(e.jogadasRestantes, 20);
  assert.equal(e.objetivos[0].atual, 0);
  assert.equal(e.status, 'jogando');
});

test('preencherInicial nao deixa grupos e garante jogada', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const e = tabuleiro.criar(DEF, rng.criar(seed));
    tabuleiro.preencherInicial(e);
    tabuleiro.garantirJogada(e);
    assert.equal(matches.encontrarGrupos(e.celulas).length, 0, 'seed ' + seed);
    assert.ok(matches.temJogada(e.celulas), 'seed ' + seed);
    e.celulas.flat().forEach((c) => assert.ok(c.peca));
  }
});

test('preencherInicial pula celulas com bloco', () => {
  const e = tabuleiro.criar({ ...DEF, linhas: 3, colunas: 3 }, rng.criar(2));
  e.celulas[1][1].bloco = { tipo: 'bolsonaro', vida: 2 };
  tabuleiro.preencherInicial(e);
  assert.equal(e.celulas[1][1].peca, null);
});

test('gravidade derruba pecas e devolve movimentos', () => {
  const e = tabuleiro.criar({ ...DEF, linhas: 3, colunas: 1 }, rng.criar(1));
  e.celulas = grade(['L', '.', 'A']);
  const mov = tabuleiro.gravidade(e);
  assert.deepEqual(desenhar(e.celulas), ['.', 'L', 'A']);
  assert.deepEqual(mov, [{ de: { l: 0, c: 0 }, para: { l: 1, c: 0 } }]);
});

test('gravidade para em bloco, em corrente e fora da mascara', () => {
  const e = tabuleiro.criar({ ...DEF, linhas: 5, colunas: 3 }, rng.criar(1));
  e.celulas = grade(['LA#', '..M', 'A..', '...', '...']);
  e.celulas[2][0].bloco = { tipo: 'boiada', vida: 1 }; e.celulas[2][0].peca = null;
  e.celulas[2][1].peca = 'dilma'; e.celulas[2][1].corrente = true;
  tabuleiro.gravidade(e);
  const d = desenhar(e.celulas);
  assert.equal(d[1][0], 'L', 'L para em cima do bloco');
  assert.equal(d[1][1], 'A', 'A para em cima da corrente');
  assert.equal(d[2][1], 'D', 'corrente nao se move');
  assert.equal(d[4][2], 'M', 'M cai ate o fundo da coluna com buraco de mascara em cima');
});

test('preencher enche o que esta vazio e devolve as novas', () => {
  const e = tabuleiro.criar({ ...DEF, linhas: 2, colunas: 2 }, rng.criar(3));
  e.celulas = grade(['..', 'L.']);
  const novas = tabuleiro.preencher(e);
  assert.equal(novas.length, 3);
  e.celulas.flat().forEach((c) => assert.ok(c.peca));
});

test('embaralhar remove grupos e cria jogada', () => {
  const e = tabuleiro.criar({ ...DEF, linhas: 4, colunas: 4 }, rng.criar(5));
  e.celulas = grade(['LAMB', 'AMBL', 'MBLA', 'BLAM']);
  assert.ok(!matches.temJogada(e.celulas));
  assert.ok(tabuleiro.embaralhar(e));
  assert.equal(matches.encontrarGrupos(e.celulas).length, 0);
  assert.ok(matches.temJogada(e.celulas));
});

test('embaralhar nao move corrente nem bloco', () => {
  const e = tabuleiro.criar({ ...DEF, linhas: 3, colunas: 3 }, rng.criar(5));
  e.celulas = grade(['LAM', 'MLA', 'AML']);
  e.celulas[1][1].corrente = true;
  e.celulas[2][2].bloco = { tipo: 'bolsonaro', vida: 2 }; e.celulas[2][2].peca = null;
  tabuleiro.embaralhar(e);
  assert.equal(e.celulas[1][1].peca, 'lula');
  assert.equal(e.celulas[2][2].peca, null);
});

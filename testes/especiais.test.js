const test = require('node:test');
const assert = require('node:assert/strict');
const rng = require('../src/logica/rng');
const tabuleiro = require('../src/logica/tabuleiro');
const especiais = require('../src/logica/especiais');
const { grade } = require('./apoio');

const DEF = { linhas: 5, colunas: 5, jogadas: 10, objetivos: [{ tipo: 'pontos', alvo: 1 }], limiares: [1, 2, 3] };
function estadoCom(linhas) {
  const e = tabuleiro.criar({ ...DEF, linhas: linhas.length, colunas: linhas[0].length }, rng.criar(1));
  e.celulas = grade(linhas);
  return e;
}
const chaves = (lista) => lista.map((p) => p.l + ',' + p.c).sort();

test('especialPorForma', () => {
  const r = rng.criar(1);
  assert.equal(especiais.especialPorForma('linha3', 'h', r), null);
  assert.equal(especiais.especialPorForma('linha4', 'h', r), 'listradaH');
  assert.equal(especiais.especialPorForma('linha4', 'v', r), 'listradaV');
  assert.ok(['listradaH', 'listradaV'].includes(especiais.especialPorForma('linha4', null, r)));
  assert.equal(especiais.especialPorForma('T', 'h', r), 'bomba');
  assert.equal(especiais.especialPorForma('L', 'h', r), 'L');
  assert.equal(especiais.especialPorForma('linha5', 'h', r), 'estrela');
});

test('areas de listrada, bomba e L (fator 2), respeitando mascara e incluindo blocos', () => {
  const e = estadoCom(['LAMBD', 'AMBDL', 'MB#LA', 'BDLAM', 'DLAMB']);
  e.celulas[1][1].bloco = { tipo: 'bolsonaro', vida: 2 }; e.celulas[1][1].peca = null;
  assert.equal(especiais.areaDeAtivacao(e, 2, 0, 'listradaH').celulas.length, 4, 'linha 2 tem buraco de mascara');
  assert.equal(especiais.areaDeAtivacao(e, 0, 1, 'listradaV').celulas.length, 5, 'coluna inclui o bloco');
  assert.equal(especiais.areaDeAtivacao(e, 0, 0, 'bomba').celulas.length, 4, 'bomba no canto');
  const L = especiais.areaDeAtivacao(e, 3, 3, 'L');
  assert.equal(L.fator, 2);
  assert.equal(L.celulas.length, 9, '5 da linha + 5 da coluna - 1 repetida');
});

test('estrela limpa todas da cor; sem pecaAlvo usa a cor mais comum', () => {
  const e = estadoCom(['LLA', 'MLA', 'BDM']);
  e.celulas[2][1].especial = 'estrela';
  const a = especiais.areaDeAtivacao(e, 2, 1, 'estrela', 'alckmin');
  assert.deepEqual(chaves(a.celulas), chaves([{ l: 0, c: 2 }, { l: 1, c: 2 }, { l: 2, c: 1 }]));
  const b = especiais.areaDeAtivacao(e, 2, 1, 'estrela', null);
  assert.equal(b.celulas.length, 4, 'tres lulas + a propria estrela');
});

test('tipoDeCombo cobre a tabela da spec', () => {
  const t = especiais.tipoDeCombo;
  assert.equal(t('listradaH', 'listradaV'), 'linhaEColuna');
  assert.equal(t('listradaH', 'bomba'), 'tresLinhasColunas');
  assert.equal(t('bomba', 'bomba'), 'area5');
  assert.equal(t('L', 'L'), 'duploL');
  assert.equal(t('L', 'estrela'), 'LEstrela');
  assert.equal(t('estrela', 'bomba'), 'estrelaEspecial');
  assert.equal(t('estrela', 'estrela'), 'limparTudo');
  assert.equal(t('L', 'listradaV'), 'linhaEColuna');
  assert.equal(t('L', 'bomba'), 'tresLinhasColunas');
});

test('areaDoCombo: duploL cobre duas linhas e duas colunas com fator 2', () => {
  const e = estadoCom(['LAMBD', 'AMBDL', 'MBDLA', 'BDLAM', 'DLAMB']);
  const a = especiais.areaDoCombo(e, { l: 2, c: 2 }, { l: 2, c: 3 }, 'duploL', 'lula', 'L');
  assert.equal(a.fator, 2);
  assert.equal(a.celulas.length, 5 + 5 + 5 - 2, 'linha 2 (5) + colunas 2 e 3 (5 cada) menos as 2 intersecoes');
});

test('areaDoCombo: LEstrela e limparTudo', () => {
  const e = estadoCom(['LAM', 'AMB', 'MBL']);
  const a = especiais.areaDoCombo(e, { l: 0, c: 0 }, { l: 0, c: 1 }, 'LEstrela', 'lula', 'L');
  assert.equal(a.fator, 2);
  assert.equal(a.celulas.length, 8, 'dois L em (0,0) e (2,2) cobrem 8 das 9 celulas; so (1,1) fica de fora');
  const t = especiais.areaDoCombo(e, { l: 0, c: 0 }, { l: 0, c: 1 }, 'limparTudo', null, 'estrela');
  assert.equal(t.celulas.length, 9);
});

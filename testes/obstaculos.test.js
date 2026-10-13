const test = require('node:test');
const assert = require('node:assert/strict');
const rng = require('../src/logica/rng');
const tabuleiro = require('../src/logica/tabuleiro');
const obstaculos = require('../src/logica/obstaculos');
const { grade } = require('./apoio');

const DEF = { linhas: 4, colunas: 4, jogadas: 10, objetivos: [{ tipo: 'pontos', alvo: 1 }], limiares: [1, 2, 3] };
function estadoCom(linhas) {
  const e = tabuleiro.criar({ ...DEF, linhas: linhas.length, colunas: linhas[0].length }, rng.criar(3));
  e.celulas = grade(linhas);
  return e;
}

test('colocar: gelatina, corrente, blocos e chefe 2x2 compartilhado', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'MBDL', 'BDLA']);
  obstaculos.colocar(e, [
    { tipo: 'gelatina', l: 0, c: 0, camadas: 2 }, { tipo: 'corrente', l: 0, c: 1 },
    { tipo: 'bolsonaro', l: 1, c: 0 }, { tipo: 'boiada', l: 1, c: 1 }, { tipo: 'fakenews', l: 1, c: 2 },
    { tipo: 'chefe', l: 2, c: 2, vida: 5 }]);
  assert.equal(e.celulas[0][0].gelatina, 2);
  assert.equal(e.celulas[0][0].peca, 'lula', 'gelatina fica embaixo da peca');
  assert.ok(e.celulas[0][1].corrente);
  assert.equal(e.celulas[1][0].bloco.vida, 2);
  assert.equal(e.celulas[1][0].peca, null);
  assert.equal(e.celulas[1][1].bloco.tipo, 'boiada');
  assert.equal(e.celulas[1][2].bloco.contador, 0);
  assert.equal(e.chefe.vida, 5);
  for (const [l, c] of [[2, 2], [2, 3], [3, 2], [3, 3]]) assert.equal(e.celulas[l][c].bloco, e.chefe);
  assert.equal(obstaculos.contar(e, 'gelatina'), 2);
  assert.equal(obstaculos.contar(e, 'bolsonaro'), 1);
  assert.equal(obstaculos.contar(e, 'chefe'), 5);
});

test('golpe: bolsonaro precisa de 2, boiada de 1, chefe some das 4 celulas ao zerar', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'MBDL', 'BDLA']);
  obstaculos.colocar(e, [{ tipo: 'bolsonaro', l: 0, c: 0 }, { tipo: 'boiada', l: 0, c: 1 }, { tipo: 'chefe', l: 2, c: 2, vida: 2 }]);
  assert.deepEqual(obstaculos.golpe(e, 0, 0), { tipo: 'bolsonaro', destruido: false, vida: 1 });
  assert.deepEqual(obstaculos.golpe(e, 0, 0), { tipo: 'bolsonaro', destruido: true, vida: 0 });
  assert.equal(e.celulas[0][0].bloco, null);
  assert.equal(obstaculos.golpe(e, 0, 1).destruido, true);
  assert.equal(obstaculos.golpe(e, 2, 2).destruido, false);
  assert.equal(obstaculos.golpe(e, 3, 3).destruido, true);
  for (const [l, c] of [[2, 2], [2, 3], [3, 2], [3, 3]]) assert.equal(e.celulas[l][c].bloco, null);
  assert.equal(obstaculos.golpe(e, 1, 1), null, 'sem bloco devolve null');
});

test('golpeAdjacente solta corrente e golpeia bloco, mas ignora gelatina', () => {
  const e = estadoCom(['LA', 'MB']);
  obstaculos.colocar(e, [{ tipo: 'corrente', l: 0, c: 0 }, { tipo: 'gelatina', l: 0, c: 1 }, { tipo: 'fakenews', l: 1, c: 0 }]);
  assert.deepEqual(obstaculos.golpeAdjacente(e, 0, 0), { tipo: 'corrente', destruido: true });
  assert.ok(!e.celulas[0][0].corrente);
  assert.equal(obstaculos.golpeAdjacente(e, 0, 1), null);
  assert.equal(e.celulas[0][1].gelatina, 1);
  assert.equal(obstaculos.golpeAdjacente(e, 1, 0).tipo, 'fakenews');
});

test('espalharBoiada so vai para vizinho livre e nao espalha se destruiu boiada', () => {
  // boiada em (1,1); vizinhos: (0,1) bloco, (1,0) corrente, (1,2) especial, (2,1) livre
  const e = estadoCom(['LAM', 'BDL', 'MAB']);
  obstaculos.colocar(e, [{ tipo: 'boiada', l: 1, c: 1 }, { tipo: 'bolsonaro', l: 0, c: 1 }, { tipo: 'corrente', l: 1, c: 0 }]);
  e.celulas[1][2].especial = 'bomba';
  assert.equal(obstaculos.espalharBoiada(e, true), null);
  assert.deepEqual(obstaculos.espalharBoiada(e, false), { l: 2, c: 1 });
  assert.equal(e.celulas[2][1].bloco.tipo, 'boiada');
  assert.equal(e.celulas[2][1].peca, null);
});

test('espalharBoiada respeita a mascara e devolve null sem opcoes', () => {
  const e = estadoCom(['#L#', 'LBL', '#L#']);
  obstaculos.colocar(e, [{ tipo: 'boiada', l: 1, c: 1 }, { tipo: 'corrente', l: 0, c: 1 }, { tipo: 'corrente', l: 1, c: 0 }, { tipo: 'corrente', l: 1, c: 2 }, { tipo: 'corrente', l: 2, c: 1 }]);
  assert.equal(obstaculos.espalharBoiada(e, false), null);
});

test('espalharBoiada ignora vizinho fora da mascara', () => {
  // boiada em (1,1); (1,2) e (0,1) fora da mascara; (1,0) corrente; so (2,1) esta livre
  const e = estadoCom(['L#L', 'LB#', 'LLL']);
  obstaculos.colocar(e, [{ tipo: 'boiada', l: 1, c: 1 }, { tipo: 'corrente', l: 1, c: 0 }]);
  assert.deepEqual(obstaculos.espalharBoiada(e, false), { l: 2, c: 1 });
  e.celulas[2][1].bloco = null; e.celulas[2][1].peca = 'lula'; e.celulas[2][1].corrente = true;
  assert.equal(obstaculos.espalharBoiada(e, false), null, 'sem vizinho livre: nem a mascara nem a corrente servem');
});

test('fake news multiplica a cada duas chamadas', () => {
  const e = estadoCom(['LAM', 'ABL', 'MLA']);
  obstaculos.colocar(e, [{ tipo: 'fakenews', l: 1, c: 1 }]);
  assert.deepEqual(obstaculos.avancarFakeNews(e), []);
  const novas = obstaculos.avancarFakeNews(e);
  assert.equal(novas.length, 1);
  assert.deepEqual(novas[0].origem, { l: 1, c: 1 });
  assert.equal(obstaculos.contar(e, 'fakenews'), 2);
});

test('fake news: no maximo uma copia nova por turno; a outra guarda o contador', () => {
  const e = estadoCom(['LAMBD', 'AMBDL', 'MBDLA', 'BDLAM', 'DLAMB']);
  obstaculos.colocar(e, [{ tipo: 'fakenews', l: 0, c: 0 }, { tipo: 'fakenews', l: 4, c: 4 }]);
  e.celulas[0][0].bloco.contador = 1; e.celulas[4][4].bloco.contador = 1;
  const novas = obstaculos.avancarFakeNews(e);
  assert.equal(novas.length, 1);
  assert.equal(obstaculos.contar(e, 'fakenews'), 3);
  const outra = novas[0].origem.l === 0 ? e.celulas[4][4] : e.celulas[0][0];
  assert.equal(outra.bloco.contador, 2, 'quem nao copiou guarda o contador');
  const depois = obstaculos.avancarFakeNews(e);
  assert.equal(depois.length, 1, 'a outra copia no turno seguinte');
  assert.notDeepEqual(depois[0].origem, novas[0].origem);
});

test('bloco que cai em cima de gelatina nao apaga a gelatina', () => {
  const e = estadoCom(['LA', 'MB']);
  obstaculos.colocar(e, [{ tipo: 'gelatina', l: 0, c: 0, camadas: 2 }, { tipo: 'fakenews', l: 0, c: 0 }]);
  assert.equal(e.celulas[0][0].bloco.tipo, 'fakenews');
  assert.equal(e.celulas[0][0].gelatina, 2);
  assert.equal(obstaculos.contar(e, 'gelatina'), 2);
});

test('chefe ataca na terceira jogada com gelatina ou fake news', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'MBDL', 'BDLA']);
  obstaculos.colocar(e, [{ tipo: 'chefe', l: 0, c: 1, vida: 9 }]);
  assert.equal(obstaculos.turnoChefe(e), null);
  assert.equal(obstaculos.turnoChefe(e), null);
  const ataque = obstaculos.turnoChefe(e);
  assert.ok(['gelatina', 'fakenews'].includes(ataque.tipo));
  const cel = e.celulas[ataque.l][ataque.c];
  assert.ok(ataque.tipo === 'gelatina' ? cel.gelatina === 1 : cel.bloco.tipo === 'fakenews');
  assert.equal(obstaculos.turnoChefe(e), null, 'contador reiniciou');
});

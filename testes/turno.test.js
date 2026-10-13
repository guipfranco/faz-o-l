const test = require('node:test');
const assert = require('node:assert/strict');
const rng = require('../src/logica/rng');
const matches = require('../src/logica/matches');
const tabuleiro = require('../src/logica/tabuleiro');
const obstaculos = require('../src/logica/obstaculos');
const pontuacao = require('../src/logica/pontuacao');
const turno = require('../src/logica/turno');
const { grade, desenhar } = require('./apoio');

const DEF = { numero: 1, linhas: 4, colunas: 4, jogadas: 10, objetivos: [{ tipo: 'pontos', alvo: 99999 }], limiares: [100, 200, 300] };
function estadoCom(linhas, extra) {
  const def = Object.assign({}, DEF, { linhas: linhas.length, colunas: linhas[0].length }, extra || {});
  const e = tabuleiro.criar(def, rng.criar(11));
  e.celulas = grade(linhas);
  e.numero = def.numero; e.def = def;
  obstaculos.colocar(e, def.obstaculos || []);
  return e;
}
const tipos = (eventos) => eventos.map((e) => e.tipo);

test('estrelas: 0 sem vitoria, minimo 1 com vitoria, bonus por 3 L', () => {
  assert.equal(pontuacao.estrelasPorPontos(250, [100, 200, 300]), 2);
  assert.equal(pontuacao.estrelas(250, [100, 200, 300], 0, false), 0);
  assert.equal(pontuacao.estrelas(50, [100, 200, 300], 0, true), 1);
  assert.equal(pontuacao.estrelas(350, [100, 200, 300], 3, true), 4);
});

test('iniciarFase coloca obstaculos, preenche e garante jogada', () => {
  const def = { ...DEF, linhas: 8, colunas: 8, obstaculos: [{ tipo: 'gelatina', l: 3, c: 3 }, { tipo: 'bolsonaro', l: 0, c: 0 }] };
  const e = turno.iniciarFase(def, 5);
  assert.equal(e.celulas[0][0].bloco.tipo, 'bolsonaro');
  assert.equal(e.celulas[0][0].peca, null);
  assert.equal(e.celulas[3][3].gelatina, 1);
  assert.ok(e.celulas[3][3].peca);
  assert.equal(matches.encontrarGrupos(e.celulas).length, 0);
  assert.ok(matches.temJogada(e.celulas));
  assert.equal(e.numero, 1);
});

test('troca sem match e desfeita e nao consome jogada', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'MBDL', 'BDLA']);
  const antes = desenhar(e.celulas);
  const r = turno.jogar(e, { l: 0, c: 0 }, { l: 0, c: 1 });
  assert.equal(r.valido, false);
  assert.deepEqual(desenhar(e.celulas), antes);
  assert.equal(e.jogadasRestantes, 10);
  assert.deepEqual(tipos(r.eventos), ['trocaInvalida']);
});

test('match de 3 limpa, pontua 180, consome jogada e gera a sequencia de eventos', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'LBDM', 'ALLA']);
  const r = turno.jogar(e, { l: 2, c: 0 }, { l: 3, c: 0 });
  assert.ok(r.valido);
  assert.equal(e.jogadasRestantes, 9);
  const t = tipos(r.eventos);
  assert.deepEqual(t.slice(0, 3), ['troca', 'match', 'limpar']);
  assert.ok(t.includes('gravidade') && t.includes('preencher'));
  assert.equal(t[t.length - 1], 'fim');
  const limpar = r.eventos.find((x) => x.tipo === 'limpar');
  assert.equal(limpar.pontos, 180);
  assert.equal(limpar.celulas.length, 3);
  assert.equal(e.pontos, 180);
  e.celulas.flat().forEach((c) => assert.ok(c.peca, 'tudo preenchido de novo'));
});

test('cascata multiplica os pontos', () => {
  const e = estadoCom(['AMBD', 'BLAB', 'DLDA', 'LAMM']);
  const r = turno.jogar(e, { l: 3, c: 0 }, { l: 3, c: 1 });
  const limpezas = r.eventos.filter((x) => x.tipo === 'limpar');
  assert.ok(limpezas.length >= 2, 'houve cascata');
  assert.equal(limpezas[0].cascata, 1);
  assert.equal(limpezas[0].pontos, 180);
  assert.equal(limpezas[1].cascata, 2);
  assert.ok(limpezas[1].pontos >= 360);
});

test('4 em linha cria listrada na celula movida, com orientacao do movimento', () => {
  const e = estadoCom(['LAMBD', 'AMBDA', 'MLLDL', 'BDALB']);
  const r = turno.jogar(e, { l: 3, c: 3 }, { l: 2, c: 3 });
  assert.ok(r.valido);
  const criado = r.eventos.find((x) => x.tipo === 'especialCriado');
  assert.deepEqual({ l: criado.l, c: criado.c, especial: criado.especial }, { l: 2, c: 3, especial: 'listradaV' });
  assert.equal(e.celulas[2][3].especial, 'listradaV');
  assert.equal(e.celulas[2][3].peca, 'lula');
});

test('listrada atingida por match limpa a linha inteira', () => {
  const e = estadoCom(['LAMBD', 'AMBDA', 'DLALB', 'BDLMB']);
  e.celulas[2][1].especial = 'listradaH';
  const r = turno.jogar(e, { l: 3, c: 2 }, { l: 2, c: 2 });
  const ativ = r.eventos.find((x) => x.tipo === 'especialAtivado');
  assert.equal(ativ.especial, 'listradaH');
  assert.equal(ativ.celulas.length, 5);
  const limpar = r.eventos.find((x) => x.tipo === 'limpar');
  assert.equal(limpar.celulas.length, 5, 'linha 2 inteira (3 do match + 2 da listrada)');
  assert.equal(limpar.pontos, 60 * 3 + 120 * 2);
});

test('L: forma cria peca L; ativar conta no contadorL e vale o dobro', () => {
  const e = estadoCom(['AAMBD', 'LMBDA', 'LBDAM', 'ALLDB', 'LDAMB']);
  const r = turno.jogar(e, { l: 3, c: 0 }, { l: 4, c: 0 });
  const criado = r.eventos.find((x) => x.tipo === 'especialCriado');
  assert.ok(criado, 'alguma especial criada');
  assert.equal(criado.especial, 'L');
  assert.deepEqual({ l: criado.l, c: criado.c }, { l: 3, c: 0 }, 'canto do L');

  const f = estadoCom(['LAMBD', 'AMBDA', 'DLALB', 'BDLMB']);
  f.celulas[2][1].especial = 'L';
  const r2 = turno.jogar(f, { l: 3, c: 2 }, { l: 2, c: 2 });
  assert.equal(f.contadorL, 1);
  const limpar = r2.eventos.find((x) => x.tipo === 'limpar');
  // linha 2 (5) + coluna 1 (4) - intersecao = 8 celulas; 3 do match a 60, 5 da area do L a 240
  assert.equal(limpar.celulas.length, 8);
  assert.equal(limpar.pontos, 60 * 3 + 240 * 5);
});

test('estrela trocada com peca comum limpa todas daquela cor', () => {
  const e = estadoCom(['LAMB', 'AMBL', 'MBLA', 'BLAM']);
  e.celulas[0][0].especial = 'estrela';
  const r = turno.jogar(e, { l: 0, c: 0 }, { l: 0, c: 1 });
  assert.ok(r.valido);
  const limpar = r.eventos.find((x) => x.tipo === 'limpar');
  const pecas = limpar.celulas.map((x) => x.peca);
  assert.equal(pecas.filter((p) => p === 'alckmin').length, 4);
  assert.equal(e.jogadasRestantes, 9);
});

test('estrela atingida em cadeia por listrada nao lanca e e limpa', () => {
  const e = estadoCom(['LAMBD', 'AMBDA', 'DLALB', 'BDLMB']);
  e.celulas[2][1].especial = 'listradaH';
  e.celulas[2][4].especial = 'estrela'; e.celulas[2][4].peca = null;
  assert.doesNotThrow(() => turno.jogar(e, { l: 3, c: 2 }, { l: 2, c: 2 }));
  assert.equal(e.celulas[2][4].especial, null);
});

test('gelatina embaixo do match some; objetivo e vitoria com bonus final', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'LBDM', 'ALLA'], {
    objetivos: [{ tipo: 'limparGelatina', alvo: 3 }],
    obstaculos: [{ tipo: 'gelatina', l: 3, c: 1 }, { tipo: 'gelatina', l: 3, c: 2 }, { tipo: 'gelatina', l: 3, c: 0 }],
  });
  const r = turno.jogar(e, { l: 2, c: 0 }, { l: 3, c: 0 });
  assert.equal(obstaculos.contar(e, 'gelatina'), 0);
  assert.equal(e.status, 'vitoria');
  assert.equal(e.objetivos[0].atual, 3);
  assert.equal(e.jogadasRestantes, 0, 'bonus final consome as jogadas');
  assert.ok(r.eventos.some((x) => x.tipo === 'bonusJogada'));
  const fim = r.eventos[r.eventos.length - 1];
  assert.equal(fim.status, 'vitoria');
  assert.ok(fim.estrelas >= 1);
});

test('bloco do Bolsonaro leva golpe por adjacencia e quebra no segundo', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'LBDM', 'ALLA'], { obstaculos: [{ tipo: 'bolsonaro', l: 2, c: 1 }] });
  const r = turno.jogar(e, { l: 2, c: 0 }, { l: 3, c: 0 });
  const limpar = r.eventos.find((x) => x.tipo === 'limpar');
  const golpe = limpar.obstaculos.find((o) => o.tipo === 'bolsonaro');
  assert.deepEqual({ destruido: golpe.destruido, vida: golpe.vida }, { destruido: false, vida: 1 });
  assert.equal(e.celulas[2][1].bloco.vida, 1);
});

test('derrota quando as jogadas acabam com objetivo pendente', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'LBDM', 'ALLA'], { jogadas: 1 });
  turno.jogar(e, { l: 2, c: 0 }, { l: 3, c: 0 });
  assert.equal(e.status, 'derrota');
  assert.equal(turno.estrelas(e), 0);
  assert.equal(turno.jogar(e, { l: 0, c: 0 }, { l: 0, c: 1 }).valido, false, 'nao joga apos o fim');
});

test('coletar conta pecas limpas da cor', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'LBDM', 'ALLA'], { objetivos: [{ tipo: 'coletar', peca: 'lula', alvo: 20 }] });
  turno.jogar(e, { l: 2, c: 0 }, { l: 3, c: 0 });
  assert.ok(e.objetivos[0].atual >= 3);
});

test('chefe leva um unico golpe por rodada mesmo com especial cobrindo duas celulas dele', () => {
  const e = estadoCom(['LAMBD', 'AMBDA', 'DLALB', 'BDLMB', 'MABDA'], { obstaculos: [{ tipo: 'chefe', l: 3, c: 3, vida: 10 }] });
  e.celulas[2][3].especial = 'bomba';
  const r = turno.jogar(e, { l: 3, c: 2 }, { l: 2, c: 2 });
  const golpes = r.eventos.filter((x) => x.tipo === 'limpar').flatMap((x) => x.obstaculos).filter((o) => o.tipo === 'chefe');
  assert.equal(golpes.length, 1);
  assert.equal(e.chefe.vida, 9);
});

test('especial na celula de nascimento ativa antes de ser substituida', () => {
  const e = estadoCom(['LAMBD', 'AMBDA', 'MLLDL', 'BDALB']);
  e.celulas[3][3].especial = 'listradaH';
  const r = turno.jogar(e, { l: 3, c: 3 }, { l: 2, c: 3 });
  const ativ = r.eventos.find((x) => x.tipo === 'especialAtivado');
  assert.ok(ativ && ativ.especial === 'listradaH' && ativ.l === 2 && ativ.c === 3);
  const criado = r.eventos.find((x) => x.tipo === 'especialCriado');
  assert.equal(criado.especial, 'listradaV');
  assert.equal(e.celulas[2][3].especial, 'listradaV');
});

test('gelatina embaixo da celula de nascimento da especial tambem some', () => {
  const e = estadoCom(['LAMBD', 'AMBDA', 'MLLDL', 'BDALB'], { obstaculos: [{ tipo: 'gelatina', l: 2, c: 3 }] });
  const r = turno.jogar(e, { l: 3, c: 3 }, { l: 2, c: 3 });
  assert.equal(e.celulas[2][3].gelatina, 0);
  const limpar = r.eventos.find((x) => x.tipo === 'limpar');
  assert.ok(limpar.obstaculos.some((o) => o.tipo === 'gelatina' && o.l === 2 && o.c === 3 && o.destruido));
});

test('bonus final nao deixa grupos no tabuleiro', () => {
  const e = estadoCom(['LAMB', 'AMBD', 'LBDM', 'ALLA'], { objetivos: [{ tipo: 'pontos', alvo: 100 }], jogadas: 12 });
  turno.jogar(e, { l: 2, c: 0 }, { l: 3, c: 0 });
  assert.equal(e.status, 'vitoria');
  assert.equal(matches.encontrarGrupos(e.celulas).length, 0);
});

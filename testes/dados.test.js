const test = require('node:test');
const assert = require('node:assert/strict');
const estados = require('../dados/estados');
const frases = require('../dados/frases');
const fases = require('../dados/fases');

test('27 estados, 96 fases contiguas, 5 chefes', () => {
  assert.equal(estados.lista.length, 27);
  assert.equal(estados.TOTAL_FASES, 96);
  assert.equal(estados.lista[0].sigla, 'PE');
  assert.equal(estados.lista[0].faseInicial, 1);
  let esperado = 1;
  for (const e of estados.lista) {
    assert.equal(e.faseInicial, esperado, e.sigla);
    assert.equal(e.faseFinal, esperado + e.qtdFases - 1);
    assert.equal(e.obras.length, 3);
    esperado = e.faseFinal + 1;
  }
  const chefes = [];
  for (let n = 1; n <= 96; n++) if (estados.ehFaseDeChefe(n)) chefes.push(estados.estadoDaFase(n).sigla);
  assert.deepEqual(chefes, ['BA', 'TO', 'MS', 'SP', 'RS']);
  assert.equal(estados.estadoDaFase(96).sigla, 'RS');
  assert.equal(estados.estadoDaFase(97), null);
  assert.equal(estados.proximo('RS'), null);
  assert.equal(estados.proximo('PE').sigla, 'PB');
  assert.equal(estados.indice('BA'), 8);
});

test('frases tem id unico, personagem conhecido e fonte ou somenteAudio', () => {
  const ids = new Set();
  for (const f of frases.lista) {
    assert.ok(!ids.has(f.id), 'id repetido ' + f.id); ids.add(f.id);
    assert.ok(frases.NOMES[f.personagem], 'personagem desconhecido ' + f.personagem);
    if (f.somenteAudio) assert.equal(f.texto, null);
    else {
      assert.ok(typeof f.texto === 'string' && f.texto.length > 0, f.id);
      assert.match(f.fonte, /^https?:\/\//, 'sem fonte: ' + f.id);
      assert.ok(f.medoDelirio, 'frase sem clipe real: ' + f.id);
    }
  }
});

test('cada combinacao e cada obstaculo que fala tem pelo menos 3 falas', () => {
  const contar = (p, g) => frases.lista.filter((f) => f.personagem === p && !f.somenteAudio && (f.gatilhos || []).includes(g)).length;
  for (const g of frases.GATILHOS_DE_COMBINACAO) assert.ok(contar('torcida', g) >= 3, 'poucas falas da torcida para ' + g);
  assert.ok(contar('torcida', 'match') >= 3, 'poucas falas de reserva da torcida');
  assert.ok(contar('bolsonaro', 'derrota') >= 3, 'poucas falas de derrota');
  assert.ok(contar('salles', 'boiada') >= 3, 'poucas falas da boiada');
  for (const p of ['bolsonaro', 'salles', 'fakenews', 'flavio']) assert.ok(contar(p, 'match') >= 3, 'poucas falas para ' + p);
});

test('fases manuais 1 a 10 sao consistentes', () => {
  assert.equal(fases.manuais.length, 10);
  fases.manuais.forEach((f, i) => {
    assert.equal(f.numero, i + 1);
    assert.ok(f.jogadas > 0 && f.objetivos.length >= 1 && f.limiares.length === 3);
    assert.ok(f.limiares[0] < f.limiares[1] && f.limiares[1] < f.limiares[2]);
    for (const o of f.obstaculos || []) {
      assert.ok(o.l >= 0 && o.l < f.linhas && o.c >= 0 && o.c < f.colunas, 'obstaculo fora da grade na fase ' + f.numero);
      if (f.mascara) assert.ok(f.mascara[o.l][o.c], 'obstaculo fora da mascara na fase ' + f.numero);
    }
    for (const o of f.objetivos) if (o.tipo === 'coletar') assert.ok(f.pecas.includes(o.peca));
  });
  const f5 = fases.manuais[4];
  assert.equal(f5.objetivos[0].tipo, 'limparGelatina');
  assert.equal(f5.objetivos[0].alvo, f5.obstaculos.reduce((s, o) => s + (o.camadas || 1), 0));
});

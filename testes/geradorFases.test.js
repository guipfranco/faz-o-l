const test = require('node:test');
const assert = require('node:assert/strict');
const matches = require('../src/logica/matches');
const turno = require('../src/logica/turno');
const estados = require('../dados/estados');
const gerador = require('../src/logica/geradorFases');

test('fases manuais vem com estado e seed', () => {
  const f1 = gerador.obterFase(1);
  assert.equal(f1.estado, 'PE');
  assert.equal(f1.numero, 1);
  assert.equal(f1.seed, 1);
});

test('geracao e deterministica', () => {
  assert.deepEqual(gerador.obterFase(37), gerador.obterFase(37));
  assert.notDeepEqual(gerador.obterFase(37).obstaculos, gerador.obterFase(38).obstaculos);
});

test('todas as 96 fases iniciam, tem jogada, obstaculos validos e objetivos alcancaveis', () => {
  for (let n = 1; n <= gerador.TOTAL_FASES; n++) {
    const def = gerador.obterFase(n);
    assert.equal(def.estado, estados.estadoDaFase(n).sigla);
    assert.ok(def.jogadas >= 10, 'fase ' + n + ' com poucas jogadas');
    assert.ok(def.objetivos.length >= 1 && def.objetivos.length <= 2);
    def.objetivos.forEach((o) => assert.ok(o.alvo > 0, 'alvo zero na fase ' + n));
    for (const o of def.objetivos) {
      if (o.tipo === 'coletar') assert.ok(o.alvo <= def.jogadas * 1.6, 'coletar alto demais na fase ' + n);
      if (o.tipo === 'pontos') assert.ok(o.alvo >= def.jogadas * 200, 'pontos baixo demais na fase ' + n);
    }
    const vistos = new Set();
    for (const o of def.obstaculos) {
      const k = o.l + ',' + o.c;
      assert.ok(!vistos.has(k), 'obstaculos sobrepostos na fase ' + n); vistos.add(k);
      if (def.mascara) assert.ok(def.mascara[o.l][o.c], 'obstaculo fora da mascara na fase ' + n);
    }
    const temChefe = def.obstaculos.some((o) => o.tipo === 'chefe');
    assert.equal(temChefe, estados.ehFaseDeChefe(n), 'chefe na fase ' + n);
    const e = turno.iniciarFase(def);
    assert.equal(e.status, 'jogando');
    assert.ok(matches.temJogada(e.celulas), 'sem jogada na fase ' + n);
    assert.equal(matches.encontrarGrupos(e.celulas).length, 0, 'fase ' + n + ' comeca com match');
  }
});

test('obstaculos aparecem so depois da fase de desbloqueio', () => {
  const primeira = (tipo) => { for (let n = 1; n <= 96; n++) if (gerador.obterFase(n).obstaculos.some((o) => o.tipo === tipo)) return n; return null; };
  assert.ok(primeira('fakenews') >= 12);
  assert.ok(primeira('corrente') >= 20);
  assert.ok(primeira('bolsonaro') >= 30);
  assert.ok(primeira('boiada') >= 45);
  assert.ok(primeira('boiada') !== null, 'boiada precisa aparecer em alguma fase');
});

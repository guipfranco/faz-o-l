const test = require('node:test');
const assert = require('node:assert/strict');
const estados = require('../dados/estados');
const progresso = require('../src/progresso');

function memoria() { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, _m: m }; }

test('estado inicial', () => {
  const p = progresso.criar({ armazenamento: memoria(), estados });
  assert.equal(p.estadoAtual(), 'PE');
  assert.equal(p.estrelasDisponiveis(), 0);
  assert.ok(p.faseDesbloqueada(1));
  assert.ok(!p.faseDesbloqueada(2));
  assert.ok(!p.faseDesbloqueada(6), 'PB bloqueado');
  assert.ok(p.persistente);
});

test('registrarFase guarda o melhor e desbloqueia a proxima', () => {
  const p = progresso.criar({ armazenamento: memoria(), estados });
  assert.deepEqual(p.registrarFase(1, 2, 3000), { novasEstrelas: 2 });
  assert.deepEqual(p.registrarFase(1, 1, 1000), { novasEstrelas: 0 });
  assert.equal(p.estrelasDaFase(1), 2);
  assert.equal(p.dados.fases[1].pontos, 3000);
  assert.ok(p.faseDesbloqueada(2));
});

test('comprar obras: 3 estrelas cada, 3 obras concluem o estado e liberam o proximo', () => {
  const p = progresso.criar({ armazenamento: memoria(), estados });
  for (let n = 1; n <= 3; n++) p.registrarFase(n, 3, 1000);
  assert.equal(p.estrelasDisponiveis(), 9);
  assert.ok(!p.podeComprarObra('PB'), 'so o estado atual');
  assert.deepEqual(p.comprarObra('PE'), { obras: 1, concluiuEstado: false, proximo: null });
  p.comprarObra('PE');
  assert.equal(p.estrelasDisponiveis(), 3);
  assert.deepEqual(p.comprarObra('PE'), { obras: 3, concluiuEstado: true, proximo: 'PB' });
  assert.equal(p.estadoAtual(), 'PB');
  assert.equal(p.comprarObra('PE'), null, 'ja tem 3');
  assert.ok(p.faseDesbloqueada(6), 'primeira fase de PB');
  assert.ok(p.faseDesbloqueada(4), 'fases antigas continuam acessiveis em sequencia');
  assert.ok(!p.faseDesbloqueada(5), 'fase 5 exige estrela na 4');
});

test('persiste e recarrega', () => {
  const arm = memoria();
  const p = progresso.criar({ armazenamento: arm, estados });
  p.registrarFase(1, 3, 500);
  p.definirAudio({ mudo: true });
  const q = progresso.criar({ armazenamento: arm, estados });
  assert.equal(q.estrelasDaFase(1), 3);
  assert.equal(q.audio().mudo, true);
  q.apagar();
  assert.equal(progresso.criar({ armazenamento: arm, estados }).estrelasDaFase(1), 0);
});

test('armazenamento que lanca: segue em memoria e persistente fica false', () => {
  const quebrado = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } };
  const p = progresso.criar({ armazenamento: quebrado, estados });
  assert.equal(p.persistente, false);
  p.registrarFase(1, 2, 100);
  assert.equal(p.estrelasDaFase(1), 2);
  assert.equal(p.persistente, false);
  const semNada = progresso.criar({ armazenamento: null, estados });
  assert.equal(semNada.persistente, false);
  semNada.registrarFase(1, 1, 1);
  assert.equal(semNada.estrelasTotais(), 1);
});

test('dados corrompidos voltam ao padrao', () => {
  const arm = memoria();
  arm.setItem(progresso.CHAVE, '{nao e json');
  const p = progresso.criar({ armazenamento: arm, estados });
  assert.equal(p.estadoAtual(), 'PE');
});

test('armazenamento que so falha ao gravar: persistente false ja no carregamento', () => {
  const soLeitura = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
  const p = progresso.criar({ armazenamento: soLeitura, estados });
  assert.equal(p.persistente, false);
  p.registrarFase(1, 1, 1);
  assert.equal(p.estrelasDaFase(1), 1, 'segue em memoria');
});

test('dados corrompidos com armazenamento funcional: volta ao padrao e persistente true', () => {
  const arm = memoria();
  arm.setItem(progresso.CHAVE, '{nao e json');
  const p = progresso.criar({ armazenamento: arm, estados });
  assert.equal(p.estadoAtual(), 'PE');
  assert.equal(p.persistente, true);
  assert.ok(JSON.parse(arm.getItem(progresso.CHAVE)).fases, 'sondagem regravou o padrao');
});

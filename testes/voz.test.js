const test = require('node:test');
const assert = require('node:assert/strict');
const voz = require('../src/voz');

const FRASES = [
  { id: 'lula-a', personagem: 'lula', texto: 'A', gatilhos: ['match'] },
  { id: 'lula-b', personagem: 'lula', texto: 'B', gatilhos: ['match'] },
  { id: 'lula-c', personagem: 'lula', texto: 'C', gatilhos: ['match', 'vitoria'] },
  { id: 'lula-l', personagem: 'lula', texto: 'Faz o L', gatilhos: ['L'] },
  { id: 'flavio-1', personagem: 'flavio', texto: null, somenteAudio: true },
];

function ambiente(opts) {
  const existentes = new Set(opts && opts.existentes || []);
  const reg = { tocados: [], sintetizados: [], baloes: [], timers: [] };
  let t = 0;
  const env = {
    reg,
    avancar(ms) { t += ms; const prontos = reg.timers.filter((x) => x.em <= t); reg.timers = reg.timers.filter((x) => x.em > t); prontos.forEach((x) => x.fn()); },
    api: voz.criar({
      frases: FRASES, nomes: { lula: 'Lula', flavio: 'Flávio' },
      criarAudio: (url) => ({ url, volume: 1, onerror: null, play() { reg.tocados.push(url); if (!existentes.has(url)) { const self = this; return Promise.reject(new Error('404')).catch((e) => { if (self.onerror) self.onerror(); throw e; }); } return Promise.resolve(); } }),
      sintetizar: (texto) => reg.sintetizados.push(texto),
      aoBalao: (b) => reg.baloes.push(b),
      agora: () => t,
      agendar: (fn, ms) => reg.timers.push({ fn, em: t + ms }),
      aleatorio: () => 0.5,
      intervaloMs: 4000,
    }),
  };
  return env;
}
const tick = () => new Promise((r) => setImmediate(r));

test('mp3 existente toca e nao sintetiza', async () => {
  const env = ambiente({ existentes: ['audios/lula-a.mp3', 'audios/lula-b.mp3', 'audios/lula-c.mp3'] });
  env.api.falar({ personagem: 'lula' });
  await tick();
  assert.equal(env.reg.tocados.length, 1);
  assert.equal(env.reg.sintetizados.length, 0);
  assert.equal(env.reg.baloes[0].nome, 'Lula');
});

test('sem mp3 cai para voz sintetizada com o texto', async () => {
  const env = ambiente();
  env.api.falar({ personagem: 'lula', gatilho: 'L' });
  await tick(); await tick();
  assert.deepEqual(env.reg.sintetizados, ['Faz o L']);
  assert.equal(env.reg.baloes[0].texto, 'Faz o L');
});

test('somenteAudio sem arquivo: so balao com o nome', async () => {
  const env = ambiente();
  env.api.falar({ personagem: 'flavio' });
  await tick(); await tick();
  assert.equal(env.reg.sintetizados.length, 0);
  assert.equal(env.reg.baloes.length, 1);
  assert.equal(env.reg.baloes[0].nome, 'Flávio');
  assert.equal(env.reg.baloes[0].texto, '');
});

test('intervalo de 4 s: a fala mais recente substitui a pendente', async () => {
  const env = ambiente();
  env.api.falar({ personagem: 'lula' });
  env.avancar(1000);
  env.api.falar({ personagem: 'lula' });
  env.api.falar({ personagem: 'flavio' });
  assert.equal(env.reg.baloes.length, 1, 'segunda e terceira ficam pendentes');
  env.avancar(3000);
  await tick();
  assert.equal(env.reg.baloes.length, 2);
  assert.equal(env.reg.baloes[1].personagem, 'flavio', 'a mais recente venceu');
});

test('rotacao nao repete ate esgotar', () => {
  const env = ambiente();
  const ids = [];
  for (let i = 0; i < 3; i++) { env.api.falar({ personagem: 'lula' }); env.avancar(5000); }
  env.api.estado.historico.forEach((h) => ids.push(h.frase.id));
  assert.deepEqual([...new Set(ids)].length, 3);
});

test('gatilho sem frase cai em match; mudo mostra balao sem som', async () => {
  const env = ambiente();
  env.api.mudo(true);
  env.api.falar({ personagem: 'lula', gatilho: 'estado' });
  await tick();
  assert.equal(env.reg.baloes.length, 1);
  assert.ok(['A', 'B', 'C'].includes(env.reg.baloes[0].texto));
  assert.equal(env.reg.tocados.length, 0);
  assert.equal(env.reg.sintetizados.length, 0);
});

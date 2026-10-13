const test = require('node:test');
const assert = require('node:assert/strict');
const estados = require('../dados/estados');
const mapa = require('../src/mapa');

function progressoFalso(atual, obras, concluido) {
  return { estadoAtual: () => atual, obrasDe: (uf) => obras[uf] || 0, concluiuTudo: () => !!concluido };
}

test('classesDoEstado: atual, bloqueado, concluido', () => {
  const p = progressoFalso('PB', { PE: 3, PB: 1 });
  assert.deepEqual(mapa.classesDoEstado('PE', p, estados), ['estado', 'nivel-3']);
  assert.deepEqual(mapa.classesDoEstado('PB', p, estados), ['estado', 'nivel-1', 'atual']);
  assert.deepEqual(mapa.classesDoEstado('RN', p, estados), ['estado', 'nivel-0', 'bloqueado']);
  const fim = progressoFalso('RS', { RS: 3 }, true);
  assert.deepEqual(mapa.classesDoEstado('RS', fim, estados), ['estado', 'nivel-3']);
});

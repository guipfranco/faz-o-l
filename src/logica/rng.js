(function (raiz) {
  'use strict';
  const M = {};

  // mulberry32: rapido, deterministico, bom o bastante para um jogo
  M.criar = function (seed) { return { s: (seed >>> 0) || 0x9e3779b9 }; };

  M.proximo = function (r) {
    r.s = (r.s + 0x6d2b79f5) >>> 0;
    let t = r.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  M.inteiro = function (r, min, maxExclusivo) {
    return min + Math.floor(M.proximo(r) * (maxExclusivo - min));
  };

  M.escolher = function (r, lista) { return lista[M.inteiro(r, 0, lista.length)]; };

  M.embaralhar = function (r, lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = M.inteiro(r, 0, i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.rng = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

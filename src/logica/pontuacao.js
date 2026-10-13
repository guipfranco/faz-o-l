(function (raiz) {
  'use strict';
  const M = {};
  M.PONTOS = { comum: 60, especial: 120, obstaculo: 300, chefe: 500 };

  M.estrelasPorPontos = function (pontos, limiares) {
    return limiares.filter((x) => pontos >= x).length;
  };

  M.estrelas = function (pontos, limiares, contadorL, venceu) {
    if (!venceu) return 0;
    let n = Math.max(1, M.estrelasPorPontos(pontos, limiares));
    if (contadorL >= 3) n += 1;
    return n;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.pontuacao = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

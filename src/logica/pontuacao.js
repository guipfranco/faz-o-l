(function (raiz) {
  'use strict';
  const M = {};
  M.PONTOS = { comum: 60, especial: 120, obstaculo: 300, chefe: 500 };

  M.estrelasPorPontos = function (pontos, limiares) {
    return limiares.filter((x) => pontos >= x).length;
  };

  // Vitória vale no mínimo 1 estrela; a nota é a melhor entre pontos e jogadas que sobraram
  // (antes do bônus final). +1 por ativar 3 L na fase, até 4.
  M.estrelasPorJogadas = function (jogadasRestantes, jogadasTotais) {
    const fracao = jogadasTotais > 0 && jogadasRestantes > 0 ? jogadasRestantes / jogadasTotais : 0;
    return fracao >= 0.5 ? 3 : fracao >= 0.25 ? 2 : 1;
  };

  M.estrelas = function (pontos, limiares, contadorL, venceu, jogadasRestantes, jogadasTotais) {
    if (!venceu) return 0;
    const porPontos = Math.max(1, M.estrelasPorPontos(pontos, limiares));
    let n = Math.max(porPontos, M.estrelasPorJogadas(jogadasRestantes, jogadasTotais));
    if (contadorL >= 3) n += 1;
    return Math.min(4, n);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.pontuacao = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

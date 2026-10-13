(function (raiz) {
  'use strict';
  const M = {};
  const QUATRO = ['lula', 'alckmin', 'marina', 'boulos'];
  const CINCO = ['lula', 'alckmin', 'marina', 'boulos', 'dilma'];
  const gel = (l, c, camadas) => Object.assign({ tipo: 'gelatina', l, c }, camadas ? { camadas } : {});
  const linhaGel = (l, c0, c1, camadas) => { const out = []; for (let c = c0; c <= c1; c++) out.push(gel(l, c, camadas)); return out; };
  const mascaraL = (tam) => Array.from({ length: tam }, (_, l) => Array.from({ length: tam }, (_, c) => c < 3 || l >= tam - 3));

  M.manuais = [
    { numero: 1, linhas: 7, colunas: 7, jogadas: 20, pecas: QUATRO, obstaculos: [],
      objetivos: [{ tipo: 'pontos', alvo: 4000 }], limiares: [4000, 6000, 9000],
      dica: 'Troque duas peças vizinhas para juntar 3 iguais.' },
    { numero: 2, linhas: 8, colunas: 8, jogadas: 20, pecas: QUATRO, obstaculos: [],
      objetivos: [{ tipo: 'coletar', peca: 'lula', alvo: 12 }], limiares: [1800, 3000, 4500],
      dica: 'Junte 12 Lulas. Peças limpas por especiais também contam.' },
    { numero: 3, linhas: 8, colunas: 8, jogadas: 22, pecas: CINCO, obstaculos: [],
      objetivos: [{ tipo: 'pontos', alvo: 6000 }], limiares: [6000, 9000, 13000],
      dica: '4 em linha criam uma peça listrada: ela limpa a linha ou a coluna inteira.' },
    { numero: 4, linhas: 8, colunas: 8, jogadas: 22, pecas: CINCO, obstaculos: [],
      objetivos: [{ tipo: 'coletar', peca: 'marina', alvo: 15 }], limiares: [2500, 4000, 6000],
      dica: 'Forme um L com 5 peças para criar O L. Ele limpa linha e coluna e vale o dobro!' },
    { numero: 5, linhas: 8, colunas: 8, jogadas: 22, pecas: CINCO,
      obstaculos: [...linhaGel(3, 2, 4), ...linhaGel(4, 2, 4)],
      objetivos: [{ tipo: 'limparGelatina', alvo: 6 }], limiares: [2500, 4000, 6000],
      dica: 'A Damares espalhou gelatina. Faça matches em cima dela para limpar.' },
    { numero: 6, linhas: 8, colunas: 8, jogadas: 22, pecas: CINCO, mascara: mascaraL(8), obstaculos: [],
      objetivos: [{ tipo: 'pontos', alvo: 7000 }], limiares: [7000, 10000, 14000],
      dica: 'Um tabuleiro em forma de L. As peças só caem onde há casa.' },
    { numero: 7, linhas: 8, colunas: 8, jogadas: 24, pecas: CINCO,
      obstaculos: [...linhaGel(2, 1, 6), ...linhaGel(5, 1, 6)],
      objetivos: [{ tipo: 'limparGelatina', alvo: 12 }], limiares: [3500, 5500, 8000],
      dica: 'Duas faixas de gelatina. Peças listradas ajudam muito aqui.' },
    { numero: 8, linhas: 8, colunas: 8, jogadas: 25, pecas: CINCO, obstaculos: [],
      objetivos: [{ tipo: 'coletar', peca: 'boulos', alvo: 18 }, { tipo: 'coletar', peca: 'dilma', alvo: 18 }], limiares: [4000, 6500, 9000],
      dica: 'Dois objetivos: 18 Boulos e 18 Dilmas.' },
    { numero: 9, linhas: 8, colunas: 8, jogadas: 24, pecas: CINCO,
      obstaculos: linhaGel(3, 0, 7, 2),
      objetivos: [{ tipo: 'limparGelatina', alvo: 16 }], limiares: [4000, 6500, 9000],
      dica: 'Gelatina dupla: cada casa precisa de dois matches.' },
    { numero: 10, linhas: 9, colunas: 9, jogadas: 26, pecas: CINCO,
      obstaculos: [gel(2, 2), gel(2, 6), gel(6, 2), gel(6, 6), gel(4, 4), gel(4, 3), gel(4, 5), gel(3, 4), gel(5, 4), gel(0, 4)],
      objetivos: [{ tipo: 'pontos', alvo: 12000 }, { tipo: 'limparGelatina', alvo: 10 }], limiares: [12000, 16000, 22000],
      dica: 'Tabuleiro 9x9. Faça 3 L na mesma fase e ganhe uma estrela extra!' },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.dados.fases = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

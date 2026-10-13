(function (raiz) {
  'use strict';
  const dep = (nome) => (typeof require === 'function' ? require('./' + nome) : raiz.FazOL.logica[nome]);
  const rng = dep('rng');
  const matches = dep('matches');
  const M = {};

  M.criar = function (def, r) {
    const linhas = def.linhas, colunas = def.colunas;
    const mascara = def.mascara || Array.from({ length: linhas }, () => Array(colunas).fill(true));
    const celulas = mascara.map((lin) => lin.map((ok) => (ok ? matches.novaCelula() : null)));
    return {
      linhas, colunas, mascara, celulas,
      pecas: (def.pecas || matches.PECAS).slice(),
      jogadasRestantes: def.jogadas,
      objetivos: def.objetivos.map((o) => Object.assign({}, o, { atual: 0 })),
      limiares: def.limiares.slice(),
      pontos: 0, contadorL: 0, status: 'jogando', rng: r, chefe: null,
    };
  };

  function livre(cel) { return cel && !cel.bloco; }

  M.preencherInicial = function (estado) {
    const { celulas, linhas, colunas, pecas } = estado;
    for (let l = 0; l < linhas; l++) for (let c = 0; c < colunas; c++) {
      const cel = celulas[l][c];
      if (!livre(cel) || cel.peca) continue;
      const proibidas = new Set();
      const e1 = c >= 1 && celulas[l][c - 1], e2 = c >= 2 && celulas[l][c - 2];
      if (e1 && e2 && e1.peca && e1.peca === e2.peca) proibidas.add(e1.peca);
      const n1 = l >= 1 && celulas[l - 1][c], n2 = l >= 2 && celulas[l - 2][c];
      if (n1 && n2 && n1.peca && n1.peca === n2.peca) proibidas.add(n1.peca);
      const opcoes = pecas.filter((p) => !proibidas.has(p));
      cel.peca = rng.escolher(estado.rng, opcoes.length ? opcoes : pecas);
    }
  };

  M.gravidade = function (estado) {
    const { celulas, linhas, colunas } = estado;
    const movimentos = [];
    for (let c = 0; c < colunas; c++) {
      let destino = linhas - 1;
      for (let l = linhas - 1; l >= 0; l--) {
        const cel = celulas[l][c];
        if (!cel || cel.bloco || cel.corrente) { destino = l - 1; continue; }
        if (cel.peca === null) continue;
        if (l !== destino) {
          const alvo = celulas[destino][c];
          alvo.peca = cel.peca; alvo.especial = cel.especial;
          cel.peca = null; cel.especial = null;
          movimentos.push({ de: { l, c }, para: { l: destino, c } });
        }
        destino--;
      }
    }
    return movimentos;
  };

  M.preencher = function (estado) {
    const { celulas, linhas, colunas, pecas } = estado;
    const novas = [];
    for (let c = 0; c < colunas; c++) for (let l = 0; l < linhas; l++) {
      const cel = celulas[l][c];
      if (!livre(cel) || cel.peca !== null) continue;
      cel.peca = rng.escolher(estado.rng, pecas);
      cel.especial = null;
      novas.push({ l, c, peca: cel.peca });
    }
    return novas;
  };

  M.trocar = function (estado, a, b) {
    const ca = estado.celulas[a.l][a.c], cb = estado.celulas[b.l][b.c];
    const p = ca.peca, e = ca.especial;
    ca.peca = cb.peca; ca.especial = cb.especial;
    cb.peca = p; cb.especial = e;
  };

  M.embaralhar = function (estado) {
    const moveis = [];
    estado.celulas.forEach((lin, l) => lin.forEach((cel, c) => {
      if (cel && cel.peca && !cel.bloco && !cel.corrente) moveis.push({ l, c });
    }));
    for (let tentativa = 0; tentativa < 200; tentativa++) {
      const conteudo = rng.embaralhar(estado.rng, moveis.map(({ l, c }) => ({ peca: estado.celulas[l][c].peca, especial: estado.celulas[l][c].especial })));
      moveis.forEach(({ l, c }, i) => { estado.celulas[l][c].peca = conteudo[i].peca; estado.celulas[l][c].especial = conteudo[i].especial; });
      if (matches.encontrarGrupos(estado.celulas).length === 0 && matches.temJogada(estado.celulas)) return true;
    }
    return false;
  };

  M.garantirJogada = function (estado) {
    if (matches.temJogada(estado.celulas)) return true;
    return M.embaralhar(estado);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.tabuleiro = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

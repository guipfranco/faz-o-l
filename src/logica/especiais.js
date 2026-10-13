(function (raiz) {
  'use strict';
  const dep = (nome) => (typeof require === 'function' ? require('./' + nome) : raiz.FazOL.logica[nome]);
  const rng = dep('rng');
  const M = {};

  M.TIPOS = ['listradaH', 'listradaV', 'bomba', 'L', 'estrela'];

  M.especialPorForma = function (forma, direcao, r) {
    switch (forma) {
      case 'linha4':
        if (direcao === 'h') return 'listradaH';
        if (direcao === 'v') return 'listradaV';
        return rng.proximo(r) < 0.5 ? 'listradaH' : 'listradaV';
      case 'T': return 'bomba';
      case 'L': return 'L';
      case 'linha5': return 'estrela';
      default: return null;
    }
  };

  function existe(estado, l, c) {
    return l >= 0 && l < estado.linhas && c >= 0 && c < estado.colunas && estado.celulas[l][c] !== null;
  }
  function linha(estado, l) {
    const out = [];
    if (l < 0 || l >= estado.linhas) return out;
    for (let c = 0; c < estado.colunas; c++) if (existe(estado, l, c)) out.push({ l, c });
    return out;
  }
  function coluna(estado, c) {
    const out = [];
    if (c < 0 || c >= estado.colunas) return out;
    for (let l = 0; l < estado.linhas; l++) if (existe(estado, l, c)) out.push({ l, c });
    return out;
  }
  function quadrado(estado, l, c, raio) {
    const out = [];
    for (let dl = -raio; dl <= raio; dl++) for (let dc = -raio; dc <= raio; dc++) if (existe(estado, l + dl, c + dc)) out.push({ l: l + dl, c: c + dc });
    return out;
  }
  function todasDaCor(estado, peca) {
    const out = [];
    estado.celulas.forEach((lin, l) => lin.forEach((cel, c) => { if (cel && !cel.bloco && cel.peca === peca) out.push({ l, c }); }));
    return out;
  }
  function todas(estado) {
    const out = [];
    estado.celulas.forEach((lin, l) => lin.forEach((cel, c) => { if (cel) out.push({ l, c }); }));
    return out;
  }
  function unir(listas) {
    const vistos = new Set(), out = [];
    for (const lista of listas) for (const p of lista) { const k = p.l + ',' + p.c; if (!vistos.has(k)) { vistos.add(k); out.push({ l: p.l, c: p.c }); } }
    return out;
  }
  function corMaisComum(estado) {
    const cont = {};
    estado.celulas.forEach((lin) => lin.forEach((cel) => { if (cel && cel.peca && !cel.bloco) cont[cel.peca] = (cont[cel.peca] || 0) + 1; }));
    let melhor = null;
    for (const p of Object.keys(cont)) if (melhor === null || cont[p] > cont[melhor]) melhor = p;
    return melhor;
  }

  M.areaDeAtivacao = function (estado, l, c, especial, pecaAlvo) {
    switch (especial) {
      case 'listradaH': return { celulas: linha(estado, l), fator: 1 };
      case 'listradaV': return { celulas: coluna(estado, c), fator: 1 };
      case 'bomba': return { celulas: quadrado(estado, l, c, 1), fator: 1 };
      case 'L': return { celulas: unir([linha(estado, l), coluna(estado, c)]), fator: 2 };
      case 'estrela': {
        const alvo = pecaAlvo || corMaisComum(estado);
        return { celulas: unir([alvo ? todasDaCor(estado, alvo) : [], [{ l, c }]]), fator: 1 };
      }
      default: return { celulas: [{ l, c }], fator: 1 };
    }
  };

  const ehListrada = (x) => x === 'listradaH' || x === 'listradaV';

  M.tipoDeCombo = function (a, b) {
    if (a === 'estrela' && b === 'estrela') return 'limparTudo';
    if (a === 'estrela' || b === 'estrela') return (a === 'L' || b === 'L') ? 'LEstrela' : 'estrelaEspecial';
    if (a === 'L' && b === 'L') return 'duploL';
    if (a === 'bomba' && b === 'bomba') return 'area5';
    if (a === 'bomba' || b === 'bomba') return 'tresLinhasColunas';
    if (ehListrada(a) && ehListrada(b)) return 'linhaEColuna';
    return 'linhaEColuna'; // L + listrada
  };

  M.areaDoCombo = function (estado, posA, posB, tipo, pecaDoOutro, outroEspecial) {
    const centro = posB;
    switch (tipo) {
      case 'linhaEColuna': return { celulas: unir([linha(estado, centro.l), coluna(estado, centro.c)]), fator: 1 };
      case 'tresLinhasColunas': {
        const partes = [];
        for (let d = -1; d <= 1; d++) { partes.push(linha(estado, centro.l + d)); partes.push(coluna(estado, centro.c + d)); }
        return { celulas: unir(partes), fator: 1 };
      }
      case 'area5': return { celulas: quadrado(estado, centro.l, centro.c, 2), fator: 1 };
      case 'duploL': return { celulas: unir([linha(estado, posA.l), linha(estado, posB.l), coluna(estado, posA.c), coluna(estado, posB.c)]), fator: 2 };
      case 'LEstrela': {
        const alvos = todasDaCor(estado, pecaDoOutro);
        const partes = [];
        for (const p of alvos) { partes.push(linha(estado, p.l)); partes.push(coluna(estado, p.c)); }
        partes.push([posA, posB]);
        return { celulas: unir(partes), fator: 2 };
      }
      case 'estrelaEspecial': {
        const alvos = todasDaCor(estado, pecaDoOutro);
        const partes = alvos.map((p, i) => (outroEspecial === 'bomba' ? quadrado(estado, p.l, p.c, 1) : (i % 2 === 0 ? linha(estado, p.l) : coluna(estado, p.c))));
        partes.push([posA, posB]);
        return { celulas: unir(partes), fator: 1 };
      }
      case 'limparTudo': return { celulas: todas(estado), fator: 1 };
      default: return { celulas: unir([[posA, posB]]), fator: 1 };
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.especiais = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

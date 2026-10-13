(function (raiz) {
  'use strict';
  const dep = (nome) => (typeof require === 'function' ? require('./' + nome) : raiz.FazOL.logica[nome]);
  const rng = dep('rng');
  const matches = dep('matches');
  const estados = typeof require === 'function' ? require('../../dados/estados') : raiz.FazOL.dados.estados;
  const fases = typeof require === 'function' ? require('../../dados/fases') : raiz.FazOL.dados.fases;
  const M = {};

  M.TOTAL_FASES = estados.TOTAL_FASES;
  const DESBLOQUEIO = { gelatina: 5, fakenews: 12, corrente: 20, bolsonaro: 30, boiada: 45 };
  const MAXIMOS = { gelatina: 99, fakenews: 3, corrente: 4, bolsonaro: 4, boiada: 3 };
  const arred100 = (x) => Math.max(100, Math.round(x / 100) * 100);

  function clonar(x) { return JSON.parse(JSON.stringify(x)); }

  function escolherMascara(r, tam) {
    const tipo = rng.escolher(r, ['cantos', 'L', 'cruz']);
    return Array.from({ length: tam }, (_, l) => Array.from({ length: tam }, (_, c) => {
      const ult = tam - 1;
      if (tipo === 'cantos') return !((l === 0 || l === ult) && (c === 0 || c === ult));
      if (tipo === 'L') return c < 3 || l >= tam - 3;
      return !((l < 2 || l > ult - 2) && (c < 2 || c > ult - 2));
    }));
  }

  function gerar(n) {
    const r = rng.criar(n * 7919 + 17);
    const uf = estados.estadoDaFase(n);
    const d = Math.min(1, Math.max(0, (n - 10) / (M.TOTAL_FASES - 10)));
    const respiro = n % 5 === 0;
    const chefe = estados.ehFaseDeChefe(n);
    const tam = n > 50 ? 9 : 8;
    const def = { numero: n, estado: uf.sigla, seed: n, linhas: tam, colunas: tam, pecas: respiro ? matches.PECAS.slice(0, 4) : matches.PECAS.slice(), obstaculos: [], objetivos: [], dica: null };
    if (!chefe && rng.proximo(r) < 0.2) def.mascara = escolherMascara(r, tam);

    const ocupadas = new Set();
    const livre = (l, c) => (!def.mascara || def.mascara[l][c]) && !ocupadas.has(l + ',' + c);
    const posAleatoria = () => {
      for (let t = 0; t < 200; t++) { const l = rng.inteiro(r, 0, tam), c = rng.inteiro(r, 0, tam); if (livre(l, c)) { ocupadas.add(l + ',' + c); return { l, c }; } }
      return null;
    };

    if (chefe) {
      const vida = 8 + Math.round(6 * d);
      const c0 = Math.floor(tam / 2) - 1;
      for (let dl = 0; dl <= 1; dl++) for (let dc = 0; dc <= 1; dc++) ocupadas.add(dl + ',' + (c0 + dc));
      def.obstaculos.push({ tipo: 'chefe', l: 0, c: c0, vida });
      def.objetivos.push({ tipo: 'chefe', alvo: vida });
      def.dica = 'Chefe: Flávio. Faça matches encostados no bloco 2x2 para derrubar a vida dele. Especiais também acertam.';
    }

    const desbloqueados = Object.keys(DESBLOQUEIO).filter((t) => n >= DESBLOQUEIO[t]);
    const contagem = {};
    if (desbloqueados.length) {
      const tipos = rng.embaralhar(r, desbloqueados).slice(0, n > 25 ? 2 : 1);
      let qtd = Math.round((4 + 10 * d) * (respiro ? 0.5 : 1));
      if (chefe) qtd = Math.round(qtd / 2);
      for (let i = 0; i < qtd; i++) {
        let tipo = tipos[i % tipos.length];
        if ((contagem[tipo] || 0) >= MAXIMOS[tipo]) tipo = 'gelatina';
        const p = posAleatoria();
        if (!p) break;
        const o = { tipo, l: p.l, c: p.c };
        if (tipo === 'gelatina' && d > 0.4 && rng.proximo(r) < 0.3) o.camadas = 2;
        def.obstaculos.push(o);
        contagem[tipo] = (contagem[tipo] || 0) + 1;
      }
    }

    if (!chefe) {
      const opcoes = [];
      if (contagem.gelatina) opcoes.push('limparGelatina');
      if (contagem.boiada) opcoes.push('limparBoiada');
      if (contagem.fakenews) opcoes.push('limparFakeNews');
      if (contagem.bolsonaro) opcoes.push('quebrarBlocos');
      const deObstaculo = opcoes.slice();
      opcoes.push('pontos', 'coletar');
      const quantos = n > 25 && !respiro ? 2 : 1;
      const escolhidos = [];
      if (deObstaculo.length) escolhidos.push(rng.escolher(r, deObstaculo));
      for (const t of rng.embaralhar(r, opcoes)) { if (escolhidos.length >= quantos) break; if (!escolhidos.includes(t)) escolhidos.push(t); }
      for (const tipo of escolhidos) {
        if (tipo === 'pontos') def.objetivos.push({ tipo, alvo: arred100(2500 + 9000 * d) });
        else if (tipo === 'coletar') def.objetivos.push({ tipo, peca: rng.escolher(r, def.pecas), alvo: 15 + Math.round(25 * d) });
        else if (tipo === 'limparGelatina') def.objetivos.push({ tipo, alvo: def.obstaculos.filter((o) => o.tipo === 'gelatina').reduce((s, o) => s + (o.camadas || 1), 0) });
        else if (tipo === 'limparBoiada') def.objetivos.push({ tipo, alvo: contagem.boiada });
        else if (tipo === 'limparFakeNews') def.objetivos.push({ tipo, alvo: contagem.fakenews });
        else if (tipo === 'quebrarBlocos') def.objetivos.push({ tipo, alvo: contagem.bolsonaro });
      }
    }

    def.jogadas = Math.round(30 - 12 * d) + (respiro ? 5 : 0) + (def.objetivos.length === 2 ? 5 : 0) + (chefe ? 5 : 0);
    const objPontos = def.objetivos.find((o) => o.tipo === 'pontos');
    const base = objPontos ? objPontos.alvo : arred100(def.jogadas * 250 * (1 + d));
    def.limiares = [base, arred100(base * 1.6), arred100(base * 2.4)];
    return def;
  }

  M.obterFase = function (n) {
    const manual = fases.manuais.find((f) => f.numero === n);
    if (manual) {
      const def = clonar(manual);
      def.estado = estados.estadoDaFase(n).sigla;
      def.seed = n;
      return def;
    }
    if (n < 1 || n > M.TOTAL_FASES) return null;
    return gerar(n);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.geradorFases = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

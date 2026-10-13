(function (raiz) {
  'use strict';
  const M = {};

  M.PECAS = ['lula', 'alckmin', 'marina', 'boulos', 'dilma'];

  M.novaCelula = function () { return { peca: null, especial: null, gelatina: 0, corrente: false, bloco: null }; };

  M.chave = function (p) { return p.l + ',' + p.c; };

  M.vizinhos = function (l, c) {
    return [{ l: l - 1, c }, { l: l + 1, c }, { l, c: c - 1 }, { l, c: c + 1 }];
  };

  function pecaEm(celulas, l, c) {
    const linha = celulas[l];
    const x = linha && linha[c];
    return x && x.peca && !x.bloco ? x.peca : null;
  }

  function encontrarRuns(celulas) {
    const L = celulas.length, C = celulas[0].length;
    const runs = [];
    for (let l = 0; l < L; l++) {
      let c = 0;
      while (c < C) {
        const p = pecaEm(celulas, l, c);
        if (!p) { c++; continue; }
        let fim = c;
        while (fim + 1 < C && pecaEm(celulas, l, fim + 1) === p) fim++;
        if (fim - c + 1 >= 3) {
          const cels = [];
          for (let k = c; k <= fim; k++) cels.push({ l, c: k });
          runs.push({ peca: p, dir: 'h', celulas: cels });
        }
        c = fim + 1;
      }
    }
    for (let c = 0; c < C; c++) {
      let l = 0;
      while (l < L) {
        const p = pecaEm(celulas, l, c);
        if (!p) { l++; continue; }
        let fim = l;
        while (fim + 1 < L && pecaEm(celulas, fim + 1, c) === p) fim++;
        if (fim - l + 1 >= 3) {
          const cels = [];
          for (let k = l; k <= fim; k++) cels.push({ l: k, c });
          runs.push({ peca: p, dir: 'v', celulas: cels });
        }
        l = fim + 1;
      }
    }
    return runs;
  }

  function ehPonta(run, cel) {
    const a = run.celulas[0], b = run.celulas[run.celulas.length - 1];
    return (a.l === cel.l && a.c === cel.c) || (b.l === cel.l && b.c === cel.c);
  }

  function meio(run) {
    const m = run.celulas[Math.floor(run.celulas.length / 2)];
    return { l: m.l, c: m.c };
  }

  function classificar(runs) {
    if (runs.some((r) => r.celulas.length >= 5)) return { forma: 'linha5', canto: meio(runs[0]) };
    if (runs.length === 1) {
      const n = runs[0].celulas.length;
      return { forma: n === 4 ? 'linha4' : 'linha3', canto: meio(runs[0]) };
    }
    const hs = runs.filter((r) => r.dir === 'h'), vs = runs.filter((r) => r.dir === 'v');
    for (const h of hs) for (const v of vs) {
      const inter = h.celulas.find((x) => v.celulas.some((y) => y.l === x.l && y.c === x.c));
      if (!inter) continue;
      const forma = ehPonta(h, inter) && ehPonta(v, inter) ? 'L' : 'T';
      return { forma, canto: { l: inter.l, c: inter.c } };
    }
    return { forma: 'T', canto: meio(runs[0]) };
  }

  M.encontrarGrupos = function (celulas) {
    const runs = encontrarRuns(celulas);
    const dono = new Map();
    const grupos = [];
    for (const run of runs) {
      const ids = new Set();
      for (const cel of run.celulas) { const g = dono.get(M.chave(cel)); if (g !== undefined) ids.add(g); }
      let grupo;
      if (ids.size === 0) { grupo = { peca: run.peca, runs: [], celulas: new Map() }; grupos.push(grupo); }
      else {
        const lista = [...ids];
        grupo = grupos[lista[0]];
        for (const outro of lista.slice(1)) {
          const g2 = grupos[outro];
          grupo.runs.push(...g2.runs);
          for (const [k, v] of g2.celulas) grupo.celulas.set(k, v);
          grupos[outro] = null;
        }
      }
      grupo.runs.push(run);
      for (const cel of run.celulas) grupo.celulas.set(M.chave(cel), cel);
      const idx = grupos.indexOf(grupo);
      for (const k of grupo.celulas.keys()) dono.set(k, idx);
    }
    return grupos.filter(Boolean).map((g) => {
      const cls = classificar(g.runs);
      return { peca: g.peca, celulas: [...g.celulas.values()], forma: cls.forma, canto: cls.canto };
    });
  };

  M.podeTrocar = function (celulas, a, b) {
    if (Math.abs(a.l - b.l) + Math.abs(a.c - b.c) !== 1) return false;
    const ca = celulas[a.l] && celulas[a.l][a.c], cb = celulas[b.l] && celulas[b.l][b.c];
    if (!ca || !cb) return false;
    if (!ca.peca || !cb.peca) return false;
    if (ca.bloco || cb.bloco || ca.corrente || cb.corrente) return false;
    return true;
  };

  function trocar(celulas, a, b) {
    const t = celulas[a.l][a.c]; celulas[a.l][a.c] = celulas[b.l][b.c]; celulas[b.l][b.c] = t;
  }

  M.ehJogadaValida = function (celulas, a, b) {
    if (!M.podeTrocar(celulas, a, b)) return false;
    const ca = celulas[a.l][a.c], cb = celulas[b.l][b.c];
    if (ca.especial && cb.especial) return true;
    if (ca.especial === 'estrela' || cb.especial === 'estrela') return true;
    trocar(celulas, a, b);
    const ok = M.encontrarGrupos(celulas).length > 0;
    trocar(celulas, a, b);
    return ok;
  };

  M.encontrarJogada = function (celulas) {
    const L = celulas.length, C = celulas[0].length;
    for (let l = 0; l < L; l++) for (let c = 0; c < C; c++) {
      const a = { l, c };
      for (const b of [{ l, c: c + 1 }, { l: l + 1, c }]) {
        if (b.l >= L || b.c >= C) continue;
        if (M.ehJogadaValida(celulas, a, b)) return { a, b };
      }
    }
    return null;
  };

  M.temJogada = function (celulas) { return M.encontrarJogada(celulas) !== null; };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.matches = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

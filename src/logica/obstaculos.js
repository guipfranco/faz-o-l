(function (raiz) {
  'use strict';
  const dep = (nome) => (typeof require === 'function' ? require('./' + nome) : raiz.FazOL.logica[nome]);
  const rng = dep('rng');
  const matches = dep('matches');
  const M = {};

  M.PERSONAGEM = { bolsonaro: 'bolsonaro', boiada: 'salles', fakenews: 'fakenews', chefe: 'flavio', gelatina: 'damares', corrente: 'pazuello' };

  function celulaEm(estado, l, c) { const lin = estado.celulas[l]; return lin ? lin[c] || null : null; }

  function bloquear(cel, bloco) {
    cel.peca = null; cel.especial = null; cel.gelatina = 0; cel.corrente = false; cel.bloco = bloco;
  }

  M.colocar = function (estado, lista) {
    for (const o of lista) {
      const cel = celulaEm(estado, o.l, o.c);
      if (!cel) continue;
      switch (o.tipo) {
        case 'gelatina': cel.gelatina = o.camadas || 1; break;
        case 'corrente': cel.corrente = true; break;
        case 'bolsonaro': bloquear(cel, { tipo: 'bolsonaro', vida: 2 }); break;
        case 'boiada': bloquear(cel, { tipo: 'boiada', vida: 1 }); break;
        case 'fakenews': bloquear(cel, { tipo: 'fakenews', vida: 1, contador: 0 }); break;
        case 'chefe': {
          const vida = o.vida || 10;
          const chefe = { tipo: 'chefe', vida, vidaMax: vida, l: o.l, c: o.c, jogadasAteAtaque: 3 };
          estado.chefe = chefe;
          for (let dl = 0; dl <= 1; dl++) for (let dc = 0; dc <= 1; dc++) {
            const cc = celulaEm(estado, o.l + dl, o.c + dc);
            if (cc) bloquear(cc, chefe);
          }
          break;
        }
        default: break;
      }
    }
  };

  function removerChefe(estado, chefe) {
    estado.celulas.forEach((lin) => lin.forEach((cel) => { if (cel && cel.bloco === chefe) cel.bloco = null; }));
  }

  M.golpe = function (estado, l, c, forca) {
    const cel = celulaEm(estado, l, c);
    if (!cel || !cel.bloco) return null;
    const b = cel.bloco;
    forca = forca || 1;
    if (b.tipo === 'chefe') {
      b.vida = Math.max(0, b.vida - forca);
      const destruido = b.vida === 0;
      if (destruido) removerChefe(estado, b);
      return { tipo: 'chefe', destruido, vida: b.vida };
    }
    b.vida -= 1;
    const destruido = b.vida <= 0;
    if (destruido) cel.bloco = null;
    return { tipo: b.tipo, destruido, vida: Math.max(0, b.vida) };
  };

  M.golpeAdjacente = function (estado, l, c) {
    const cel = celulaEm(estado, l, c);
    if (!cel) return null;
    if (cel.corrente) { cel.corrente = false; return { tipo: 'corrente', destruido: true }; }
    if (cel.bloco) return M.golpe(estado, l, c, 1);
    return null;
  };

  function posicoesDeBloco(estado, tipo) {
    const out = [];
    estado.celulas.forEach((lin, l) => lin.forEach((cel, c) => { if (cel && cel.bloco && cel.bloco.tipo === tipo) out.push({ l, c }); }));
    return out;
  }

  function vizinhosLivres(estado, l, c) {
    return matches.vizinhos(l, c).filter((v) => {
      const x = celulaEm(estado, v.l, v.c);
      return x && !x.bloco && !x.corrente && !x.especial && x.peca;
    });
  }

  M.espalharBoiada = function (estado, destruiuBoiada) {
    if (destruiuBoiada) return null;
    const opcoes = [];
    for (const b of posicoesDeBloco(estado, 'boiada')) for (const v of vizinhosLivres(estado, b.l, b.c)) opcoes.push(v);
    if (!opcoes.length) return null;
    const alvo = rng.escolher(estado.rng, opcoes);
    bloquear(celulaEm(estado, alvo.l, alvo.c), { tipo: 'boiada', vida: 1 });
    return { l: alvo.l, c: alvo.c };
  };

  M.avancarFakeNews = function (estado) {
    const novas = [];
    for (const p of posicoesDeBloco(estado, 'fakenews')) {
      const b = celulaEm(estado, p.l, p.c).bloco;
      b.contador = (b.contador || 0) + 1;
      if (b.contador < 2) continue;
      b.contador = 0;
      const livres = vizinhosLivres(estado, p.l, p.c);
      if (!livres.length) continue;
      const alvo = rng.escolher(estado.rng, livres);
      bloquear(celulaEm(estado, alvo.l, alvo.c), { tipo: 'fakenews', vida: 1, contador: 0 });
      novas.push({ l: alvo.l, c: alvo.c, origem: { l: p.l, c: p.c } });
    }
    return novas;
  };

  M.turnoChefe = function (estado) {
    const ch = estado.chefe;
    if (!ch || ch.vida <= 0) return null;
    ch.jogadasAteAtaque -= 1;
    if (ch.jogadasAteAtaque > 0) return null;
    ch.jogadasAteAtaque = 3;
    const candidatas = [];
    estado.celulas.forEach((lin, l) => lin.forEach((cel, c) => { if (cel && cel.peca && !cel.bloco && !cel.especial && !cel.corrente) candidatas.push({ l, c, cel }); }));
    if (!candidatas.length) return null;
    if (rng.proximo(estado.rng) < 0.5) {
      const semGel = candidatas.filter((x) => x.cel.gelatina === 0);
      const alvo = rng.escolher(estado.rng, semGel.length ? semGel : candidatas);
      alvo.cel.gelatina = Math.min(2, alvo.cel.gelatina + 1);
      return { tipo: 'gelatina', l: alvo.l, c: alvo.c };
    }
    const alvo = rng.escolher(estado.rng, candidatas);
    bloquear(alvo.cel, { tipo: 'fakenews', vida: 1, contador: 0 });
    return { tipo: 'fakenews', l: alvo.l, c: alvo.c };
  };

  M.contar = function (estado, tipo) {
    if (tipo === 'chefe') return estado.chefe ? estado.chefe.vida : 0;
    let n = 0;
    estado.celulas.forEach((lin) => lin.forEach((cel) => {
      if (!cel) return;
      if (tipo === 'gelatina') n += cel.gelatina;
      else if (tipo === 'corrente') n += cel.corrente ? 1 : 0;
      else if (cel.bloco && cel.bloco.tipo === tipo) n += 1;
    }));
    return n;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.obstaculos = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

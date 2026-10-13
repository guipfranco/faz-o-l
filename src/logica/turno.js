(function (raiz) {
  'use strict';
  const dep = (nome) => (typeof require === 'function' ? require('./' + nome) : raiz.FazOL.logica[nome]);
  const rng = dep('rng');
  const matches = dep('matches');
  const tabuleiro = dep('tabuleiro');
  const especiais = dep('especiais');
  const obstaculos = dep('obstaculos');
  const pontuacao = dep('pontuacao');
  const M = {};

  function celulaEm(estado, p) { const lin = estado.celulas[p.l]; return lin ? lin[p.c] || null : null; }

  M.iniciarFase = function (def, seed) {
    const s = seed !== undefined ? seed : (def.seed !== undefined ? def.seed : (def.numero || 1));
    const estado = tabuleiro.criar(def, rng.criar(s));
    estado.numero = def.numero;
    estado.def = def;
    obstaculos.colocar(estado, def.obstaculos || []);
    tabuleiro.preencherInicial(estado);
    if (!tabuleiro.garantirJogada(estado)) throw new Error('fase sem jogada possivel: ' + def.numero);
    estado.jogadasRestantesAntesDoBonus = null;
    atualizarObjetivos(estado);
    return estado;
  };

  // mapa: chave -> {l, c, fator, origem:'match'|'especial'}
  function adicionar(mapa, p, fator, origem) {
    const k = matches.chave(p);
    const atual = mapa.get(k);
    if (!atual) mapa.set(k, { l: p.l, c: p.c, fator, origem });
    else { atual.fator = Math.max(atual.fator, fator); if (origem === 'match') atual.origem = 'match'; }
  }

  // Ativa em cadeia toda especial que esteja em uma célula marcada, somando suas áreas ao mapa.
  function ativarEmCadeia(estado, mapa, eventos) {
    const fila = [...mapa.values()];
    const ativados = new Set();
    while (fila.length) {
      const x = fila.pop();
      const k = matches.chave(x);
      if (ativados.has(k)) continue;
      const cel = celulaEm(estado, x);
      if (!cel || !cel.especial) continue;
      ativados.add(k);
      const esp = cel.especial;
      const area = especiais.areaDeAtivacao(estado, x.l, x.c, esp, cel.peca);
      cel.especial = null;
      if (esp === 'L') estado.contadorL += 1;
      eventos.push({ tipo: 'especialAtivado', especial: esp, l: x.l, c: x.c, peca: cel.peca, celulas: area.celulas });
      for (const y of area.celulas) {
        adicionar(mapa, y, area.fator, 'especial');
        const cy = celulaEm(estado, y);
        if (cy && cy.especial && !ativados.has(matches.chave(y))) fila.push(y);
      }
    }
  }

  function registrarGolpe(estado, obst, r, l, c) {
    obst.push(Object.assign({ l, c }, r));
    if (r.tipo === 'chefe') return pontuacao.PONTOS.chefe;
    if (r.destruido && r.tipo !== 'corrente') return pontuacao.PONTOS.obstaculo;
    return 0;
  }

  function aplicarLimpeza(estado, mapa, eventos, cascata, extras) {
    let pontosRodada = 0, destruiuBoiada = false, chefeAtingido = false;
    const limpas = [], obst = (extras || []).slice();
    for (const x of mapa.values()) {
      const cel = celulaEm(estado, x);
      if (!cel) continue;
      if (cel.bloco) {
        if (cel.bloco.tipo === 'chefe') { if (chefeAtingido) continue; chefeAtingido = true; }
        const r = obstaculos.golpe(estado, x.l, x.c, 1);
        if (r) { pontosRodada += registrarGolpe(estado, obst, r, x.l, x.c); if (r.destruido && r.tipo === 'boiada') destruiuBoiada = true; }
        continue;
      }
      if (cel.peca === null) continue;
      if (cel.gelatina > 0) { cel.gelatina -= 1; obst.push({ tipo: 'gelatina', l: x.l, c: x.c, destruido: cel.gelatina === 0, vida: cel.gelatina }); }
      if (cel.corrente) { cel.corrente = false; obst.push({ tipo: 'corrente', l: x.l, c: x.c, destruido: true }); }
      limpas.push({ l: x.l, c: x.c, peca: cel.peca });
      pontosRodada += x.origem === 'match' ? pontuacao.PONTOS.comum : pontuacao.PONTOS.especial * x.fator;
      for (const o of estado.objetivos) if (o.tipo === 'coletar' && o.peca === cel.peca) o.atual += 1;
      cel.peca = null; cel.especial = null;
    }
    // golpes por adjacência: vizinhos de células limpas por match, uma vez por rodada
    const atingidos = new Set();
    for (const x of mapa.values()) {
      if (x.origem !== 'match') continue;
      for (const v of matches.vizinhos(x.l, x.c)) {
        const kv = matches.chave(v);
        if (mapa.has(kv) || atingidos.has(kv)) continue;
        const cv = celulaEm(estado, v);
        if (!cv || (!cv.bloco && !cv.corrente)) continue;
        if (cv.bloco && cv.bloco.tipo === 'chefe') { if (chefeAtingido) continue; chefeAtingido = true; }
        atingidos.add(kv);
        const r = obstaculos.golpeAdjacente(estado, v.l, v.c);
        if (r) { pontosRodada += registrarGolpe(estado, obst, r, v.l, v.c); if (r.destruido && r.tipo === 'boiada') destruiuBoiada = true; }
      }
    }
    const ganho = pontosRodada * Math.min(cascata, 5);
    estado.pontos += ganho;
    eventos.push({ tipo: 'limpar', celulas: limpas, obstaculos: obst, pontos: ganho, cascata });
    return { destruiuBoiada };
  }

  function assentar(estado, eventos) {
    const mov = tabuleiro.gravidade(estado);
    if (mov.length) eventos.push({ tipo: 'gravidade', movimentos: mov });
    const novas = tabuleiro.preencher(estado);
    if (novas.length) eventos.push({ tipo: 'preencher', novas });
  }

  function resolverCascatas(estado, eventos, grupos, areaInicial, movida, direcao) {
    let cascata = 1, destruiuBoiada = false;
    while (true) {
      const mapa = new Map();
      const criar = [];
      for (const grupo of grupos) {
        const esp = especiais.especialPorForma(grupo.forma, cascata === 1 ? direcao : null, estado.rng);
        let pos = null;
        if (esp) {
          const temMovida = movida && cascata === 1 && grupo.celulas.some((x) => x.l === movida.l && x.c === movida.c);
          pos = temMovida ? { l: movida.l, c: movida.c } : { l: grupo.canto.l, c: grupo.canto.c };
          criar.push({ l: pos.l, c: pos.c, especial: esp, peca: grupo.peca });
          const celPos = celulaEm(estado, pos);
          if (celPos && celPos.especial) adicionar(mapa, pos, 1, 'match');
        }
        eventos.push({ tipo: 'match', peca: grupo.peca, forma: grupo.forma, tamanho: grupo.celulas.length, celulas: grupo.celulas, cascata, especial: esp, l: pos ? pos.l : undefined, c: pos ? pos.c : undefined });
        for (const cel of grupo.celulas) if (!pos || cel.l !== pos.l || cel.c !== pos.c) adicionar(mapa, cel, 1, 'match');
      }
      if (areaInicial) { for (const cel of areaInicial.celulas) adicionar(mapa, cel, areaInicial.fator, 'especial'); areaInicial = null; }
      ativarEmCadeia(estado, mapa, eventos);
      const extras = [];
      for (const item of criar) {
        mapa.delete(matches.chave(item));
        const cg = celulaEm(estado, item);
        if (cg && cg.gelatina > 0) { cg.gelatina -= 1; extras.push({ tipo: 'gelatina', l: item.l, c: item.c, destruido: cg.gelatina === 0, vida: cg.gelatina }); }
      }
      const r = aplicarLimpeza(estado, mapa, eventos, cascata, extras);
      destruiuBoiada = destruiuBoiada || r.destruiuBoiada;
      for (const item of criar) {
        const cel = celulaEm(estado, item);
        cel.peca = item.peca; cel.especial = item.especial;
        eventos.push({ tipo: 'especialCriado', especial: item.especial, peca: item.peca, l: item.l, c: item.c });
      }
      assentar(estado, eventos);
      grupos = matches.encontrarGrupos(estado.celulas);
      cascata += 1;
      if (!grupos.length) break;
    }
    return { destruiuBoiada };
  }

  function atualizarObjetivos(estado) {
    const porTipo = { limparGelatina: 'gelatina', limparBoiada: 'boiada', limparFakeNews: 'fakenews', quebrarBlocos: 'bolsonaro', chefe: 'chefe' };
    for (const o of estado.objetivos) {
      if (o.tipo === 'pontos') o.atual = estado.pontos;
      else if (porTipo[o.tipo]) o.atual = Math.max(0, o.alvo - obstaculos.contar(estado, porTipo[o.tipo]));
    }
  }

  M.objetivosCumpridos = function (estado) { return estado.objetivos.every((o) => o.atual >= o.alvo); };

  function bonusFinal(estado, eventos) {
    let n = Math.min(estado.jogadasRestantes, 5);
    while (n-- > 0) {
      const antes = estado.pontos; const idx = eventos.length;
      const cand = [];
      estado.celulas.forEach((lin, l) => lin.forEach((cel, c) => { if (cel && cel.peca && !cel.especial && !cel.bloco && !cel.corrente) cand.push({ l, c }); }));
      if (!cand.length) break;
      const p = rng.escolher(estado.rng, cand);
      const esp = rng.proximo(estado.rng) < 0.5 ? 'listradaH' : 'listradaV';
      celulaEm(estado, p).especial = esp;
      eventos.push({ tipo: 'bonusJogada', l: p.l, c: p.c, especial: esp });
      const mapa = new Map();
      adicionar(mapa, p, 1, 'especial');
      ativarEmCadeia(estado, mapa, eventos);
      aplicarLimpeza(estado, mapa, eventos, 1);
      assentar(estado, eventos);
      const grupos = matches.encontrarGrupos(estado.celulas);
      if (grupos.length) resolverCascatas(estado, eventos, grupos, null, null, null);
      for (const ev of eventos.slice(idx)) if (ev.tipo === 'limpar') ev.pontos = Math.round(ev.pontos / 10);
      estado.pontos = antes + Math.round((estado.pontos - antes) / 10);
    }
    estado.jogadasRestantes = 0;
  }

  M.jogar = function (estado, a, b) {
    const eventos = [];
    if (estado.status !== 'jogando') return { valido: false, eventos };
    if (!matches.podeTrocar(estado.celulas, a, b)) return { valido: false, eventos };
    tabuleiro.trocar(estado, a, b);
    const movida = { l: b.l, c: b.c }, outra = { l: a.l, c: a.c };
    const celMovida = celulaEm(estado, movida), celOutra = celulaEm(estado, outra);
    const direcao = a.l === b.l ? 'h' : 'v';
    let grupos = [], areaInicial = null;

    if (celMovida.especial && celOutra.especial) {
      const tipo = especiais.tipoDeCombo(celMovida.especial, celOutra.especial);
      const naoEstrela = celMovida.especial === 'estrela' ? celOutra : celMovida;
      areaInicial = especiais.areaDoCombo(estado, outra, movida, tipo, naoEstrela.peca, naoEstrela.especial);
      estado.contadorL += [celMovida, celOutra].filter((x) => x.especial === 'L').length;
      eventos.push({ tipo: 'troca', a, b });
      eventos.push({ tipo: 'combo', combo: tipo, a: outra, b: movida, especiais: [celOutra.especial, celMovida.especial], peca: naoEstrela.peca, celulas: areaInicial.celulas });
      celMovida.especial = null; celOutra.especial = null;
    } else if (celMovida.especial === 'estrela' || celOutra.especial === 'estrela') {
      const posEstrela = celMovida.especial === 'estrela' ? movida : outra;
      const alvo = celMovida.especial === 'estrela' ? celOutra : celMovida;
      areaInicial = especiais.areaDeAtivacao(estado, posEstrela.l, posEstrela.c, 'estrela', alvo.peca);
      celulaEm(estado, posEstrela).especial = null;
      eventos.push({ tipo: 'troca', a, b });
      eventos.push({ tipo: 'especialAtivado', especial: 'estrela', l: posEstrela.l, c: posEstrela.c, peca: alvo.peca, celulas: areaInicial.celulas });
    } else {
      grupos = matches.encontrarGrupos(estado.celulas);
      if (!grupos.length) {
        tabuleiro.trocar(estado, a, b);
        eventos.push({ tipo: 'trocaInvalida', a, b });
        return { valido: false, eventos };
      }
      eventos.push({ tipo: 'troca', a, b });
    }

    estado.jogadasRestantes -= 1;
    const { destruiuBoiada } = resolverCascatas(estado, eventos, grupos, areaInicial, movida, direcao);

    const boi = obstaculos.espalharBoiada(estado, destruiuBoiada);
    if (boi) eventos.push({ tipo: 'boiadaEspalhou', l: boi.l, c: boi.c });
    for (const f of obstaculos.avancarFakeNews(estado)) eventos.push({ tipo: 'fakeNewsMultiplicou', l: f.l, c: f.c, origem: f.origem });
    const ataque = obstaculos.turnoChefe(estado);
    if (ataque) eventos.push({ tipo: 'chefeAtacou', ataque: ataque.tipo, l: ataque.l, c: ataque.c });

    atualizarObjetivos(estado);
    if (M.objetivosCumpridos(estado)) {
      estado.status = 'vitoria';
      estado.jogadasRestantesAntesDoBonus = estado.jogadasRestantes;
      bonusFinal(estado, eventos);
      atualizarObjetivos(estado);
    } else if (estado.jogadasRestantes <= 0) {
      estado.status = 'derrota';
    } else if (!matches.temJogada(estado.celulas)) {
      if (tabuleiro.embaralhar(estado)) eventos.push({ tipo: 'embaralhar' });
      else { estado.status = 'derrota'; eventos.push({ tipo: 'semJogadas' }); }
    }
    eventos.push({ tipo: 'fim', status: estado.status, pontos: estado.pontos, jogadasRestantes: estado.jogadasRestantes, estrelas: M.estrelas(estado) });
    return { valido: true, eventos };
  };

  M.estrelas = function (estado) {
    const total = estado.def ? estado.def.jogadas : undefined;
    return pontuacao.estrelas(estado.pontos, estado.limiares, estado.contadorL, estado.status === 'vitoria', estado.jogadasRestantesAntesDoBonus, total);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.logica.turno = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

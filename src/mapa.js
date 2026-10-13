(function (raiz) {
  'use strict';
  const M = {};

  M.classesDoEstado = function (sigla, progresso, estados) {
    const cls = ['estado', 'nivel-' + Math.min(3, progresso.obrasDe(sigla))];
    const atual = progresso.estadoAtual();
    if (sigla === atual && !progresso.concluiuTudo()) cls.push('atual');
    else if (estados.indice(sigla) > estados.indice(atual)) cls.push('bloqueado');
    return cls;
  };

  M.criar = function (o) {
    const NS = 'http://www.w3.org/2000/svg';
    const { raizEl, svgEl, painelEl, estrelasEl, confeteEl, mapaBr, estados, progresso, voz, aoJogarFase } = o;
    let selecionado = progresso.estadoAtual();
    const paths = {}, icones = {};

    function el(tag, attrs, pai) {
      const e = document.createElementNS(NS, tag);
      for (const k of Object.keys(attrs || {})) e.setAttribute(k, attrs[k]);
      if (pai) pai.appendChild(e);
      return e;
    }

    function montar() {
      svgEl.innerHTML = '';
      const svg = el('svg', { viewBox: mapaBr.viewBox, role: 'img', 'aria-label': 'Mapa do Brasil' }, svgEl);
      const defs = el('defs', {}, svg);
      const grad = el('linearGradient', { id: 'gradBR', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
      el('stop', { offset: '0%', 'stop-color': '#009c3b' }, grad);
      el('stop', { offset: '100%', 'stop-color': '#ffdf00' }, grad);
      for (const e of estados.lista) {
        const p = el('path', { id: 'uf-' + e.sigla, d: mapaBr.estados[e.sigla] }, svg);
        p.addEventListener('click', () => {
          if (estados.indice(e.sigla) <= estados.indice(progresso.estadoAtual())) selecionar(e.sigla);
        });
        paths[e.sigla] = p;
      }
      for (const e of estados.lista) {
        const [cx, cy] = mapaBr.centros[e.sigla];
        const t = el('text', { x: cx, y: cy - 2, class: 'sigla' }, svg);
        t.textContent = e.sigla;
        icones[e.sigla] = [0, 1, 2].map((i) => {
          const ic = el('text', { x: cx + (i - 1) * 9, y: cy + 9, class: 'icone-obra' }, svg);
          ic.textContent = e.obras[i].icone;
          ic.style.display = 'none';
          return ic;
        });
      }
    }

    function atualizar() {
      for (const e of estados.lista) {
        paths[e.sigla].setAttribute('class', M.classesDoEstado(e.sigla, progresso, estados).join(' '));
        const n = progresso.obrasDe(e.sigla);
        icones[e.sigla].forEach((ic, i) => { ic.style.display = i < n ? '' : 'none'; });
      }
      estrelasEl.textContent = '⭐ ' + progresso.estrelasDisponiveis();
      renderPainel();
    }

    function renderPainel() {
      const e = estados.porSigla[selecionado];
      if (!e) { painelEl.innerHTML = ''; return; }
      const obras = progresso.obrasDe(e.sigla);
      const atual = e.sigla === progresso.estadoAtual() && !progresso.concluiuTudo();
      let html = '<h2>' + e.nome + ' <small>(' + e.regiao + ')</small></h2>';
      html += '<div class="obras">' + e.obras.map((ob, i) => {
        if (i < obras) return '<span class="chip feita">' + ob.icone + ' ' + ob.nome + '</span>';
        if (i === obras && atual) return '<button class="chip botao-obra" data-uf="' + e.sigla + '" ' + (progresso.podeComprarObra(e.sigla) ? '' : 'disabled') + '>' + ob.icone + ' Construir ' + ob.nome + ' (3 ⭐)</button>';
        return '<span class="chip">' + ob.icone + ' ' + ob.nome + '</span>';
      }).join('') + '</div>';
      if (obras >= 3) html += '<p>✅ Estado reconstruído!</p>';
      html += '<div class="fases">';
      for (let n = e.faseInicial; n <= e.faseFinal; n++) {
        const estrelas = progresso.estrelasDaFase(n);
        const liberada = progresso.faseDesbloqueada(n);
        const chefe = estados.ehFaseDeChefe(n) ? ' 👑' : '';
        html += '<button class="fase-btn ' + (liberada ? 'liberada' : '') + '" data-fase="' + n + '" ' + (liberada ? '' : 'disabled') + '>' +
          'Fase ' + n + chefe + '<small>' + (estrelas ? '★'.repeat(Math.min(3, estrelas)) + (estrelas > 3 ? '+' : '') : (liberada ? 'jogar' : '🔒')) + '</small></button>';
      }
      html += '</div>';
      painelEl.innerHTML = html;
      painelEl.querySelectorAll('.botao-obra').forEach((b) => b.addEventListener('click', () => comprar(b.dataset.uf)));
      painelEl.querySelectorAll('.fase-btn:not([disabled])').forEach((b) => b.addEventListener('click', () => aoJogarFase(Number(b.dataset.fase))));
    }

    function comprar(uf) {
      const r = progresso.comprarObra(uf);
      if (!r) return;
      if (r.concluiuEstado) {
        confete();
        if (voz) voz.falar({ personagem: 'torcida', gatilho: 'estado' });
        if (r.proximo) selecionado = r.proximo;
      }
      atualizar();
    }

    function confete() {
      if (!confeteEl) return;
      confeteEl.hidden = false;
      confeteEl.innerHTML = '';
      const cores = ['#009c3b', '#ffdf00', '#c8102e', '#002776', '#ffffff'];
      for (let i = 0; i < 90; i++) {
        const d = document.createElement('div');
        d.className = 'papel';
        d.style.left = Math.random() * 100 + '%';
        d.style.background = cores[i % cores.length];
        d.style.animationDelay = (Math.random() * 0.8) + 's';
        d.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confeteEl.appendChild(d);
      }
      setTimeout(() => { confeteEl.hidden = true; confeteEl.innerHTML = ''; }, 3400);
    }

    function selecionar(sigla) { selecionado = sigla; renderPainel(); }

    montar();
    return {
      atualizar,
      selecionar,
      mostrar() { raizEl.hidden = false; selecionado = progresso.concluiuTudo() ? selecionado : progresso.estadoAtual(); atualizar(); },
      esconder() { raizEl.hidden = true; },
    };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.ui.mapa = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

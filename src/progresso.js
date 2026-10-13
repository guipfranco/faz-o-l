(function (raiz) {
  'use strict';
  const M = {};
  M.CHAVE = 'fazol.progresso.v1';

  M.criar = function (opts) {
    const armazenamento = opts.armazenamento || null;
    const estados = opts.estados;
    const padrao = () => ({ estadoAtual: estados.lista[0].sigla, concluido: false, fases: {}, obras: {}, estrelasGastas: 0, audio: { mudo: false, volume: 0.8 } });
    let dados = padrao();
    let persistente = !!armazenamento;
    try {
      const bruto = armazenamento && armazenamento.getItem(M.CHAVE);
      if (bruto) {
        const lido = JSON.parse(bruto);
        dados = Object.assign(padrao(), lido, { audio: Object.assign(padrao().audio, lido.audio || {}) });
      }
    } catch (e) { persistente = false; dados = padrao(); }

    const api = { persistente };

    function salvar() {
      if (!armazenamento) { api.persistente = false; return; }
      try { armazenamento.setItem(M.CHAVE, JSON.stringify(dados)); api.persistente = true; }
      catch (e) { api.persistente = false; }
    }

    Object.defineProperty(api, 'dados', { get: () => dados });
    api.estadoAtual = () => dados.estadoAtual;
    api.concluiuTudo = () => !!dados.concluido;

    api.registrarFase = function (numero, estrelas, pontos) {
      const ant = dados.fases[numero] || { estrelas: 0, pontos: 0 };
      const novo = { estrelas: Math.max(ant.estrelas, estrelas || 0), pontos: Math.max(ant.pontos, pontos || 0) };
      dados.fases[numero] = novo;
      salvar();
      return { novasEstrelas: novo.estrelas - ant.estrelas };
    };
    api.estrelasDaFase = (n) => (dados.fases[n] ? dados.fases[n].estrelas : 0);
    api.estrelasTotais = () => Object.values(dados.fases).reduce((s, f) => s + f.estrelas, 0);
    api.estrelasDisponiveis = () => api.estrelasTotais() - dados.estrelasGastas;

    api.obrasDe = (uf) => dados.obras[uf] || 0;
    api.podeComprarObra = (uf) => uf === dados.estadoAtual && api.obrasDe(uf) < 3 && api.estrelasDisponiveis() >= 3;
    api.comprarObra = function (uf) {
      if (!api.podeComprarObra(uf)) return null;
      dados.obras[uf] = api.obrasDe(uf) + 1;
      dados.estrelasGastas += 3;
      let concluiuEstado = false, proximo = null;
      if (dados.obras[uf] === 3) {
        concluiuEstado = true;
        const p = estados.proximo(uf);
        proximo = p ? p.sigla : null;
        if (proximo) dados.estadoAtual = proximo; else dados.concluido = true;
      }
      salvar();
      return { obras: dados.obras[uf], concluiuEstado, proximo };
    };

    api.faseDesbloqueada = function (n) {
      const uf = estados.estadoDaFase(n);
      if (!uf) return false;
      if (estados.indice(uf.sigla) > estados.indice(dados.estadoAtual)) return false;
      if (n === uf.faseInicial) return true;
      return api.estrelasDaFase(n - 1) > 0;
    };

    api.audio = () => dados.audio;
    api.definirAudio = function (cfg) { Object.assign(dados.audio, cfg); salvar(); };
    api.apagar = function () { dados = padrao(); salvar(); };

    return api;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.progresso = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

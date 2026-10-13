(function (raiz) {
  'use strict';
  const M = {};

  M.criar = function (opts) {
    const frases = opts.frases || [];
    const nomes = opts.nomes || {};
    const criarAudio = opts.criarAudio || null;
    const aoBalao = opts.aoBalao || function () {};
    const agora = opts.agora || (() => Date.now());
    const agendar = opts.agendar || ((fn, ms) => setTimeout(fn, ms));
    const aleatorio = opts.aleatorio || Math.random;
    const intervalo = opts.intervaloMs || 4000;
    const pasta = opts.pastaAudios || 'audios/';

    const estado = { mudo: false, volume: 0.8, ultimaFala: -Infinity, pendente: null, timerAtivo: false, rotacao: {}, historico: [] };

    function embaralhar(lista) {
      const a = lista.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(aleatorio() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }
    const gatilhosDe = (f) => f.gatilhos || ['match'];

    function escolherFrase(personagem, gatilho) {
      const g = gatilho || 'match';
      let cand = frases.filter((f) => f.personagem === personagem && gatilhosDe(f).includes(g));
      if (!cand.length && g !== 'match') cand = frases.filter((f) => f.personagem === personagem && gatilhosDe(f).includes('match'));
      if (!cand.length) cand = frases.filter((f) => f.personagem === personagem);
      if (!cand.length) return null;
      const k = personagem + '|' + g;
      let fila = estado.rotacao[k];
      if (!fila || !fila.length) fila = estado.rotacao[k] = embaralhar(cand.map((f) => f.id));
      const id = fila.shift();
      return cand.find((f) => f.id === id) || cand[0];
    }

    function executar(item) {
      estado.ultimaFala = agora();
      estado.historico.push(item);
      const frase = item.frase;
      const nome = (frase && frase.quem) || nomes[item.personagem] || item.personagem;
      aoBalao({ personagem: item.personagem, nome, texto: frase && frase.texto ? frase.texto : '' });
      if (estado.mudo || !frase || !criarAudio) return;
      // Só toca gravação real; sem o mp3 fica apenas o balão.
      const silencio = () => {};
      let audio;
      try { audio = criarAudio(pasta + frase.id + '.mp3'); } catch (e) { return; }
      try { audio.volume = estado.volume; } catch (e) { /* ignora */ }
      audio.onerror = silencio;
      try {
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(silencio);
      } catch (e) { /* sem áudio: segue em silêncio */ }
    }

    function processar() {
      estado.timerAtivo = false;
      if (!estado.pendente) return;
      const falta = estado.ultimaFala + intervalo - agora();
      if (falta > 0) { estado.timerAtivo = true; agendar(processar, falta); return; }
      const item = estado.pendente;
      estado.pendente = null;
      executar(item);
    }

    const api = { estado };
    api.falar = function (ped) {
      let frase = escolherFrase(ped.personagem, ped.gatilho);
      // Personagem sem frase própria (ex.: peça da Marina) cede a vez à torcida.
      if (!frase && ped.personagem !== 'torcida') frase = escolherFrase('torcida', ped.gatilho);
      const item = { personagem: frase ? frase.personagem : ped.personagem, gatilho: ped.gatilho || 'match', frase };
      const t = agora();
      if (t - estado.ultimaFala >= intervalo && !estado.pendente) { executar(item); return; }
      estado.pendente = item;
      if (!estado.timerAtivo) { estado.timerAtivo = true; agendar(processar, Math.max(0, estado.ultimaFala + intervalo - t)); }
    };
    api.mudo = function (v) { if (v !== undefined) estado.mudo = !!v; return estado.mudo; };
    api.volume = function (v) { if (v !== undefined) estado.volume = Math.max(0, Math.min(1, v)); return estado.volume; };
    api.nomeDe = (p) => nomes[p] || p;
    return api;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.voz = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

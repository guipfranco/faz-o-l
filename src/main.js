(function (raiz) {
  'use strict';
  const F = raiz.FazOL;
  const estados = F.dados.estados, mapaBr = F.dados.mapaBr;
  // Se dados/frases.js falhar ao carregar (erro de sintaxe ao editar), o jogo abre sem falas.
  const frases = F.dados.frases || (console.warn('dados/frases.js nao carregou: ninguem vai falar'), { lista: [], NOMES: {} });
  const el = (id) => document.getElementById(id);

  function tentarLocalStorage() {
    try { const t = '__fazol_teste__'; window.localStorage.setItem(t, '1'); window.localStorage.removeItem(t); return window.localStorage; }
    catch (e) { return null; }
  }

  const progresso = F.progresso.criar({ armazenamento: tentarLocalStorage(), estados });

  let timerBalao = null;
  function mostrarBalao(b) {
    const balao = el('balao');
    el('balao-nome').textContent = b.nome;
    el('balao-texto').textContent = b.texto;
    balao.hidden = false;
    clearTimeout(timerBalao);
    timerBalao = setTimeout(() => { balao.hidden = true; }, 3500);
  }

  function sintetizarNavegador(texto, volume) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR'; u.volume = volume; u.rate = 1.05;
    const voz = (window.speechSynthesis.getVoices() || []).find((v) => /^pt(-|_)?BR/i.test(v.lang)) || (window.speechSynthesis.getVoices() || []).find((v) => /^pt/i.test(v.lang));
    if (voz) u.voice = voz;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  const voz = F.voz.criar({ frases: frases.lista, nomes: frases.NOMES, criarAudio: (url) => new Audio(url), sintetizar: sintetizarNavegador, aoBalao: mostrarBalao });
  voz.mudo(progresso.audio().mudo);
  voz.volume(progresso.audio().volume);

  function alternarMudo() { const m = !voz.mudo(); voz.mudo(m); progresso.definirAudio({ mudo: m }); if (m && window.speechSynthesis) window.speechSynthesis.cancel(); return m; }

  const mapa = F.ui.mapa.criar({
    raizEl: el('mapa'), svgEl: el('mapa-svg'), painelEl: el('painel-estado'), estrelasEl: el('estrelas-disponiveis'), confeteEl: el('confete'),
    mapaBr, estados, progresso, voz, aoJogarFase: iniciarFase,
  });

  let game = null;
  function garantirJogo() {
    return new Promise((res) => {
      // Com #jogo escondido o Phaser encolhe o canvas para 0x0. refresh() sozinho usa o
      // tamanho do pai em cache (0) e so depois o atualiza, entao o canvas ficaria 0x0.
      if (game) { game.scale.getParentBounds(); game.scale.refresh(); return res(); }
      game = new Phaser.Game({
        type: Phaser.AUTO, parent: 'jogo', width: 640, height: 900, backgroundColor: '#14141c',
        // Sem autoCenter: o flex de #jogo em estilos.css ja centraliza; os dois juntos deslocam o canvas.
        scale: { mode: Phaser.Scale.FIT },
        scene: [],
      });
      game.events.once('ready', () => {
        game.scene.add('Tabuleiro', F.ui.CenaTabuleiro, false);
        game.scene.add('FimDeFase', F.ui.CenaFimDeFase, false);
        res();
      });
    });
  }

  async function iniciarFase(n) {
    const def = F.logica.geradorFases.obterFase(n);
    if (!def) { mapa.mostrar(); return; }
    mapa.esconder();
    el('menu').hidden = true;
    el('jogo').hidden = false;
    await garantirJogo();
    game.scene.start('Tabuleiro', { fase: def, voz, nomes: frases.NOMES, aoTerminar });
  }

  function aoTerminar(resultado, acao) {
    if (resultado.status === 'vitoria') progresso.registrarFase(resultado.numero, resultado.estrelas, resultado.pontos);
    el('jogo').hidden = true;
    if (acao === 'repetir') return iniciarFase(resultado.numero);
    if (acao === 'proxima' && progresso.faseDesbloqueada(resultado.numero + 1)) return iniciarFase(resultado.numero + 1);
    mapa.mostrar();
  }

  el('btn-jogar').addEventListener('click', () => { el('menu').hidden = true; mapa.mostrar(); });
  el('btn-menu').addEventListener('click', () => { mapa.esconder(); el('menu').hidden = false; });
  let confirmarApagar = false;
  el('btn-apagar').addEventListener('click', (ev) => {
    if (!confirmarApagar) { confirmarApagar = true; ev.target.textContent = 'Tem certeza? Clique de novo'; setTimeout(() => { confirmarApagar = false; ev.target.textContent = 'Apagar progresso'; }, 4000); return; }
    progresso.apagar(); confirmarApagar = false; ev.target.textContent = 'Progresso apagado';
  });
  if (!progresso.persistente) { const p = document.createElement('p'); p.className = 'rodape'; p.textContent = 'Aviso: o navegador bloqueou o armazenamento; o progresso não será salvo.'; el('menu').appendChild(p); }

  F.ui.app = { progresso, voz, mapa, iniciarFase, alternarMudo };
  F.ui.alternarMudo = alternarMudo;
})(typeof globalThis !== 'undefined' ? globalThis : this);

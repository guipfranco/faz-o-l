(function (raiz) {
  'use strict';
  const L = raiz.FazOL.logica, D = raiz.FazOL.dados;
  const TAM = 64, LARG = 640, ALT = 900, TOPO = 200;
  const CORES = { lula: 0xc8102e, alckmin: 0x1f5fbf, marina: 0x1f9d55, boulos: 0xf28c28, dilma: 0x7b3fa0 };
  const TEX_OBST = { bolsonaro: 'obst-bolsonaro', boiada: 'obst-salles', fakenews: 'obst-fakenews' };
  const ROTULO = { pontos: 'Pontos', coletar: 'Coletar', limparGelatina: 'Gelatina', limparBoiada: 'Boiada', limparFakeNews: 'Fake news', quebrarBlocos: 'Blocos', chefe: 'Chefe' };
  const FONTE = 'Segoe UI, system-ui, sans-serif';
  const espera = (cena, ms) => new Promise((r) => cena.time.delayedCall(ms, r));

  class CenaTabuleiro extends Phaser.Scene {
    constructor() { super({ key: 'Tabuleiro' }); }

    init(dados) {
      this.def = dados.fase; this.voz = dados.voz; this.aoTerminar = dados.aoTerminar; this.nomes = dados.nomes || {};
    }

    preload() {
      for (const p of L.matches.PECAS) this.load.image('peca-' + p, 'arte/pecas/' + p + '.svg');
      for (const o of ['bolsonaro', 'flavio', 'damares', 'pazuello', 'salles', 'fakenews']) this.load.image('obst-' + o, 'arte/obstaculos/' + o + '.svg');
      this.load.image('mao-L', 'arte/mao-L.svg');
    }

    create() {
      raiz.FazOL.ui.cenaAtual = this;
      this.velocidadeNormal();
      this.confirmarSair = false;
      this.estado = L.turno.iniciarFase(this.def);
      this.ocupado = false; this.selecionada = null; this.arraste = null; this.dicaTweens = []; this.terminou = false; this.saindo = false;
      const largTab = this.estado.colunas * TAM, altTab = this.estado.linhas * TAM;
      this.origemX = Math.round((LARG - largTab) / 2);
      this.origemY = Math.round(TOPO + (ALT - TOPO - altTab) / 2);
      this.criarTexturas();
      this.desenharFundo();
      this.criarHUD();
      this.sprites = {};
      this.sincronizar();
      this.configurarInput();
      this.agendarDica();
      if (this.def.dica) this.mostrarAviso(this.def.dica, 4000);
    }

    // --- geometria ---
    pos(l, c) { return { x: this.origemX + c * TAM + TAM / 2, y: this.origemY + l * TAM + TAM / 2 }; }
    chave(p) { return p.l + ',' + p.c; }
    celulaEmPixel(x, y) {
      const c = Math.floor((x - this.origemX) / TAM), l = Math.floor((y - this.origemY) / TAM);
      if (l < 0 || c < 0 || l >= this.estado.linhas || c >= this.estado.colunas) return null;
      return this.estado.celulas[l][c] ? { l, c } : null;
    }

    // --- desenho estático ---
    criarTexturas() {
      if (this.textures.exists('particula')) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 6); g.generateTexture('particula', 12, 12); g.destroy();
    }
    desenharFundo() {
      const g = this.add.graphics().setDepth(0);
      for (let l = 0; l < this.estado.linhas; l++) for (let c = 0; c < this.estado.colunas; c++) {
        if (!this.estado.celulas[l][c]) continue;
        const p = this.pos(l, c);
        g.fillStyle((l + c) % 2 === 0 ? 0x23232f : 0x1c1c27, 1);
        g.fillRoundedRect(p.x - TAM / 2 + 1, p.y - TAM / 2 + 1, TAM - 2, TAM - 2, 8);
      }
    }

    // --- HUD ---
    criarHUD() {
      const uf = D.estados.porSigla[this.def.estado];
      const estilo = (tam, cor, peso) => ({ fontFamily: FONTE, fontSize: tam + 'px', color: cor || '#f4f4f4', fontStyle: peso || 'bold' });
      this.add.text(20, 14, 'Fase ' + this.def.numero + ' · ' + (uf ? uf.nome : ''), estilo(20, '#ffdf00')).setDepth(10);
      // Sair pede confirmação: o primeiro toque vira "Sair?" por 3 s, o segundo sai.
      this.btnMapa = this.add.text(LARG - 20, 14, 'Mapa', estilo(18)).setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        if (this.ocupado) return;
        if (this.confirmarSair) { this.sair('mapa'); return; }
        this.confirmarSair = true;
        this.btnMapa.setText('Sair?');
        if (this.timerSair) this.timerSair.remove(false);
        this.timerSair = this.time.delayedCall(3000, () => { this.confirmarSair = false; if (this.btnMapa && this.btnMapa.active) this.btnMapa.setText('Mapa'); });
      });
      this.btnMudo = this.add.text(LARG - 90, 12, this.voz.mudo() ? '🔇' : '🔊', estilo(20)).setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { raiz.FazOL.ui.alternarMudo(); this.btnMudo.setText(this.voz.mudo() ? '🔇' : '🔊'); });
      this.txtJogadas = this.add.text(20, 46, '', estilo(44)).setDepth(10);
      this.add.text(22, 100, 'jogadas', estilo(14, '#9a9aa6', 'normal')).setDepth(10);
      this.txtPontos = this.add.text(LARG - 20, 54, '', estilo(30)).setOrigin(1, 0).setDepth(10);
      this.add.text(LARG - 20, 96, 'pontos', estilo(14, '#9a9aa6', 'normal')).setOrigin(1, 0).setDepth(10);
      this.txtObjetivos = this.add.text(LARG / 2, 50, '', Object.assign(estilo(17), { align: 'center', lineSpacing: 4 })).setOrigin(0.5, 0).setDepth(10);
      this.gEstrelas = this.add.graphics().setDepth(10);
      this.txtL = this.add.text(LARG / 2, 150, '', estilo(16, '#ffdf00')).setOrigin(0.5, 0).setDepth(10);
      this.atualizarHUD();
    }
    atualizarHUD() {
      const e = this.estado;
      this.txtJogadas.setText(String(e.jogadasRestantes));
      this.txtPontos.setText(e.pontos.toLocaleString('pt-BR'));
      this.txtObjetivos.setText(e.objetivos.map((o) => {
        const nome = o.tipo === 'coletar' ? 'Coletar ' + (this.nomes[o.peca] || o.peca) : ROTULO[o.tipo];
        const ok = o.atual >= o.alvo ? ' ✔' : '';
        return nome + ': ' + Math.min(o.atual, o.alvo).toLocaleString('pt-BR') + ' / ' + o.alvo.toLocaleString('pt-BR') + ok;
      }).join('\n'));
      const g = this.gEstrelas; g.clear();
      const x0 = LARG / 2 - 120, y0 = 128, larg = 240, maxP = e.limiares[2];
      g.fillStyle(0x2b2b3a, 1); g.fillRoundedRect(x0, y0, larg, 10, 5);
      g.fillStyle(0xffdf00, 1); g.fillRoundedRect(x0, y0, Math.max(10, Math.min(1, e.pontos / maxP) * larg), 10, 5);
      e.limiares.forEach((lim) => { g.fillStyle(e.pontos >= lim ? 0xffdf00 : 0x5a5a66, 1); g.fillCircle(x0 + (lim / maxP) * larg, y0 + 5, 8); });
      this.txtL.setText('L  ' + [0, 1, 2].map((i) => (i < e.contadorL ? '●' : '○')).join(' ') + (e.contadorL >= 3 ? '   +1 ⭐' : ''));
    }

    // --- sprites ---
    criarPeca(l, c, cel) {
      const p = this.pos(l, c);
      const cont = this.add.container(p.x, p.y).setDepth(2);
      cont.add(this.add.image(0, 0, 'peca-' + cel.peca).setDisplaySize(TAM - 8, TAM - 8));
      this.decorarEspecial(cont, cel.especial);
      cont.setSize(TAM, TAM);
      cont.dados = { peca: cel.peca };
      return cont;
    }
    decorarEspecial(cont, especial) {
      if (!especial) return;
      const g = this.add.graphics();
      const h = (TAM - 8) / 2;
      switch (especial) {
        case 'listradaH': g.fillStyle(0xffffff, 0.85); g.fillRect(-h, -8, h * 2, 5); g.fillRect(-h, 3, h * 2, 5); cont.add(g); break;
        case 'listradaV': g.fillStyle(0xffffff, 0.85); g.fillRect(-8, -h, 5, h * 2); g.fillRect(3, -h, 5, h * 2); cont.add(g); break;
        case 'bomba': g.lineStyle(5, 0xffffff, 0.9); g.strokeCircle(0, 0, h - 6); g.fillStyle(0x111111, 1); g.fillCircle(0, 0, 7); cont.add(g); break;
        case 'L':
          g.lineStyle(4, 0xffdf00, 1); g.strokeRoundedRect(-h, -h, h * 2, h * 2, 10); cont.add(g);
          cont.add(this.add.image(h - 12, -h + 12, 'mao-L').setDisplaySize(30, 30));
          break;
        case 'estrela': {
          const cores = [0xc8102e, 0xf28c28, 0xffdf00, 0x1f9d55, 0x1f5fbf, 0x7b3fa0];
          cores.forEach((cor, i) => { g.lineStyle(6, cor, 1); g.beginPath(); g.arc(0, 0, h - 4, (i / 6) * Math.PI * 2, ((i + 1) / 6) * Math.PI * 2, false); g.strokePath(); });
          cont.add(g);
          cont.add(this.add.text(0, 0, '★', { fontSize: '30px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
          break;
        }
        default: g.destroy();
      }
    }
    destruirCelula(k) {
      const s = this.sprites[k]; if (!s) return;
      for (const key of Object.keys(s)) if (s[key]) s[key].destroy();
      delete this.sprites[k];
    }
    sincronizar() {
      for (const k of Object.keys(this.sprites)) this.destruirCelula(k);
      this.sprites = {};
      if (this.spriteChefe) { this.spriteChefe.destroy(); this.spriteChefe = null; }
      const e = this.estado;
      for (let l = 0; l < e.linhas; l++) for (let c = 0; c < e.colunas; c++) {
        const cel = e.celulas[l][c]; if (!cel) continue;
        const k = this.chave({ l, c }), p = this.pos(l, c), s = {};
        if (cel.gelatina > 0) s.gel = this.desenharGelatina(this.add.container(p.x, p.y).setDepth(2.5), cel.gelatina);
        if (cel.peca) s.peca = this.criarPeca(l, c, cel);
        if (cel.bloco && cel.bloco.tipo !== 'chefe') {
          s.obst = this.add.image(p.x, p.y, TEX_OBST[cel.bloco.tipo]).setDisplaySize(TAM - 6, TAM - 6).setDepth(3);
          if (cel.bloco.tipo === 'bolsonaro' && cel.bloco.vida === 1) s.obst.setTint(0xffaaaa);
        }
        if (cel.corrente) s.corrente = this.add.image(p.x, p.y, 'obst-pazuello').setDisplaySize(TAM - 4, TAM - 4).setDepth(4);
        this.sprites[k] = s;
      }
      if (e.chefe && e.chefe.vida > 0) {
        const p = this.pos(e.chefe.l, e.chefe.c);
        this.spriteChefe = this.add.container(p.x + TAM / 2, p.y + TAM / 2).setDepth(3);
        const largBarra = TAM * 2 - 16;
        this.spriteChefe.add([
          this.add.image(0, 0, 'obst-flavio').setDisplaySize(TAM * 2 - 6, TAM * 2 - 6),
          this.add.rectangle(0, TAM - 10, largBarra, 10, 0x2b2b3a),
          this.add.rectangle(-largBarra / 2, TAM - 10, largBarra * (e.chefe.vida / e.chefe.vidaMax), 10, 0xc8102e).setOrigin(0, 0.5),
        ]);
      }
    }
    // Gelatina fica por cima da peça: moldura rosa translúcida; 2 camadas ganham contorno interno e selo "2".
    desenharGelatina(cont, camadas) {
      cont.removeAll(true);
      const g = this.add.graphics(), h = TAM / 2 - 3;
      g.fillStyle(0xff5fa2, 0.22); g.fillRoundedRect(-h, -h, h * 2, h * 2, 10);
      g.lineStyle(5, 0xff5fa2, 0.95); g.strokeRoundedRect(-h, -h, h * 2, h * 2, 10);
      cont.add(g);
      if (camadas >= 2) {
        g.lineStyle(3, 0xffffff, 0.8); g.strokeRoundedRect(-h + 7, -h + 7, h * 2 - 14, h * 2 - 14, 7);
        g.fillStyle(0xff5fa2, 1); g.fillCircle(h - 6, -h + 6, 10);
        cont.add(this.add.text(h - 6, -h + 6, '2', { fontFamily: FONTE, fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
      }
      return cont;
    }
    spriteDe(p) { const s = this.sprites[this.chave(p)]; return s ? s.peca : null; }

    // --- input ---
    configurarInput() {
      this.input.on('pointerdown', (p) => {
        // Tocar durante as animações acelera tudo (4x) até o fim da jogada.
        if (this.ocupado) { this.tweens.timeScale = 4; this.time.timeScale = 4; return; }
        if (this.terminou) return;
        this.agendarDica();
        const cel = this.celulaEmPixel(p.x, p.y);
        if (!cel) { this.selecionar(null); return; }
        if (this.selecionada && Math.abs(this.selecionada.l - cel.l) + Math.abs(this.selecionada.c - cel.c) === 1) {
          const a = this.selecionada; this.selecionar(null); this.tentarJogada(a, cel); return;
        }
        this.arraste = { cel, x: p.x, y: p.y };
        this.selecionar(cel);
      });
      this.input.on('pointermove', (p) => {
        if (!this.arraste || !p.isDown || this.ocupado) return;
        const dx = p.x - this.arraste.x, dy = p.y - this.arraste.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < TAM * 0.4) return;
        const a = this.arraste.cel;
        const b = Math.abs(dx) > Math.abs(dy) ? { l: a.l, c: a.c + Math.sign(dx) } : { l: a.l + Math.sign(dy), c: a.c };
        this.arraste = null; this.selecionar(null);
        if (b.l >= 0 && b.c >= 0 && b.l < this.estado.linhas && b.c < this.estado.colunas && this.estado.celulas[b.l][b.c]) this.tentarJogada(a, b);
      });
      this.input.on('pointerup', () => { this.arraste = null; });
    }
    selecionar(cel) {
      if (this.marcaSelecao) { this.marcaSelecao.destroy(); this.marcaSelecao = null; }
      this.selecionada = cel;
      if (!cel) return;
      const p = this.pos(cel.l, cel.c);
      this.marcaSelecao = this.add.graphics().setDepth(5);
      this.marcaSelecao.lineStyle(4, 0xffffff, 0.9);
      this.marcaSelecao.strokeRoundedRect(p.x - TAM / 2 + 2, p.y - TAM / 2 + 2, TAM - 4, TAM - 4, 10);
    }
    async tentarJogada(a, b) {
      if (this.ocupado || this.terminou) return;
      const r = L.turno.jogar(this.estado, a, b);
      if (!r.valido && !r.eventos.length) { this.tremer(a); this.agendarDica(); return; }
      this.ocupado = true;
      this.cancelarDica();
      try { await this.animar(r.eventos); } catch (e) { console.error('animacao', e); }
      this.velocidadeNormal();
      this.sincronizar();
      this.atualizarHUD();
      this.ocupado = false;
      if (this.estado.status !== 'jogando') this.terminar(); else this.agendarDica();
    }

    velocidadeNormal() { this.tweens.timeScale = 1; this.time.timeScale = 1; }

    // --- animação de eventos ---
    tw(cfg) {
      return new Promise((res) => {
        const alvos = Array.isArray(cfg.targets) ? cfg.targets.filter(Boolean) : (cfg.targets ? [cfg.targets] : []);
        if (!alvos.length) return res();
        this.tweens.add(Object.assign({}, cfg, { targets: alvos, onComplete: () => res() }));
      });
    }
    async animar(eventos) {
      let falaPendente = null;
      for (const ev of eventos) {
        switch (ev.tipo) {
          case 'troca': case 'trocaInvalida': {
            const sa = this.spriteDe(ev.a), sb = this.spriteDe(ev.b);
            const pa = this.pos(ev.a.l, ev.a.c), pb = this.pos(ev.b.l, ev.b.c);
            await Promise.all([this.tw({ targets: sa, x: pb.x, y: pb.y, duration: 140 }), this.tw({ targets: sb, x: pa.x, y: pa.y, duration: 140 })]);
            if (ev.tipo === 'trocaInvalida') {
              await Promise.all([this.tw({ targets: sa, x: pa.x, y: pa.y, duration: 140 }), this.tw({ targets: sb, x: pb.x, y: pb.y, duration: 140 })]);
            } else {
              const ka = this.chave(ev.a), kb = this.chave(ev.b);
              const t = this.sprites[ka].peca; this.sprites[ka].peca = this.sprites[kb].peca; this.sprites[kb].peca = t;
            }
            break;
          }
          case 'match': {
            if (ev.tamanho >= 4 || ev.especial || ev.cascata >= 3) falaPendente = { personagem: ev.peca, gatilho: 'match' };
            else {
              // Match simples de 3: só um "plim" e o nome da peça, sem balão.
              const app = raiz.FazOL.ui.app;
              if (app && app.plim) app.plim();
              let sx = 0, sy = 0;
              for (const c of ev.celulas) { const p = this.pos(c.l, c.c); sx += p.x; sy += p.y; }
              const n = ev.celulas.length || 1;
              this.rotuloFlutuante(sx / n, sy / n - 18, this.nomes[ev.peca] || ev.peca);
            }
            await this.tw({ targets: ev.celulas.map((p) => this.spriteDe(p)), scale: 1.15, duration: 90, yoyo: true });
            break;
          }
          case 'especialAtivado': {
            if (ev.especial === 'L') { falaPendente = { personagem: 'lula', gatilho: 'L' }; await this.efeitoL(ev); }
            else if (ev.especial === 'estrela') { falaPendente = { personagem: 'lula', gatilho: 'estrela' }; this.flash(0xffffff, 0.5); }
            else if (!falaPendente) falaPendente = { personagem: ev.peca || 'lula', gatilho: 'match' };
            this.destacarArea(ev.celulas, ev.especial);
            await espera(this, 120);
            break;
          }
          case 'combo': {
            const temL = ev.especiais.includes('L');
            falaPendente = { personagem: temL ? 'lula' : (ev.peca || 'lula'), gatilho: temL ? 'L' : 'match' };
            this.flash(0xffdf00, 0.35);
            this.destacarArea(ev.celulas, 'combo');
            await espera(this, 160);
            break;
          }
          case 'limpar': {
            const golpes = ev.obstaculos.filter((o) => o.tipo !== 'gelatina' && o.tipo !== 'corrente');
            const destaque = golpes.find((o) => o.destruido) || golpes[0];
            if (destaque) this.voz.falar({ personagem: L.obstaculos.PERSONAGEM[destaque.tipo], gatilho: 'match' });
            else if (falaPendente) this.voz.falar(falaPendente);
            falaPendente = null;
            await this.animarLimpeza(ev);
            break;
          }
          case 'especialCriado': {
            const k = this.chave(ev);
            if (this.sprites[k] && this.sprites[k].peca) this.sprites[k].peca.destroy();
            const s = this.criarPeca(ev.l, ev.c, { peca: ev.peca, especial: ev.especial }).setScale(0);
            this.sprites[k] = Object.assign(this.sprites[k] || {}, { peca: s });
            await this.tw({ targets: s, scale: 1, duration: 220, ease: 'Back.easeOut' });
            break;
          }
          case 'gravidade': {
            const promessas = [];
            const movs = ev.movimentos.slice().sort((a, b) => b.para.l - a.para.l);
            for (const m of movs) {
              const kd = this.chave(m.de), kp = this.chave(m.para);
              const s = this.sprites[kd] && this.sprites[kd].peca; if (!s) continue;
              this.sprites[kd].peca = null;
              this.sprites[kp] = this.sprites[kp] || {};
              if (this.sprites[kp].peca && this.sprites[kp].peca !== s) this.sprites[kp].peca.destroy();
              this.sprites[kp].peca = s;
              const p = this.pos(m.para.l, m.para.c);
              promessas.push(this.tw({ targets: s, y: p.y, duration: 90 + 50 * (m.para.l - m.de.l), ease: 'Quad.easeIn' }));
            }
            await Promise.all(promessas);
            break;
          }
          case 'preencher': {
            const promessas = [];
            for (const n of ev.novas) {
              const k = this.chave(n);
              const s = this.criarPeca(n.l, n.c, { peca: n.peca, especial: null });
              const p = this.pos(n.l, n.c);
              s.y = this.origemY - TAM * (1 + (n.l % 3));
              if (this.sprites[k] && this.sprites[k].peca) this.sprites[k].peca.destroy();
              this.sprites[k] = Object.assign(this.sprites[k] || {}, { peca: s });
              promessas.push(this.tw({ targets: s, y: p.y, duration: 220 + 40 * n.l, ease: 'Quad.easeIn' }));
            }
            await Promise.all(promessas);
            break;
          }
          case 'boiadaEspalhou': this.voz.falar({ personagem: 'salles', gatilho: 'boiada' }); this.sincronizar(); this.pulsar(ev); await espera(this, 150); break;
          case 'fakeNewsMultiplicou': case 'chefeAtacou': this.sincronizar(); this.pulsar(ev); await espera(this, 140); break;
          case 'bonusJogada': {
            // Nao sincroniza: this.estado ja e o estado final, e os eventos seguintes animam a partir daqui.
            const k = this.chave(ev), velho = this.sprites[k] && this.sprites[k].peca;
            const peca = velho && velho.dados ? velho.dados.peca : 'lula';
            if (velho) velho.destroy();
            this.sprites[k] = Object.assign(this.sprites[k] || {}, { peca: this.criarPeca(ev.l, ev.c, { peca, especial: ev.especial }) });
            this.pulsar(ev);
            await espera(this, 140);
            break;
          }
          case 'embaralhar':
            this.mostrarAviso('Sem jogadas possíveis: embaralhando!', 1800);
            await this.tw({ targets: Object.values(this.sprites).map((s) => s.peca), alpha: 0, duration: 250 });
            this.sincronizar();
            break;
          case 'semJogadas':
            this.mostrarAviso('Sem jogadas possíveis: fim da fase.', 2500);
            break;
          case 'fim':
            this.atualizarHUD();
            if (ev.status === 'vitoria') this.voz.falar({ personagem: 'lula', gatilho: 'vitoria' });
            else if (ev.status === 'derrota') this.voz.falar({ personagem: 'bolsonaro', gatilho: 'derrota' });
            break;
          default: break;
        }
      }
    }
    async animarLimpeza(ev) {
      const alvos = [];
      let sx = 0, sy = 0, n = 0;
      for (const c of ev.celulas) {
        const k = this.chave(c), p = this.pos(c.l, c.c);
        sx += p.x; sy += p.y; n++;
        this.particulas(p.x, p.y, CORES[c.peca] || 0xffffff, 10);
        const s = this.sprites[k] && this.sprites[k].peca;
        if (s) { alvos.push(s); this.sprites[k].peca = null; }
      }
      for (const o of ev.obstaculos) {
        const k = this.chave(o), s = this.sprites[k] || {}, p = this.pos(o.l, o.c);
        if (o.tipo === 'gelatina') { this.particulas(p.x, p.y, 0xff5fa2, 8); if (s.gel) { if (o.destruido) { alvos.push(s.gel); s.gel = null; } else this.desenharGelatina(s.gel, o.vida || 1); } }
        else if (o.tipo === 'corrente') { this.particulas(p.x, p.y, 0x9aa0a6, 8); if (s.corrente) { alvos.push(s.corrente); s.corrente = null; } }
        else if (o.tipo === 'chefe') { this.particulas(p.x, p.y, 0xc8102e, 14); if (this.spriteChefe) this.tweens.add({ targets: this.spriteChefe, x: this.spriteChefe.x + 6, duration: 40, yoyo: true, repeat: 3 }); }
        else {
          this.particulas(p.x, p.y, 0x8b8b7a, 12);
          if (s.obst) { if (o.destruido) { alvos.push(s.obst); s.obst = null; } else { s.obst.setTint(0xffaaaa); this.tweens.add({ targets: s.obst, angle: 6, duration: 50, yoyo: true, repeat: 2 }); } }
        }
      }
      if (n) this.textoFlutuante(sx / n, sy / n, '+' + ev.pontos + (ev.cascata > 1 ? '  x' + ev.cascata : ''));
      await this.tw({ targets: alvos, scale: 0, alpha: 0, duration: 180 });
      alvos.forEach((s) => s.destroy());
    }
    particulas(x, y, cor, qtd) {
      const em = this.add.particles(x, y, 'particula', { speed: { min: 80, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 450, tint: cor, emitting: false }).setDepth(6);
      em.explode(qtd);
      this.time.delayedCall(600, () => em.destroy());
    }
    textoFlutuante(x, y, txt) {
      const t = this.add.text(x, y, txt, { fontFamily: FONTE, fontSize: '24px', color: '#ffdf00', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setDepth(7);
      this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 700, onComplete: () => t.destroy() });
    }
    rotuloFlutuante(x, y, txt) {
      const t = this.add.text(x, y, txt, { fontFamily: FONTE, fontSize: '16px', color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(7);
      this.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 650, onComplete: () => t.destroy() });
    }
    flash(cor, alpha) {
      const r = this.add.rectangle(LARG / 2, ALT / 2, LARG, ALT, cor, alpha).setDepth(8);
      this.tweens.add({ targets: r, alpha: 0, duration: 300, onComplete: () => r.destroy() });
    }
    destacarArea(celulas, tipo) {
      const g = this.add.graphics().setDepth(6);
      g.fillStyle(tipo === 'L' || tipo === 'combo' ? 0xffdf00 : 0xffffff, 0.45);
      for (const c of celulas) { const p = this.pos(c.l, c.c); g.fillRoundedRect(p.x - TAM / 2 + 2, p.y - TAM / 2 + 2, TAM - 4, TAM - 4, 8); }
      this.tweens.add({ targets: g, alpha: 0, duration: 350, onComplete: () => g.destroy() });
    }
    async efeitoL(ev) {
      const p = this.pos(ev.l, ev.c);
      const mao = this.add.image(p.x, p.y, 'mao-L').setDisplaySize(40, 40).setDepth(9);
      await this.tw({ targets: mao, displayWidth: 220, displayHeight: 220, x: LARG / 2, y: this.origemY + (this.estado.linhas * TAM) / 2, duration: 260, ease: 'Back.easeOut' });
      this.tweens.add({ targets: mao, alpha: 0, duration: 300, delay: 200, onComplete: () => mao.destroy() });
    }
    pulsar(p) {
      const s = this.sprites[this.chave(p)];
      const alvo = s && (s.obst || s.gel || s.peca);
      if (alvo) this.tweens.add({ targets: alvo, scaleX: alvo.scaleX * 1.2, scaleY: alvo.scaleY * 1.2, duration: 120, yoyo: true });
    }
    tremer(p) { const s = this.spriteDe(p); if (s) this.tweens.add({ targets: s, x: s.x + 6, duration: 40, yoyo: true, repeat: 2 }); }

    // --- dica, avisos, fim ---
    agendarDica() { this.cancelarDica(); this.timerDica = this.time.delayedCall(10000, () => this.mostrarDicaDeJogada()); }
    cancelarDica() {
      if (this.timerDica) { this.timerDica.remove(false); this.timerDica = null; }
      for (const t of this.dicaTweens) { const alvos = t.targets || []; t.stop(); alvos.forEach((s) => s.setScale && s.setScale(1)); }
      this.dicaTweens = [];
    }
    mostrarDicaDeJogada() {
      if (this.ocupado || this.terminou) return;
      const j = L.matches.encontrarJogada(this.estado.celulas);
      if (!j) return;
      for (const p of [j.a, j.b]) { const s = this.spriteDe(p); if (s) this.dicaTweens.push(this.tweens.add({ targets: s, scale: 1.12, duration: 350, yoyo: true, repeat: -1 })); }
    }
    mostrarAviso(texto, ms) {
      if (this.aviso) this.aviso.destroy();
      const t = this.add.text(LARG / 2, ALT - 28, texto, { fontFamily: FONTE, fontSize: '17px', color: '#f4f4f4', backgroundColor: '#1f1f2b', padding: { x: 12, y: 6 }, align: 'center', wordWrap: { width: LARG - 60 } }).setOrigin(0.5).setDepth(10);
      this.aviso = t;
      this.time.delayedCall(ms || 2500, () => { if (this.aviso === t) { t.destroy(); this.aviso = null; } });
    }
    resultado() { return { numero: this.def.numero, status: this.estado.status, pontos: this.estado.pontos, estrelas: L.turno.estrelas(this.estado), contadorL: this.estado.contadorL }; }
    terminar() {
      if (this.terminou) return;
      this.terminou = true;
      this.cancelarDica();
      const resultado = this.resultado();
      this.time.delayedCall(600, () => this.scene.launch('FimDeFase', { resultado, aoEscolher: (acao) => this.sair(acao, resultado) }));
    }
    sair(acao, resultado) {
      if (this.saindo) return;
      this.saindo = true;
      this.cancelarDica();
      const final = resultado || (this.estado.status !== 'jogando' ? this.resultado() : Object.assign(this.resultado(), { status: 'abandono', estrelas: 0 }));
      if (this.scene.isActive('FimDeFase')) this.scene.stop('FimDeFase');
      raiz.FazOL.ui.cenaAtual = null;
      // scene.stop() so entra na fila do SceneManager; se aoTerminar iniciasse a proxima fase
      // agora, o stop enfileirado derrubaria a cena nova. Espera o desligamento de fato.
      this.events.once('shutdown', () => this.aoTerminar(final, acao));
      this.scene.stop();
    }
  }

  raiz.FazOL.ui.CenaTabuleiro = CenaTabuleiro;
})(typeof globalThis !== 'undefined' ? globalThis : this);

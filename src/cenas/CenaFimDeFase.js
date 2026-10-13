(function (raiz) {
  'use strict';
  const FONTE = 'Segoe UI, system-ui, sans-serif';

  class CenaFimDeFase extends Phaser.Scene {
    constructor() { super({ key: 'FimDeFase' }); }
    init(d) { this.resultado = d.resultado; this.aoEscolher = d.aoEscolher; }
    create() {
      const r = this.resultado, venceu = r.status === 'vitoria';
      this.add.rectangle(320, 450, 640, 900, 0x000000, 0.72).setInteractive();
      this.add.rectangle(320, 450, 480, 380, 0x1f1f2b).setStrokeStyle(4, venceu ? 0x009c3b : 0xc8102e);
      this.add.text(320, 305, venceu ? 'Vitória!' : 'Acabaram as jogadas', { fontFamily: FONTE, fontSize: '40px', color: venceu ? '#ffdf00' : '#f4f4f4', fontStyle: 'bold' }).setOrigin(0.5);
      const estrelas = [1, 2, 3].map((i) => (i <= r.estrelas ? '★' : '☆')).join(' ');
      this.add.text(320, 375, estrelas, { fontFamily: FONTE, fontSize: '52px', color: '#ffdf00' }).setOrigin(0.5);
      if (r.estrelas >= 4) this.add.text(320, 420, '+1 ★ por 3 L na fase!', { fontFamily: FONTE, fontSize: '18px', color: '#ffdf00', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(320, 455, r.pontos.toLocaleString('pt-BR') + ' pontos', { fontFamily: FONTE, fontSize: '24px', color: '#f4f4f4' }).setOrigin(0.5);
      const botao = (x, y, rotulo, cor, acao) => {
        const b = this.add.rectangle(x, y, 190, 54, cor).setInteractive({ useHandCursor: true });
        this.add.text(x, y, rotulo, { fontFamily: FONTE, fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        b.on('pointerdown', () => this.aoEscolher(acao));
      };
      botao(215, 560, 'Mapa', 0x5a5a66, 'mapa');
      botao(425, 560, venceu ? 'Próxima fase' : 'Jogar de novo', venceu ? 0x009c3b : 0xc8102e, venceu ? 'proxima' : 'repetir');
    }
  }

  raiz.FazOL.ui.CenaFimDeFase = CenaFimDeFase;
})(typeof globalThis !== 'undefined' ? globalThis : this);

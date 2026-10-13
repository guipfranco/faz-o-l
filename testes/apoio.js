const matches = require('../src/logica/matches');
const LETRAS = { L: 'lula', A: 'alckmin', M: 'marina', B: 'boulos', D: 'dilma' };

// Ex.: grade(['LLA', 'AMM']) => celulas 2x3
function grade(linhas) {
  return linhas.map((linha) => linha.split('').map((ch) => {
    if (ch === '#') return null;
    const cel = matches.novaCelula();
    if (LETRAS[ch]) cel.peca = LETRAS[ch];
    return cel;
  }));
}

function desenhar(celulas) {
  const inv = Object.fromEntries(Object.entries(LETRAS).map(([k, v]) => [v, k]));
  return celulas.map((linha) => linha.map((c) => (c === null ? '#' : c.peca ? inv[c.peca] : '.')).join(''));
}

module.exports = { grade, desenhar, LETRAS };

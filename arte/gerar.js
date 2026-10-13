// Uso: node arte/gerar.js   (regera todos os SVGs em arte/)
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const CORES = { lula: '#c8102e', alckmin: '#1f5fbf', marina: '#1f9d55', boulos: '#f28c28', dilma: '#7b3fa0' };

const svg = (tam, corpo) => `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}">${corpo}</svg>`;

function olhos(dy, aberto) {
  const y = 66 + (dy || 0);
  if (aberto === false) return `<path d="M48 ${y}h12M68 ${y}h12" stroke="#222" stroke-width="3" stroke-linecap="round"/>`;
  return `<circle cx="54" cy="${y}" r="3.6" fill="#222"/><circle cx="74" cy="${y}" r="3.6" fill="#222"/>` +
    `<circle cx="55.3" cy="${y - 1.2}" r="1.1" fill="#fff"/><circle cx="75.3" cy="${y - 1.2}" r="1.1" fill="#fff"/>`;
}
const sorriso = (y) => `<path d="M52 ${y}q12 10 24 0" stroke="#7a2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const careta = (y) => `<path d="M52 ${y + 8}q12 -10 24 0" stroke="#3a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const oculos = (cor) => `<g fill="none" stroke="${cor || '#333'}" stroke-width="2.6"><rect x="43" y="59" width="22" height="15" rx="6"/><rect x="63" y="59" width="22" height="15" rx="6"/><path d="M33 64h10M85 64h10"/></g>`;

// Rosto base: fundo arredondado na cor do personagem, cabeça, orelhas.
function rosto({ fundo, pele, cabelo, estilo, oculosCor, expressao }) {
  const partes = [];
  partes.push(`<rect x="4" y="4" width="120" height="120" rx="28" fill="${fundo}"/>`);
  partes.push(`<rect x="4" y="4" width="120" height="60" rx="28" fill="#fff" opacity=".10"/>`);
  partes.push(`<ellipse cx="33" cy="72" rx="6" ry="8" fill="${pele}"/><ellipse cx="95" cy="72" rx="6" ry="8" fill="${pele}"/>`);
  partes.push(`<ellipse cx="64" cy="72" rx="30" ry="35" fill="${pele}"/>`);
  switch (estilo) {
    case 'careca-barba': // cabelo grisalho nas laterais + barba branca cheia
      partes.push(`<path d="M34 64q0-16 10-22l-4 24z M94 64q0-16-10-22l4 24z" fill="${cabelo}"/>`);
      partes.push(`<path d="M36 80q4 34 28 34t28-34q-6 8-28 10q-22-2-28-10z" fill="#e9e9e9"/>`);
      partes.push(`<path d="M50 86q14 6 28 0" stroke="#e9e9e9" stroke-width="6" stroke-linecap="round"/>`);
      break;
    case 'liso': // cabelo grisalho penteado
      partes.push(`<path d="M34 62q0-28 30-30t30 30q-10-14-30-14t-30 14z" fill="${cabelo}"/>`);
      break;
    case 'coque': // cabelo preso + coque
      partes.push(`<path d="M34 66q0-30 30-32t30 32q-8-16-30-16t-30 16z" fill="${cabelo}"/>`);
      partes.push(`<circle cx="64" cy="30" r="13" fill="${cabelo}"/><circle cx="60" cy="26" r="3" fill="#fff" opacity=".25"/>`);
      break;
    case 'barba-escura': // cabelo curto escuro + barba escura
      partes.push(`<path d="M34 64q0-26 30-28t30 28q-10-12-30-12t-30 12z" fill="${cabelo}"/>`);
      partes.push(`<path d="M38 84q6 28 26 28t26-28q-8 8-26 9q-18-1-26-9z" fill="${cabelo}"/>`);
      break;
    case 'ruiva': // cabelo curto volumoso
      partes.push(`<path d="M30 74q-4-42 34-42t34 42q-8-24-34-24t-34 24z" fill="${cabelo}"/>`);
      partes.push(`<path d="M30 74q-2 10 6 14q-4-12 2-20z M98 74q2 10-6 14q4-12-2-20z" fill="${cabelo}"/>`);
      break;
    case 'militar': // cabelo raspado
      partes.push(`<path d="M36 60q0-20 28-22t28 22q-10-8-28-8t-28 8z" fill="${cabelo}"/>`);
      break;
    default: break;
  }
  partes.push(olhos(0, expressao !== 'bravo'));
  if (expressao === 'bravo') partes.push(`<path d="M46 58l16 4M82 58l-16 4" stroke="#222" stroke-width="3" stroke-linecap="round"/>`);
  if (oculosCor) partes.push(oculos(oculosCor));
  partes.push(expressao === 'bravo' ? careta(88) : sorriso(86));
  return svg(128, partes.join(''));
}

const PECAS = {
  lula: rosto({ fundo: CORES.lula, pele: '#e0a884', cabelo: '#bdbdbd', estilo: 'careca-barba' }),
  alckmin: rosto({ fundo: CORES.alckmin, pele: '#f1c9a5', cabelo: '#9a9a9a', estilo: 'liso', oculosCor: '#2b2b2b' }),
  marina: rosto({ fundo: CORES.marina, pele: '#9c6b43', cabelo: '#2a1a12', estilo: 'coque', oculosCor: '#4a3a2a' }),
  boulos: rosto({ fundo: CORES.boulos, pele: '#e8b996', cabelo: '#2b1d14', estilo: 'barba-escura' }),
  dilma: rosto({ fundo: CORES.dilma, pele: '#f0c5a3', cabelo: '#b8452b', estilo: 'ruiva' }),
};

const OBSTACULOS = {
  // bloco de concreto com rosto bravo; a rachadura do 2o golpe é desenhada pela cena
  bolsonaro: svg(128,
    `<rect x="4" y="4" width="120" height="120" rx="10" fill="#5c6b4a" stroke="#2f3a24" stroke-width="4"/>` +
    `<g fill="#2f3a24"><circle cx="16" cy="16" r="4"/><circle cx="112" cy="16" r="4"/><circle cx="16" cy="112" r="4"/><circle cx="112" cy="112" r="4"/></g>` +
    `<ellipse cx="64" cy="72" rx="28" ry="32" fill="#e3b08c"/>` +
    `<path d="M38 60q0-20 26-22t26 22q-8-8-26-8t-26 8z" fill="#2a2a2a"/>` +
    olhos(0, true) + `<path d="M46 58l16 4M82 58l-16 4" stroke="#222" stroke-width="3" stroke-linecap="round"/>` + careta(86)),
  flavio: svg(256,
    `<rect x="6" y="6" width="244" height="244" rx="18" fill="#3a3a4a" stroke="#15151d" stroke-width="6"/>` +
    `<rect x="6" y="6" width="244" height="46" rx="18" fill="#c8102e"/>` +
    `<text x="128" y="40" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">CHEFE</text>` +
    `<ellipse cx="128" cy="150" rx="56" ry="64" fill="#e8b996"/>` +
    `<path d="M74 128q0-44 54-46t54 46q-14-18-54-18t-54 18z" fill="#2a2a2a"/>` +
    `<circle cx="108" cy="146" r="7" fill="#222"/><circle cx="148" cy="146" r="7" fill="#222"/>` +
    `<path d="M94 132l24 6M162 132l-24 6" stroke="#222" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M104 190q24-18 48 0" stroke="#3a1a1a" stroke-width="6" fill="none" stroke-linecap="round"/>`),
  // gelatina translúcida (fica embaixo da peça)
  damares: svg(128,
    `<rect x="6" y="6" width="116" height="116" rx="16" fill="#ff5fa2" opacity=".55"/>` +
    `<rect x="14" y="14" width="100" height="40" rx="14" fill="#fff" opacity=".35"/>` +
    `<text x="64" y="104" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#7a0040" opacity=".7" text-anchor="middle">GELATINA</text>`),
  // corrente em X (fica por cima da peça)
  pazuello: svg(128,
    `<g fill="none" stroke="#9aa0a6" stroke-width="7" stroke-linecap="round">` +
    [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${20 + i * 22}" cy="${20 + i * 22}" rx="11" ry="7" transform="rotate(45 ${20 + i * 22} ${20 + i * 22})"/>`).join('') +
    [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${108 - i * 22}" cy="${20 + i * 22}" rx="11" ry="7" transform="rotate(-45 ${108 - i * 22} ${20 + i * 22})"/>`).join('') +
    `</g><circle cx="64" cy="64" r="16" fill="#5f6368" stroke="#2b2f33" stroke-width="4"/><rect x="58" y="58" width="12" height="14" rx="2" fill="#2b2f33"/>`),
  // boi da boiada
  salles: svg(128,
    `<rect x="4" y="4" width="120" height="120" rx="18" fill="#8b5a2b"/>` +
    `<path d="M30 40q-14-14-4-26q10 6 14 20z M98 40q14-14 4-26q-10 6-14 20z" fill="#e8d9c2"/>` +
    `<ellipse cx="64" cy="74" rx="36" ry="40" fill="#f7f3ea"/>` +
    `<path d="M44 48q10-6 16 6q-12 6-16-6z M78 90q12-4 14 8q-12 2-14-8z" fill="#222"/>` +
    `<ellipse cx="64" cy="94" rx="20" ry="13" fill="#f2a6b8"/><circle cx="56" cy="94" r="3" fill="#7a3a4a"/><circle cx="72" cy="94" r="3" fill="#7a3a4a"/>` +
    `<circle cx="50" cy="66" r="4" fill="#222"/><circle cx="78" cy="66" r="4" fill="#222"/>`),
  // jornal com carimbo FAKE
  fakenews: svg(128,
    `<rect x="12" y="10" width="104" height="108" rx="6" fill="#f4f1e8" stroke="#8a8578" stroke-width="3"/>` +
    `<rect x="22" y="20" width="84" height="14" fill="#2b2b2b"/>` +
    [42, 52, 62, 72, 82, 92].map((y) => `<rect x="22" y="${y}" width="${y % 20 === 2 ? 84 : 60}" height="5" fill="#9a968c"/>`).join('') +
    `<g transform="rotate(-18 64 70)"><rect x="24" y="54" width="80" height="32" rx="4" fill="none" stroke="#c8102e" stroke-width="5"/>` +
    `<text x="64" y="79" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#c8102e" text-anchor="middle">FAKE</text></g>`),
};

// Mão fazendo o L (indicador para cima, polegar para o lado)
const MAO_L = svg(128,
  `<circle cx="64" cy="64" r="58" fill="#ffdf00"/>` +
  `<path d="M52 118q-18-2-22-26v-26q0-7 7-7t7 7v10h4v-50q0-8 8-8t8 8v50h4" fill="#f0b48a" stroke="#8a4b2a" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M68 70h30q8 0 8 8t-8 8h-14q6 8 2 16q-6 10-20 10h-14" fill="#f0b48a" stroke="#8a4b2a" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M56 108q10 4 18 0" stroke="#8a4b2a" stroke-width="3" fill="none" stroke-linecap="round"/>`);

function gerar(dir) {
  const grava = (rel, conteudo) => { const p = path.join(dir, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, conteudo); };
  for (const [nome, s] of Object.entries(PECAS)) grava(path.join('pecas', nome + '.svg'), s);
  for (const [nome, s] of Object.entries(OBSTACULOS)) grava(path.join('obstaculos', nome + '.svg'), s);
  grava('mao-L.svg', MAO_L);
}

module.exports = { gerar, CORES };
if (require.main === module) { gerar(__dirname); console.log('Arte gerada em ' + __dirname); }

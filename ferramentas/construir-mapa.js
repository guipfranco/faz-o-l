// Uso: node ferramentas/construir-mapa.js
// Baixa (se preciso) o GeoJSON dos estados, simplifica e grava dados/mapaBr.js
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const URL_FONTE = 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson';
const ARQ_FONTE = path.join(__dirname, 'fontes', 'brazil-states.geojson');
const ARQ_SAIDA = path.join(__dirname, '..', 'dados', 'mapaBr.js');
const TOLERANCIA = 0.04; // graus; ~4 km
const ESCALA = 10;        // unidades SVG por grau
const COS_LAT = Math.cos((15 * Math.PI) / 180);

function baixar(url, destino, tentativas) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location && tentativas > 0) {
        r.resume();
        return baixar(r.headers.location, destino, tentativas - 1).then(resolve, reject);
      }
      if (r.statusCode !== 200) return reject(new Error('HTTP ' + r.statusCode + ' ao baixar ' + url));
      const f = fs.createWriteStream(destino);
      r.pipe(f);
      f.on('finish', () => f.close(resolve));
      f.on('error', reject);
    }).on('error', reject);
  });
}

function distanciaAoSegmento(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

// Douglas-Peucker iterativo
function simplificar(pontos, tol) {
  if (pontos.length < 3) return pontos;
  const manter = new Array(pontos.length).fill(false);
  manter[0] = manter[pontos.length - 1] = true;
  const pilha = [[0, pontos.length - 1]];
  while (pilha.length) {
    const [i0, i1] = pilha.pop();
    let maxD = 0, idx = -1;
    for (let i = i0 + 1; i < i1; i++) {
      const d = distanciaAoSegmento(pontos[i], pontos[i0], pontos[i1]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) { manter[idx] = true; pilha.push([i0, idx], [idx, i1]); }
  }
  return pontos.filter((_, i) => manter[i]);
}

function aneis(geometria) {
  if (geometria.type === 'Polygon') return geometria.coordinates;
  if (geometria.type === 'MultiPolygon') return geometria.coordinates.flat();
  return [];
}

function centroide(anel) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < anel.length - 1; i++) {
    const [x0, y0] = anel[i], [x1, y1] = anel[i + 1];
    const f = x0 * y1 - x1 * y0;
    a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-9) return anel[0];
  a *= 0.5;
  return [cx / (6 * a), cy / (6 * a)];
}

async function principal() {
  if (!fs.existsSync(ARQ_FONTE)) {
    fs.mkdirSync(path.dirname(ARQ_FONTE), { recursive: true });
    console.log('Baixando ' + URL_FONTE);
    await baixar(URL_FONTE, ARQ_FONTE, 3);
  }
  const geo = JSON.parse(fs.readFileSync(ARQ_FONTE, 'utf8'));
  const porSigla = {};
  for (const f of geo.features) {
    const sigla = f.properties.sigla;
    const simples = aneis(f.geometry).map((anel) => simplificar(anel, TOLERANCIA)).filter((anel) => anel.length >= 4);
    porSigla[sigla] = simples;
  }
  let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
  for (const lista of Object.values(porSigla)) for (const anel of lista) for (const [lon, lat] of anel) {
    lonMin = Math.min(lonMin, lon); lonMax = Math.max(lonMax, lon); latMin = Math.min(latMin, lat); latMax = Math.max(latMax, lat);
  }
  const proj = ([lon, lat]) => [((lon - lonMin) * COS_LAT * ESCALA), ((latMax - lat) * ESCALA)];
  const r1 = (x) => Math.round(x * 10) / 10;
  const largura = r1((lonMax - lonMin) * COS_LAT * ESCALA), altura = r1((latMax - latMin) * ESCALA);

  const estados = {}, centros = {};
  for (const [sigla, lista] of Object.entries(porSigla)) {
    estados[sigla] = lista.map((anel) => {
      const pts = anel.map(proj);
      return 'M' + pts.map(([x, y], i) => (i === 0 ? '' : 'L') + r1(x) + ' ' + r1(y)).join('') + 'Z';
    }).join('');
    const maior = lista.reduce((m, anel) => (anel.length > m.length ? anel : m), lista[0]);
    const [cx, cy] = proj(centroide(maior));
    centros[sigla] = [r1(cx), r1(cy)];
  }

  const corpo = JSON.stringify({ viewBox: '0 0 ' + largura + ' ' + altura, estados, centros });
  const saida = '// Gerado por ferramentas/construir-mapa.js. Fonte: ver arte/LICENCAS.md\n' +
    '(function (raiz) {\n  \'use strict\';\n  const M = ' + corpo + ';\n' +
    '  if (typeof module !== \'undefined\' && module.exports) module.exports = M;\n' +
    '  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.dados.mapaBr = M; }\n' +
    '})(typeof globalThis !== \'undefined\' ? globalThis : this);\n';
  fs.writeFileSync(ARQ_SAIDA, saida);
  console.log('Gravado ' + ARQ_SAIDA + ' (' + saida.length + ' bytes, ' + Object.keys(estados).length + ' estados)');
}

principal().catch((e) => { console.error(e); process.exit(1); });

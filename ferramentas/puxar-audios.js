// Uso: node ferramentas/puxar-audios.js [--forcar]
// Baixa para audios/<id>.mp3 os clipes do app Medo e Delírio em Brasília ligados às frases pelo campo `medoDelirio`.
// Os clipes antigos estão no repositório do app (GitHub); os novos só existem no servidor dele.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const frases = require('../dados/frases');

const API = 'https://api.medodelirioios.com/';
const REPO = 'https://raw.githubusercontent.com/rafaelclaycon/MedoDelirioBrasilia/main/MedoDelirioBrasilia/Resources/Sounds/';
const pasta = path.join(__dirname, '..', 'audios');
const forcar = process.argv.includes('--forcar');

async function baixar(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status + ' em ' + url);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) throw new Error('arquivo pequeno demais em ' + url);
  return buf;
}

(async () => {
  const r = await fetch(API + 'api/v3/all-sounds');
  if (!r.ok) throw new Error('acervo indisponível: ' + r.status);
  const acervo = new Map((await r.json()).map((s) => [s.id, s]));
  let baixados = 0, falhas = 0;
  for (const f of frases.lista.filter((x) => x.medoDelirio)) {
    const destino = path.join(pasta, f.id + '.mp3');
    if (!forcar && fs.existsSync(destino)) continue;
    const som = acervo.get(f.medoDelirio);
    if (!som) { console.error('  não está no acervo: ' + f.id + ' (' + f.medoDelirio + ')'); falhas++; continue; }
    // filename vem como "<arquivo>.mp3.mp3"; vazio (".mp3") quando o clipe só existe no servidor
    const arquivo = som.filename.replace(/\.mp3$/, '');
    const urls = [];
    if (arquivo) urls.push(REPO + encodeURIComponent(arquivo));
    urls.push(API + 'sounds/' + som.id + '.mp3');
    let ok = false;
    for (const url of urls) {
      try { fs.writeFileSync(destino, await baixar(url)); ok = true; break; } catch (e) { /* tenta a próxima */ }
    }
    if (ok) { baixados++; console.log('  ' + f.id + '.mp3  ← ' + som.title); }
    else { falhas++; console.error('  falhou: ' + f.id + ' (' + som.title + ')'); }
  }
  console.log(baixados + ' baixados, ' + falhas + ' falhas.');
  if (falhas) process.exitCode = 1;
})().catch((e) => { console.error(e.message); process.exitCode = 1; });

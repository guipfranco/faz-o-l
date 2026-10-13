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
const TIMEOUT_MS = 20000, SIMULTANEOS = 4;

async function baixar(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) throw new Error('arquivo pequeno demais (' + buf.length + ' bytes)');
  return buf;
}

async function puxar(f, acervo) {
  const som = acervo.get(f.medoDelirio);
  if (!som) throw new Error('não está no acervo (' + f.medoDelirio + ')');
  // filename vem como "<arquivo>.mp3.mp3"; vazio (".mp3") quando o clipe só existe no servidor
  const arquivo = String(som.filename || '').replace(/\.mp3$/, '');
  const urls = [];
  if (arquivo) urls.push(REPO + encodeURIComponent(arquivo));
  urls.push(API + 'sounds/' + som.id + '.mp3');
  const motivos = [];
  for (const url of urls) {
    try { fs.writeFileSync(path.join(pasta, f.id + '.mp3'), await baixar(url)); return som.title; }
    catch (e) { motivos.push(e.message + ' em ' + url); }
  }
  throw new Error(motivos.join('; '));
}

(async () => {
  const r = await fetch(API + 'api/v3/all-sounds', { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error('acervo indisponível: HTTP ' + r.status);
  const acervo = new Map((await r.json()).map((s) => [s.id, s]));
  const fila = frases.lista.filter((f) => f.medoDelirio && (forcar || !fs.existsSync(path.join(pasta, f.id + '.mp3'))));
  let baixados = 0, falhas = 0;
  async function trabalhador() {
    for (let f = fila.shift(); f; f = fila.shift()) {
      try { const titulo = await puxar(f, acervo); baixados++; console.log('  ' + f.id + '.mp3  ← ' + titulo); }
      catch (e) { falhas++; console.error('  falhou: ' + f.id + ': ' + e.message); }
    }
  }
  await Promise.all(Array.from({ length: SIMULTANEOS }, trabalhador));
  console.log(baixados + ' baixados, ' + falhas + ' falhas.');
  if (falhas) process.exitCode = 1;
})().catch((e) => { console.error(e.message); process.exitCode = 1; });

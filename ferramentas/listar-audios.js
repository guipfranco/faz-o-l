// Uso: node ferramentas/listar-audios.js  (regera audios/LEIA-ME.txt a partir de dados/frases.js)
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const frases = require('../dados/frases');

const linhas = [
  'ÁUDIOS DO FAZ O L',
  '',
  'Coloque nesta pasta arquivos .mp3 com os nomes abaixo. Quando o arquivo existe, o jogo toca o clipe;',
  'quando não existe, o Chrome lê o texto com voz sintetizada; frases marcadas como "só áudio" ficam mudas sem arquivo.',
  'Os marcados com [MDB] vêm do acervo do app Medo e Delírio em Brasília (github.com/rafaelclaycon/MedoDelirioBrasilia)',
  'e são baixados com: node ferramentas/puxar-audios.js',
  '',
];
const porPersonagem = {};
for (const f of frases.lista) (porPersonagem[f.personagem] = porPersonagem[f.personagem] || []).push(f);
for (const [p, lista] of Object.entries(porPersonagem)) {
  linhas.push('== ' + (frases.NOMES[p] || p) + ' ==');
  for (const f of lista) linhas.push('  ' + f.id + '.mp3' + (f.somenteAudio ? '   (só áudio)' : '   "' + f.texto + '"') + (f.medoDelirio ? '   [MDB]' : ''));
  linhas.push('');
}
const destino = path.join(__dirname, '..', 'audios', 'LEIA-ME.txt');
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, linhas.join('\n'));
console.log('Gravado ' + destino);

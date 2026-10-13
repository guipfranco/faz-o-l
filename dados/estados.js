(function (raiz) {
  'use strict';
  const M = {};

  const PADRAO = [
    { id: 'escola', nome: 'Escola', icone: '🏫' },
    { id: 'saude', nome: 'Posto de saúde', icone: '🏥' },
    { id: 'casas', nome: 'Casas populares', icone: '🏠' },
  ];
  const TEMATICAS = {
    cisterna: { id: 'cisterna', nome: 'Cisternas', icone: '💧' },
    floresta: { id: 'floresta', nome: 'Reflorestamento', icone: '🌳' },
    metro: { id: 'metro', nome: 'Metrô', icone: '🚇' },
    universidade: { id: 'universidade', nome: 'Universidade', icone: '🎓' },
  };

  // [sigla, nome, regiao, qtdFases, tematica?]  (soma das fases = 96)
  const ROTA = [
    ['PE', 'Pernambuco', 'Nordeste', 5, 'cisterna'], ['PB', 'Paraíba', 'Nordeste', 4, 'cisterna'],
    ['RN', 'Rio Grande do Norte', 'Nordeste', 3, 'cisterna'], ['CE', 'Ceará', 'Nordeste', 4, 'cisterna'],
    ['PI', 'Piauí', 'Nordeste', 3, 'cisterna'], ['MA', 'Maranhão', 'Nordeste', 4], ['AL', 'Alagoas', 'Nordeste', 3],
    ['SE', 'Sergipe', 'Nordeste', 4], ['BA', 'Bahia', 'Nordeste', 3, 'cisterna'],
    ['PA', 'Pará', 'Norte', 4, 'floresta'], ['AP', 'Amapá', 'Norte', 3, 'floresta'], ['AM', 'Amazonas', 'Norte', 4, 'floresta'],
    ['RR', 'Roraima', 'Norte', 3, 'floresta'], ['AC', 'Acre', 'Norte', 4, 'floresta'], ['RO', 'Rondônia', 'Norte', 3, 'floresta'],
    ['TO', 'Tocantins', 'Norte', 4],
    ['GO', 'Goiás', 'Centro-Oeste', 3], ['DF', 'Distrito Federal', 'Centro-Oeste', 4, 'universidade'],
    ['MT', 'Mato Grosso', 'Centro-Oeste', 3], ['MS', 'Mato Grosso do Sul', 'Centro-Oeste', 4],
    ['MG', 'Minas Gerais', 'Sudeste', 3, 'metro'], ['ES', 'Espírito Santo', 'Sudeste', 4],
    ['RJ', 'Rio de Janeiro', 'Sudeste', 3, 'metro'], ['SP', 'São Paulo', 'Sudeste', 4, 'metro'],
    ['PR', 'Paraná', 'Sul', 3], ['SC', 'Santa Catarina', 'Sul', 4], ['RS', 'Rio Grande do Sul', 'Sul', 3],
  ];

  M.lista = [];
  M.porSigla = {};
  let fase = 1;
  ROTA.forEach((r, i) => {
    const [sigla, nome, regiao, qtdFases, tematica] = r;
    const obras = PADRAO.map((o) => Object.assign({}, o));
    if (tematica) obras[2] = Object.assign({}, TEMATICAS[tematica]);
    const proximaRegiao = ROTA[i + 1] ? ROTA[i + 1][2] : null;
    const e = { sigla, nome, regiao, qtdFases, obras, faseInicial: fase, faseFinal: fase + qtdFases - 1, ultimoDaRegiao: proximaRegiao !== regiao };
    M.lista.push(e);
    M.porSigla[sigla] = e;
    fase += qtdFases;
  });
  M.TOTAL_FASES = fase - 1;
  M.REGIOES = ['Nordeste', 'Norte', 'Centro-Oeste', 'Sudeste', 'Sul'];

  M.indice = function (sigla) { return M.lista.findIndex((e) => e.sigla === sigla); };
  M.proximo = function (sigla) { const i = M.indice(sigla); return i >= 0 && i + 1 < M.lista.length ? M.lista[i + 1] : null; };
  M.estadoDaFase = function (n) { return M.lista.find((e) => n >= e.faseInicial && n <= e.faseFinal) || null; };
  M.ehFaseDeChefe = function (n) { const e = M.estadoDaFase(n); return !!e && e.ultimoDaRegiao && n === e.faseFinal; };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.dados.estados = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

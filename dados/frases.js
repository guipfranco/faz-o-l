(function (raiz) {
  'use strict';
  const M = {};

  M.NOMES = {
    lula: 'Lula', alckmin: 'Alckmin', marina: 'Marina', boulos: 'Boulos', dilma: 'Dilma',
    bolsonaro: 'Bolsonaro', salles: 'Salles', damares: 'Damares', pazuello: 'Pazuello', fakenews: 'Fake news', flavio: 'Flávio',
  };

  // Edite à vontade. Regra: toda frase com texto precisa de fonte (URL).
  // medoDelirio: id do clipe no acervo do app Medo e Delírio em Brasília; `node ferramentas/puxar-audios.js` baixa para audios/<id>.mp3.
  const MDB = 'https://github.com/rafaelclaycon/MedoDelirioBrasilia';
  const CLIPE = 'Clipe do app Medo e Delírio em Brasília';
  M.lista = [
    // Lula
    { id: 'lula-nunca-antes', personagem: 'lula', texto: 'Nunca antes na história deste país!', gatilhos: ['match', 'estrela'],
      contexto: 'Bordão dos mandatos de 2003 a 2010', fonte: 'https://periodicos.ufes.br/dimensoes/article/download/2598/2094/4018' },
    { id: 'lula-sou-uma-ideia', personagem: 'lula', texto: 'Eu não sou mais um ser humano, eu sou uma ideia.', gatilhos: ['match'],
      contexto: 'Sindicato dos Metalúrgicos, São Bernardo do Campo, 07/04/2018', fonte: 'https://www.jb.com.br/pais/noticias/2018/04/07/as-principais-frases-do-discurso-de-lula/' },
    { id: 'lula-brasil-de-volta', personagem: 'lula', texto: 'O Brasil está de volta!', gatilhos: ['match', 'vitoria', 'estado'],
      contexto: 'COP27, Egito, 16/11/2022', fonte: 'https://www.em.com.br/app/noticia/politica/2022/11/16/interna_politica,1421644/o-brasil-esta-de-volta-como-foi-primeiro-discurso-de-lula-na-cop27.shtml' },
    { id: 'lula-picanha', personagem: 'lula', texto: 'O povo vai voltar a comer picanha e tomar uma cervejinha.', gatilhos: ['match', 'vitoria'],
      contexto: 'Entrevista ao Jornal Nacional, agosto de 2022', fonte: 'https://sbtnews.sbt.com.br/noticia/politica/nao-esqueci-da-cervejinha-e-da-picanha-diz-lula-ao-comentar-que-queda-de-popularidade-nao-preocupa' },
    { id: 'lula-faz-o-l', personagem: 'lula', texto: 'Faz o L!', gatilhos: ['L'],
      contexto: 'Gesto e bordão da campanha de 2022', fonte: 'https://pt.wikipedia.org/wiki/Faz_o_L' },
    { id: 'lula-esperanca', personagem: 'lula', texto: 'A esperança finalmente venceu o medo.', gatilhos: ['match', 'vitoria', 'estado'],
      contexto: 'Discurso da vitória de 2002 (TV Câmara)', fonte: MDB, medoDelirio: '06BB6AC8-F3BF-4995-A7B1-0ECD5013D146' },
    { id: 'lula-ze-gotinha', personagem: 'lula', texto: 'Cadê o nosso querido Zé Gotinha?', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: 'DAF7180B-55B4-4499-B2F6-21E359707394' },
    { id: 'lula-vacina', personagem: 'lula', texto: 'Eu vou tomar a minha vacina.', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: '96B4C13C-4B27-433C-AE7A-0DAEEC3E644E' },
    { id: 'lula-deus-de-barro', personagem: 'lula', texto: 'Deus de barro não dura muito tempo.', gatilhos: ['match', 'vitoria'],
      contexto: CLIPE, fonte: MDB, medoDelirio: '603B63CC-9AE1-4043-884D-E8DD165B7259' },

    // Alckmin
    { id: 'alckmin-gag', personagem: 'alckmin', texto: 'Gag de la gag!', gatilhos: ['match'],
      contexto: 'Vídeo sobre o programa Carro Sustentável, abril de 2026', fonte: 'https://www.portaltela.com/noticias/politica/2026/04/19/alckmin-faz-brincadeira-e-cita-expressao-gag-de-la-gag-em-goias/' },
    { id: 'alckmin-dr-geraldo', personagem: 'alckmin', texto: 'Dr. Geraldo responde.', gatilhos: ['match'],
      contexto: 'Série de memes do perfil oficial sobre a Nova Indústria Brasil, janeiro de 2024', fonte: 'https://oantagonista.com.br/?p=1042782' },

    // Marina
    { id: 'marina-boiadas', personagem: 'marina', texto: 'Boiadas se passaram no lugar onde apenas deveriam se passar políticas de proteção ambiental.', gatilhos: ['match'],
      contexto: 'Discurso de posse no Ministério do Meio Ambiente, 2023', fonte: 'https://www.moneytimes.com.br/em-posse-concorrida-marina-silva-fala-em-fim-da-barbarie-veja-discurso-na-integra-de-nova-ministra/' },
    { id: 'marina-apatia', personagem: 'marina', texto: 'A maior ameaça ambiental no Brasil é a apatia.', gatilhos: ['match'], revisar: true,
      contexto: 'Atribuída em lista de frases ambientais; confirmar redação literal', fonte: 'https://www.oeco.org.br/wp-content/uploads/wp-post-to-pdf-enhanced-cache/1/21-frases-de-meio-ambiente-por-politicos.pdf' },

    // Boulos
    { id: 'boulos-vai-vencer', personagem: 'boulos', texto: 'Não foi nessa eleição, mas a gente vai ganhar!', gatilhos: ['match'],
      contexto: 'Discurso após o 2º turno em São Paulo, 29/11/2020', fonte: 'https://www.agazeta.com.br/brasil/guilherme-boulos-nao-foi-nessa-eleicao-mas-a-gente-vai-ganhar-1120' },
    { id: 'boulos-nao-por-eleicao', personagem: 'boulos', texto: 'Nós não estamos na política por causa de eleição.', gatilhos: ['match'],
      contexto: 'Campanha de 2024', fonte: 'https://www.bandab.com.br/politica/boulos-repete-lula-com-carta-para-tentar-reduzir-rejeicao-e-decide-dormir-na-casa-de-eleitores/amp/' },

    // Dilma
    { id: 'dilma-dobrar-meta', personagem: 'dilma', texto: 'Vamos dobrar a meta!', gatilhos: ['match'],
      contexto: 'Anúncio do Pronatec, julho de 2015', fonte: 'https://www.tnh1.com.br/noticia/nid/em-ato-dos-cem-dias-damares-parodia-dilma-e-diz-que-vai-dobrar-meta/' },
    { id: 'dilma-estocar-vento', personagem: 'dilma', texto: 'Estocar vento.', gatilhos: ['match'],
      contexto: 'Discurso sobre energia eólica', fonte: 'https://jus.com.br/artigos/43635/dilma-rousseff-e-o-vento-muito-alem-de-dilma' },
    { id: 'dilma-milho', personagem: 'dilma', texto: 'O milho!', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: 'DCFB6973-3567-448D-B424-3C3A0AEDAAB2' },
    { id: 'dilma-speak-slowly', personagem: 'dilma', texto: 'If you speak slowly, I understand very well.', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: '91BDE728-E258-4C22-A8F9-0D54976A0C09' },

    // Bolsonaro (obstáculo)
    { id: 'bolso-coveiro', personagem: 'bolsonaro', texto: 'Eu não sou coveiro, tá ok?', gatilhos: ['match', 'derrota'],
      contexto: '20/04/2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/',
      medoDelirio: 'EEDCDF2D-EB90-4D99-A33E-3C16710601C4' },
    { id: 'bolso-e-dai', personagem: 'bolsonaro', texto: 'E daí?', gatilhos: ['match', 'derrota'],
      contexto: 'Abril de 2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/',
      medoDelirio: '08B6CB06-28E1-4A6D-934E-B5E715D56C05' },
    { id: 'bolso-gripezinha', personagem: 'bolsonaro', texto: 'Gripezinha ou resfriadinho.', gatilhos: ['match'],
      contexto: 'Março de 2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/',
      medoDelirio: '67A4DE46-4CCA-42F7-945D-7AB86C95B5E0' },
    { id: 'bolso-esgoto', personagem: 'bolsonaro', texto: 'O cara pula em esgoto, sai, mergulha e não acontece nada.', gatilhos: ['match'],
      contexto: '26/03/2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/' },
    { id: 'bolso-messias', personagem: 'bolsonaro', texto: 'Eu sou Messias, mas não faço milagre.', gatilhos: ['match', 'derrota'],
      contexto: 'Abril de 2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/' },
    { id: 'bolso-virus-sou-eu', personagem: 'bolsonaro', texto: 'Pra mídia, o vírus sou eu.', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: 'EEFBA8B5-AA66-4602-AE24-5F3C1070BEBC' },
    { id: 'bolso-ousado', personagem: 'bolsonaro', texto: 'Eu não sou médico, mas sou ousado.', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: 'DB99A7ED-00D3-444C-89B6-BB24B9801014' },
    { id: 'bolso-vitoria-lula', personagem: 'bolsonaro', texto: 'Vai dar vitória pro Lula, sem problema nenhum.', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: '1E88A1C3-33EB-4E82-A256-435CB40D821D' },
    { id: 'bolso-lamentamos', personagem: 'bolsonaro', texto: 'O problema tá aí, lamentamos.', gatilhos: ['match', 'derrota'],
      contexto: CLIPE, fonte: MDB, medoDelirio: '48F350A2-FC0F-4B07-9FE6-DBAF8BCFC3B7' },

    // Salles (boiada)
    { id: 'salles-boiada', personagem: 'salles', texto: 'E ir passando a boiada.', gatilhos: ['match', 'boiada'],
      contexto: 'Reunião ministerial de 22/04/2020', fonte: 'https://g1.globo.com/politica/noticia/2020/05/22/ministro-do-meio-ambiente-defende-passar-a-boiada-e-mudar-regras-enquanto-atencao-da-midia-esta-voltada-para-a-covid-19.ghtml',
      medoDelirio: '19DE07D2-E3CC-488E-86AF-C02BD42E3964' },

    // Fake news (fala do Bolsonaro)
    { id: 'fakenews-valido', personagem: 'fakenews', texto: 'Eu acho que até um fake news é válido, com todo o respeito.', gatilhos: ['match'],
      contexto: 'Jair Bolsonaro. ' + CLIPE, fonte: MDB, medoDelirio: '5702813A-AC05-474E-9628-2D6F32EB192E' },

    // Flávio (chefe)
    { id: 'flavio-faz-sentido', personagem: 'flavio', texto: 'Faz algum sentido pra você isso?', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: 'DFF24FB0-9FD5-44A1-8DF6-3D5CD7F9FA9F' },
    { id: 'flavio-tios-zap', personagem: 'flavio', texto: 'Os tios e as tias do zap.', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: '79866084-F57B-4D8E-BDB4-AB8AAF33B063' },
    { id: 'flavio-audio-calma', personagem: 'flavio', texto: 'Irmão, preferi te mandar o áudio aqui pra você ouvir com calma.', gatilhos: ['match'],
      contexto: CLIPE, fonte: MDB, medoDelirio: '68D5081A-27D7-4F70-BC36-C9D3DFCEF738' },

    // Só com áudio fornecido pelo dono do jogo (sem texto verificado; hoje a gelatina e a corrente não falam)
    { id: 'damares-1', personagem: 'damares', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/damares-1.mp3' },
    { id: 'pazuello-1', personagem: 'pazuello', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/pazuello-1.mp3' },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.dados.frases = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

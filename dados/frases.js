(function (raiz) {
  'use strict';
  const M = {};

  M.NOMES = {
    lula: 'Lula', alckmin: 'Alckmin', marina: 'Marina', boulos: 'Boulos', dilma: 'Dilma',
    bolsonaro: 'Bolsonaro', salles: 'Salles', damares: 'Damares', pazuello: 'Pazuello', fakenews: 'Fake news', flavio: 'Flávio',
  };

  // Edite à vontade. Regra: toda frase com texto precisa de fonte (URL).
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

    // Alckmin
    { id: 'alckmin-gag', personagem: 'alckmin', texto: 'Gag de la gag!', gatilhos: ['match'],
      contexto: 'Vídeo sobre o programa Carro Sustentável, abril de 2026', fonte: 'https://www.portaltela.com/noticias/politica/2026/04/19/alckmin-faz-brincadeira-e-cita-expressao-gag-de-la-gag-em-goias/' },
    { id: 'alckmin-dr-geraldo', personagem: 'alckmin', texto: 'Dr. Geraldo responde.', gatilhos: ['match'],
      contexto: 'Série de memes do perfil oficial sobre a Nova Indústria Brasil, janeiro de 2024', fonte: 'https://oantagonista.com.br/?p=1042782' },

    // Marina
    { id: 'marina-boiadas', personagem: 'marina', texto: 'Boiadas se passaram onde só deveriam passar políticas de proteção ambiental.', gatilhos: ['match'],
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
    { id: 'dilma-estocar-vento', personagem: 'dilma', texto: 'Não dá para estocar vento.', gatilhos: ['match'],
      contexto: 'Discurso sobre energia eólica', fonte: 'https://jus.com.br/artigos/43635/dilma-rousseff-e-o-vento-muito-alem-de-dilma' },

    // Bolsonaro (obstáculo)
    { id: 'bolso-coveiro', personagem: 'bolsonaro', texto: 'Eu não sou coveiro, tá?', gatilhos: ['match', 'derrota'],
      contexto: '20/04/2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/' },
    { id: 'bolso-e-dai', personagem: 'bolsonaro', texto: 'E daí? Lamento.', gatilhos: ['match', 'derrota'],
      contexto: 'Abril de 2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/' },
    { id: 'bolso-gripezinha', personagem: 'bolsonaro', texto: 'Uma gripezinha.', gatilhos: ['match'],
      contexto: 'Março de 2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/' },
    { id: 'bolso-esgoto', personagem: 'bolsonaro', texto: 'O cara pula em esgoto, sai, mergulha e não acontece nada.', gatilhos: ['match'],
      contexto: '26/03/2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/' },
    { id: 'bolso-messias', personagem: 'bolsonaro', texto: 'Eu sou Messias, mas não faço milagre.', gatilhos: ['match', 'derrota'],
      contexto: 'Abril de 2020', fonte: 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/' },

    // Salles (boiada)
    { id: 'salles-boiada', personagem: 'salles', texto: 'Passar a boiada!', gatilhos: ['match', 'boiada'],
      contexto: 'Reunião ministerial de 22/04/2020', fonte: 'https://g1.globo.com/politica/noticia/2020/05/22/ministro-do-meio-ambiente-defende-passar-a-boiada-e-mudar-regras-enquanto-atencao-da-midia-esta-voltada-para-a-covid-19.ghtml' },

    // Só com áudio fornecido pelo dono do jogo (sem texto verificado)
    { id: 'damares-1', personagem: 'damares', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/damares-1.mp3' },
    { id: 'pazuello-1', personagem: 'pazuello', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/pazuello-1.mp3' },
    { id: 'fakenews-1', personagem: 'fakenews', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/fakenews-1.mp3' },
    { id: 'flavio-1', personagem: 'flavio', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/flavio-1.mp3' },
    { id: 'flavio-2', personagem: 'flavio', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/flavio-2.mp3' },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.dados.frases = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

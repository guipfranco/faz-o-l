(function (raiz) {
  'use strict';
  const M = {};

  M.NOMES = {
    lula: 'Lula', alckmin: 'Alckmin', marina: 'Marina', boulos: 'Boulos', dilma: 'Dilma',
    bolsonaro: 'Bolsonaro', salles: 'Salles', damares: 'Damares', pazuello: 'Pazuello', fakenews: 'Fake news', flavio: 'Flávio',
    torcida: 'Torcida',
  };

  // Gatilhos de combinação (personagem 'torcida'): listrada, bomba, estrela, L, combo, cascata, vitoria, estado.
  // Obstáculos falam com 'match' quando atingidos; a boiada do Salles também com 'boiada'; o Bolsonaro com 'derrota'.
  // Peça de aliado sem frase própria cai na torcida.
  M.GATILHOS_DE_COMBINACAO = ['listrada', 'bomba', 'estrela', 'L', 'combo', 'cascata', 'vitoria', 'estado'];

  // Edite à vontade. Regras: toda frase com texto tem fonte (URL) e um clipe real (medoDelirio); o jogo não usa voz sintetizada.
  // medoDelirio: id do clipe no acervo do app Medo e Delírio em Brasília; `node ferramentas/puxar-audios.js` baixa para audios/<id>.mp3.
  // quem: quem fala de verdade no clipe, mostrado no balão (sem ele, aparece o nome do personagem).
  const MDB = 'https://github.com/rafaelclaycon/MedoDelirioBrasilia';
  const CLIPE = 'Clipe do app Medo e Delírio em Brasília';
  const PODER360 = 'https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/';
  function clipe(id, personagem, gatilhos, texto, medoDelirio, quem) {
    const f = { id, personagem, texto, gatilhos, contexto: CLIPE, fonte: MDB, medoDelirio };
    if (quem) f.quem = quem;
    return f;
  }

  M.lista = [
    // Aliados: falam quando a peça deles ativa um especial
    clipe('lula-ze-gotinha', 'lula', ['match'], 'Cadê o nosso querido Zé Gotinha?', 'DAF7180B-55B4-4499-B2F6-21E359707394'),
    clipe('lula-vacina', 'lula', ['match'], 'Eu vou tomar a minha vacina.', '96B4C13C-4B27-433C-AE7A-0DAEEC3E644E'),
    clipe('lula-deus-de-barro', 'lula', ['match'], 'Deus de barro não dura muito tempo.', '603B63CC-9AE1-4043-884D-E8DD165B7259'),
    clipe('dilma-milho', 'dilma', ['match'], 'O milho!', 'DCFB6973-3567-448D-B424-3C3A0AEDAAB2'),
    clipe('dilma-speak-slowly', 'dilma', ['match'], 'If you speak slowly, I understand very well.', '91BDE728-E258-4C22-A8F9-0D54976A0C09'),

    // Torcida: peça de aliado sem frase própria (Alckmin, Marina, Boulos)
    clipe('torcida-certissimo', 'torcida', ['match'], 'Tá certíssimo.', 'B8D2D8B3-EDC2-4B2D-88C3-D421F2A6A5A0', 'Luiz Henrique Mandetta'),
    clipe('torcida-olha-so', 'torcida', ['match'], 'Olha só!', 'DC11782C-4B89-48F8-B2FB-223EE21E85F2', 'Mauro Reginato'),
    clipe('torcida-que-demais', 'torcida', ['match'], 'Que demais!', 'C3A036B9-4851-4BA9-8BEF-3D53A7B199EE', 'André Starqueza'),
    clipe('torcida-exatamente', 'torcida', ['match'], 'Exatamente.', '6DF9A6BD-8E99-4478-A9A7-0416373F1BA2', 'Jorge Kajuru'),

    // Listrada (4 em linha)
    clipe('torcida-virou-passeio', 'torcida', ['listrada'], 'Virou passeio!', 'E8BDCFCF-611E-4DB8-ACAD-B1EECF0E3285', 'Galvão Bueno'),
    clipe('torcida-que-beleza', 'torcida', ['listrada'], 'Que beleza!', '743A729D-9E6B-4D66-BBD7-FFEE9B1F7DF6', 'Milton Leite'),
    clipe('torcida-acelera', 'torcida', ['listrada'], 'Celera bem, acelera!', 'D4486434-B7FF-4E03-ABBB-1B4F6643780F', 'A Mãe Copilota'),
    clipe('torcida-olha-que-legal', 'torcida', ['listrada'], 'Olha que legal!', 'EAE25382-F0DA-48C0-9CC9-937E28D13A1E', 'Mauro Reginato'),

    // Bomba (T)
    clipe('torcida-bombando', 'torcida', ['bomba'], 'A economia tá bombando.', '3995320B-F6E8-4DE8-85AB-32B16DFD3480', 'Paulo Guedes'),
    clipe('torcida-agora-aguenta', 'torcida', ['bomba'], 'Agora tu aguenta!', 'C5ADF059-5418-4B12-88E4-9716D7323DA5', 'Dudu Marfetan'),
    clipe('torcida-pra-machucar', 'torcida', ['bomba'], 'Essa é pra machucar!', '691ACA23-DC6D-4D97-B28D-4BB76654E53B', 'Grupo Menos é Mais'),
    clipe('torcida-temperatura', 'torcida', ['bomba'], 'A temperatura subiu.', 'ABBB5138-79D0-49B6-B2F6-059B5204F70C', 'Jair Bolsonaro'),

    // Estrela (5 em linha)
    clipe('torcida-maravilhoso', 'torcida', ['estrela'], 'Maravilhoso!', '1E89F357-287C-4B92-946E-2DDDD3694808', 'Milton Cunha'),
    clipe('torcida-aleluia', 'torcida', ['estrela'], 'Aleluia!', '9FC65F59-EB92-47F7-B5A8-1134AA1125F2', 'Händel'),
    clipe('torcida-um-genio', 'torcida', ['estrela'], 'Um gênio!', 'F609226C-8525-45F8-ADAD-D351E76A2BD6', 'Pica-Pau'),
    clipe('torcida-satisfacao', 'torcida', ['estrela'], 'Que satisfação, aspira!', '2C9DC0D3-E062-4AF7-8414-2FD0E71E44C5', 'Milhem Cortaz (Tropa de Elite)'),

    // O L
    clipe('torcida-barba', 'torcida', ['L'], 'Eu vou votar no barba, maluco, não tem jeito.', 'FC68BB0B-2719-4DC4-848A-38F4097E7390', 'Casimiro'),
    clipe('torcida-bicampeao', 'torcida', ['L'], 'Lula é bicampeão mundial de conciliação.', '70114C90-2306-474C-908A-52E2A9C55BB8', 'Franciel Cruz'),
    clipe('torcida-vitoria-lula', 'torcida', ['L'], 'Vai dar vitória pro Lula, sem problema nenhum.', '1E88A1C3-33EB-4E82-A256-435CB40D821D', 'Jair Bolsonaro'),
    clipe('torcida-lula-em-22', 'torcida', ['L'], 'Quem não tá contente comigo tem Lula em 22.', 'DA0EA59C-170A-44F8-A7C9-ED53609AC84D', 'Jair Bolsonaro'),

    // Combo (dois especiais trocados)
    clipe('torcida-festa-danada', 'torcida', ['combo'], 'Uma festa danada!', '89A8DCD2-7474-4B84-88CA-414E4AA5D843', 'Paulo Guedes'),
    clipe('torcida-mix-insanidade', 'torcida', ['combo'], 'Mix de insanidade!', '1EEDDBAC-252C-47CC-B5E9-C8A5205C8FB4', 'Cristiano Botafogo'),
    clipe('torcida-carnaval', 'torcida', ['combo'], 'É energia aqui, ó, tá em cima. Carnaval, alegria!', '22F39773-96C6-43E6-AC43-C070A9DD9B02', 'Renan (Choque de Cultura)'),
    clipe('torcida-ieie', 'torcida', ['combo'], 'Iéié, ráá!', 'CD14DF9E-66FA-49FA-A4B8-6D9DB486A25F', 'Sérgio Mallandro'),

    // Cascata (3 ou mais quedas seguidas)
    clipe('torcida-calma-que-piora', 'torcida', ['cascata'], 'Calma que piora.', '7A8B10DC-EA45-4D3B-9B57-240991CBD1C0', 'Marcelo Adnet'),
    clipe('torcida-sonhar', 'torcida', ['cascata'], 'Eles tão deixando a gente sonhar.', 'C76DCCEF-0EFE-4CDC-94A9-E8854F524523', 'Ronaldinho Gaúcho'),
    clipe('torcida-rimou', 'torcida', ['cascata'], 'Rimou!', '5C0B6678-E7A0-4A59-BBAA-666EF5976CD8', 'Rafa Chalub'),
    clipe('torcida-que-fase', 'torcida', ['cascata'], 'Que fase!', 'E029ED09-CAE3-43B2-A478-422061A08B5A', 'Milton Leite'),

    // Vitória na fase e estado concluído
    clipe('lula-esperanca', 'torcida', ['vitoria', 'estado'], 'A esperança finalmente venceu o medo.', '06BB6AC8-F3BF-4995-A7B1-0ECD5013D146', 'Lula'),
    clipe('torcida-brasil', 'torcida', ['vitoria'], 'Brasil!', 'B62CDB8A-F6DD-476D-85E0-245327D1B47E', 'Gil do Vigor'),
    clipe('torcida-milicia', 'torcida', ['vitoria'], 'Vencemos a milícia sem dar um tiro.', 'A2B474FD-4704-472F-8D1F-AB6D5E834778', 'Gregório Duvivier'),
    clipe('torcida-missao-cumprida', 'torcida', ['estado'], 'Missão cumprida.', 'AF6C9C84-24ED-4DAB-ADB1-9577B3304B47', 'Eduardo Pazuello'),
    clipe('torcida-vamos-sonhar', 'torcida', ['estado'], 'Vamos sonhar?', 'C77ED8A2-4D18-4B2C-8ABF-FC8E103D00F6', 'Pedro Doria'),
    clipe('torcida-que-lindo', 'torcida', ['estado'], 'Que lindo, cara!', '6BE0B450-C7CB-4EEB-A73B-C26B9E88A236', 'Lui Mendes'),

    // Bolsonaro (obstáculo e derrota)
    Object.assign(clipe('bolso-coveiro', 'bolsonaro', ['match', 'derrota'], 'Eu não sou coveiro, tá ok?', 'EEDCDF2D-EB90-4D99-A33E-3C16710601C4'), { contexto: '20/04/2020', fonte: PODER360 }),
    Object.assign(clipe('bolso-e-dai', 'bolsonaro', ['match', 'derrota'], 'E daí?', '08B6CB06-28E1-4A6D-934E-B5E715D56C05'), { contexto: 'Abril de 2020', fonte: PODER360 }),
    Object.assign(clipe('bolso-gripezinha', 'bolsonaro', ['match'], 'Gripezinha ou resfriadinho.', '67A4DE46-4CCA-42F7-945D-7AB86C95B5E0'), { contexto: 'Março de 2020', fonte: PODER360 }),
    clipe('bolso-virus-sou-eu', 'bolsonaro', ['match'], 'Pra mídia, o vírus sou eu.', 'EEFBA8B5-AA66-4602-AE24-5F3C1070BEBC'),
    clipe('bolso-ousado', 'bolsonaro', ['match'], 'Eu não sou médico, mas sou ousado.', 'DB99A7ED-00D3-444C-89B6-BB24B9801014'),
    clipe('bolso-nao-errei', 'bolsonaro', ['match'], 'Eu não errei nenhuma.', '255825D9-F8EF-4597-B3C4-25B26AAFA4D3'),
    clipe('bolso-lamentamos', 'bolsonaro', ['match', 'derrota'], 'O problema tá aí, lamentamos.', '48F350A2-FC0F-4B07-9FE6-DBAF8BCFC3B7'),
    clipe('bolso-lamento', 'bolsonaro', ['derrota'], 'Lamento, quer que eu faça o quê?', '1BC1AEBA-1E1D-4354-BF1F-94C564F5E677'),

    // Boiada do Salles
    Object.assign(clipe('salles-boiada', 'salles', ['match', 'boiada'], 'E ir passando a boiada.', '19DE07D2-E3CC-488E-86AF-C02BD42E3964'),
      { contexto: 'Reunião ministerial de 22/04/2020', fonte: 'https://g1.globo.com/politica/noticia/2020/05/22/ministro-do-meio-ambiente-defende-passar-a-boiada-e-mudar-regras-enquanto-atencao-da-midia-esta-voltada-para-a-covid-19.ghtml' }),
    clipe('salles-xo', 'salles', ['match', 'boiada'], 'Xô! Xô!', '09C02279-37FB-409F-813B-855B833A0103', 'Milton Cunha'),
    clipe('salles-boi-dormir', 'salles', ['match', 'boiada'], 'Conversa pra boi dormir.', '7918EA30-C9C6-47F8-B228-7AC3F3096321', 'Nikolas Ferreira'),
    clipe('salles-cilada', 'salles', ['boiada'], 'Cilada!', '03637726-B560-4D19-BD28-0AEF8E87DD89', 'Molejo'),

    // Fake news
    clipe('fakenews-valido', 'fakenews', ['match'], 'Eu acho que até um fake news é válido, com todo o respeito.', '5702813A-AC05-474E-9628-2D6F32EB192E', 'Jair Bolsonaro'),
    clipe('fakenews-falsiane', 'fakenews', ['match'], 'Falsiane!', '89610449-2249-40A9-9453-909F98DE255D', 'Laila Brandão'),
    clipe('fakenews-tudo-mentira', 'fakenews', ['match'], 'É mentira, é tudo mentira!', '88950DB7-3FC8-41F5-910E-52B5BDFD9BA2', 'Quércia'),
    clipe('fakenews-fabrication', 'fakenews', ['match'], "It's a total fabrication.", '67DF9018-DA6D-4888-A7F2-FFEFE50AF388', 'Jonathan Frakes'),

    // Flávio (chefe)
    clipe('flavio-faz-sentido', 'flavio', ['match'], 'Faz algum sentido pra você isso?', 'DFF24FB0-9FD5-44A1-8DF6-3D5CD7F9FA9F'),
    clipe('flavio-tios-zap', 'flavio', ['match'], 'Os tios e as tias do zap.', '79866084-F57B-4D8E-BDB4-AB8AAF33B063'),
    clipe('flavio-audio-calma', 'flavio', ['match'], 'Irmão, preferi te mandar o áudio aqui pra você ouvir com calma.', '68D5081A-27D7-4F70-BC36-C9D3DFCEF738'),
    clipe('flavio-audio-longo', 'flavio', ['match'], 'Desculpa o áudio longo aí, tá?', '85393DE7-020C-40E4-BB7C-DD1B8A54D423'),

    // Só com áudio fornecido pelo dono do jogo (sem texto verificado; hoje a gelatina e a corrente não falam)
    { id: 'damares-1', personagem: 'damares', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/damares-1.mp3' },
    { id: 'pazuello-1', personagem: 'pazuello', texto: null, somenteAudio: true, gatilhos: ['match'], contexto: 'Coloque audios/pazuello-1.mp3' },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else { raiz.FazOL = raiz.FazOL || { logica: {}, dados: {}, ui: {} }; raiz.FazOL.dados.frases = M; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

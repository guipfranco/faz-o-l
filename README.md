# Faz o L

Match-3 para Chrome: abra `index.html` com duplo clique. Funciona offline.

- Frases dos personagens e suas fontes: `dados/frases.js`
- Áudios: os clipes ligados ao acervo do app [Medo e Delírio em Brasília](https://github.com/rafaelclaycon/MedoDelirioBrasilia) já vêm em `audios/`; para baixá-los de novo, `node ferramentas/puxar-audios.js` (com `--forcar` para sobrescrever). Outros `.mp3` podem ser colocados lá com os nomes listados em `audios/LEIA-ME.txt`
- Testes: `node --test`
- Regerar mapa: `node ferramentas/construir-mapa.js`
- Regerar arte: `node arte/gerar.js`
- Regerar a lista de áudios: `node ferramentas/listar-audios.js`

## Como jogar

O objetivo é reconstruir o Brasil estado por estado. Cada fase vencida rende até 3 estrelas; com as estrelas você compra as obras do estado (escola, posto de saúde, cisternas, metrô...). Ao terminar as três obras, o estado fica verde e amarelo e o próximo estado da rota é liberado.

- **Troca:** arraste uma peça até a vizinha, ou clique numa peça e depois na vizinha. A troca só vale se formar uma linha de 3 ou mais peças iguais; senão as peças voltam.
- **Especiais:**
  - 4 em linha criam uma peça **listrada**, que limpa a linha ou a coluna inteira.
  - 5 em forma de T criam uma **bomba**, que limpa o quadrado 3x3 em volta.
  - 5 em linha criam uma **estrela**, que limpa todas as peças de uma cor.
  - 5 em forma de L criam **O L**: limpa linha e coluna ao mesmo tempo e vale o dobro de pontos. Faça 3 L na mesma fase e ganhe uma estrela extra.
  - Trocar dois especiais entre si dispara um combo.
- **Obstáculos** (cada um tem o seu personagem; os blocos do Bolsonaro, da boiada do Salles, das fake news e do chefe Flávio falam quando são atingidos, enquanto a gelatina da Damares e a corrente do Pazuello não falam):
  - Gelatina da Damares: moldura rosa sobre a casa; faça matches nessa casa para limpar (as de duas camadas têm contorno branco e o selo "2").
  - Corrente do Pazuello: prende a peça no lugar (ela não pode ser trocada) até um match acontecer em cima dela ou ao lado.
  - Bloco do Bolsonaro: aguenta dois golpes de matches vizinhos.
  - Boiada do Salles: a cada jogada em que nenhuma boiada é derrubada, ela avança para uma casa vizinha.
  - Fake news: a cada duas jogadas, uma fake news cria uma cópia numa casa vizinha (no máximo uma cópia nova por jogada).
  - Chefe Flávio: bloco 2x2 com barra de vida nas fases de chefe; matches encostados nele tiram vida, e de tempos em tempos ele ataca o tabuleiro.
- **Quem fala:** só tocam gravações reais, todas do acervo do app Medo e Delírio em Brasília (o jogo não usa voz sintetizada), e o balão mostra quem falou de verdade. Cada combinação tem a sua "torcida", com pelo menos 3 falas: listrada, bomba, estrela, O L, combo de especiais, cascata de 3 ou mais quedas, vitória na fase e estado concluído. Quando uma listrada ou bomba explode, fala o aliado dono da peça (Lula ou Dilma; Alckmin, Marina e Boulos não têm clipe e cedem a vez à torcida). Os obstáculos respondem quando atingidos, e o Bolsonaro lamenta a derrota. Um match simples de 3 toca só um "plim" e mostra o nome da peça. O botão de alto-falante no topo do tabuleiro deixa o jogo mudo (os balões continuam aparecendo), e o controle **Volume** no menu inicial ajusta o volume das falas e do plim.
- Quando acabam as jogadas sem cumprir o objetivo, a fase pode ser repetida. Se o tabuleiro fica sem jogada possível, as peças são embaralhadas; se nem embaralhando surge jogada, a fase termina. Na vitória, até 5 jogadas que sobram viram bônus de pontos.
- **Estrelas:** vale a melhor nota entre os pontos e as jogadas que sobraram (metade ou mais das jogadas sobrando dá 3 estrelas, um quarto dá 2).
- **Acelerar:** toque em qualquer lugar da tela durante as animações para acelerá-las (4x) até o fim da jogada.
- **Sair da fase:** o botão "Mapa" no topo pede confirmação: o primeiro toque mostra "Sair?", e um segundo toque em até 3 s volta ao mapa.

## Editar conteúdo

- **Frases** (`dados/frases.js`): cada item tem `id`, `personagem`, `texto`, `gatilhos` (`match`, `listrada`, `bomba`, `estrela`, `L`, `combo`, `cascata`, `vitoria`, `estado`, `derrota`, `boiada`), `contexto`, `fonte`, `medoDelirio` e, opcionalmente, `quem` (o nome no balão). Toda frase com texto precisa de fonte (URL) e de clipe, e cada combinação precisa de pelo menos 3 falas; o teste `testes/dados.test.js` confere isso. Frases com `somenteAudio: true` só tocam se existir o `.mp3` correspondente. Para ligar uma frase a um clipe do Medo e Delírio, ponha o id do clipe no campo `medoDelirio` (a lista completa está em `https://api.medodelirioios.com/api/v3/all-sounds`) e rode `node ferramentas/puxar-audios.js`. Depois de editar, rode `node ferramentas/listar-audios.js` para atualizar `audios/LEIA-ME.txt`.
- **Fases manuais** (`dados/fases.js`): as 10 primeiras fases são escritas à mão (tamanho do tabuleiro, jogadas, peças, obstáculos, objetivos, limiares de estrelas e dica). As demais, até a 96, são geradas por `src/logica/geradorFases.js` com dificuldade crescente; uma fase manual com o mesmo número substitui a gerada.
- **Rota de estados** (`dados/estados.js`): a lista `ROTA` define a ordem dos estados, a região, quantas fases cada um tem (a soma precisa dar 96) e a obra temática opcional (cisternas, reflorestamento, metrô, universidade).
- Depois de qualquer edição, rode `node --test` na raiz do projeto.

## Nota jurídica

- A pasta `audios/` traz clipes recortados pelo app Medo e Delírio em Brasília a partir de falas públicas. A licença MIT do app cobre o código dele, não as falas; quem publica ou distribui o jogo responde pelo uso desses clipes.
- As frases exibidas têm fonte registrada em `dados/frases.js`.
- O uso de nomes, imagens, falas ou outros materiais de terceiros é responsabilidade de quem publica ou distribui o jogo.

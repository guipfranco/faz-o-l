# Faz o L

Match-3 para Chrome: abra `index.html` com duplo clique. Funciona offline.

- Frases dos personagens e suas fontes: `dados/frases.js`
- Áudios: coloque arquivos `.mp3` em `audios/` com os nomes listados em `audios/LEIA-ME.txt`
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
- **Obstáculos** (cada um tem o seu personagem, que fala quando é atingido):
  - Gelatina da Damares: fica embaixo das peças; faça matches em cima dela para limpar (algumas têm duas camadas).
  - Corrente do Pazuello: prende a peça no lugar (ela não pode ser trocada) até um match acontecer em cima dela ou ao lado.
  - Bloco do Bolsonaro: aguenta dois golpes de matches vizinhos.
  - Boiada do Salles: a cada jogada em que nenhuma boiada é derrubada, ela avança para uma casa vizinha.
  - Fake news: a cada duas jogadas, cada fake news cria uma cópia numa casa vizinha.
  - Chefe Flávio: bloco 2x2 com barra de vida nas fases de chefe; matches encostados nele tiram vida, e de tempos em tempos ele ataca o tabuleiro.
- **Quem fala:** os aliados (Lula, Alckmin, Marina, Boulos, Dilma) comentam os bons matches; o Lula comemora O L e a vitória; o Bolsonaro lamenta a derrota. O botão de alto-falante no topo do tabuleiro deixa o jogo mudo (os balões continuam aparecendo).
- Quando acabam as jogadas sem cumprir o objetivo, a fase pode ser repetida. Na vitória, até 5 jogadas que sobram viram bônus de pontos.

## Editar conteúdo

- **Frases** (`dados/frases.js`): cada item tem `id`, `personagem`, `texto`, `gatilhos` (`match`, `L`, `estrela`, `vitoria`, `derrota`, `boiada`...), `contexto` e `fonte`. Toda frase com texto precisa de uma fonte (URL); o teste `testes/dados.test.js` confere isso. Frases com `somenteAudio: true` só tocam se existir o `.mp3` correspondente. Depois de editar, rode `node ferramentas/listar-audios.js` para atualizar `audios/LEIA-ME.txt`.
- **Fases manuais** (`dados/fases.js`): as 10 primeiras fases são escritas à mão (tamanho do tabuleiro, jogadas, peças, obstáculos, objetivos, limiares de estrelas e dica). As demais, até a 96, são geradas por `src/logica/geradorFases.js` com dificuldade crescente; uma fase manual com o mesmo número substitui a gerada.
- **Rota de estados** (`dados/estados.js`): a lista `ROTA` define a ordem dos estados, a região, quantas fases cada um tem (a soma precisa dar 96) e a obra temática opcional (cisternas, reflorestamento, metrô, universidade).
- Depois de qualquer edição, rode `node --test` na raiz do projeto.

## Nota jurídica

- O jogo não embute áudios. A pasta `audios/` traz só a lista de nomes; quem adiciona os clipes responde pelo conteúdo deles.
- As frases exibidas têm fonte registrada em `dados/frases.js`.
- O uso de nomes, imagens, falas ou outros materiais de terceiros é responsabilidade de quem publica ou distribui o jogo.

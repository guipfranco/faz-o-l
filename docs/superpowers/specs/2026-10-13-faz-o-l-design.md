# Faz o L: Design

**Data:** 2026-10-13
**Status:** aguardando revisão do Guilherme
**Tipo:** jogo match-3 para navegador (Chrome), projeto pessoal, fora da campanha oficial

## 1. Objetivo

Um jogo match-3 no estilo Candy Crush, temático da campanha do Lula em 2026, que:

- roda direto no Chrome com duplo clique em `index.html`, offline, sem instalar nada;
- faz os personagens **falarem frases reais e icônicas** quando dão match;
- tem progressão de "reino que melhora": em vez de um reino, o jogador **reconstrói os 27 estados do Brasil**, que vão saindo do cinza e ganhando obras conforme as fases são vencidas;
- usa Bolsonaro, Flávio e figuras do governo anterior como **obstáculos** que, quando atingidos, falam no lugar dos aliados.

A curadoria das frases segue o espírito das "vírgulas sonoras" do podcast *Medo e Delírio em Brasília*: trechos reais, curtos, tirados do contexto original para efeito cômico ou de ênfase.

### Fora de escopo nesta versão

- Sistema de vidas e tempo de espera
- Loja, moedas ou compras
- Ranking online, contas de usuário, servidor
- Multiplayer

## 2. Decisões já tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Motor | **Phaser 3**, com `phaser.min.js` embutido na pasta | Efeitos visuais ricos (partículas, confete, tweens); roda offline |
| Mapa | **SVG real dos 27 estados**, em camada HTML sobre o canvas | SVG é nítido em qualquer zoom e trivial de colorir e clicar |
| Peças (aliados) | **Lula, Alckmin, Marina Silva, Boulos, Dilma** (5 tipos) | 5 tipos é o padrão do gênero; Haddad ficou de fora por não ter bordão próprio verificado |
| Obstáculos | Damares, Fake news, Pazuello, Bolsonaro, Salles, **Flávio (chefe)** | Pedido do Guilherme; introduzidos gradualmente |
| Nome | **Faz o L** | Trocadilho com o gesto da campanha; vira mecânica (peça especial L) |
| Dica | Pisca após **10 s** sem jogada | 5 s era pouco (feedback do Guilherme) |
| Salvamento | `localStorage` do navegador | Sem servidor |
| Frases | Só frases **com fonte verificada**; sem fonte, a peça só fala se o Guilherme fornecer o áudio | Evitar frases falsas atribuídas |

### Aviso jurídico registrado

Em 10/10/2026 o TSE mandou Lula e Janja removerem vídeos contra Flávio Bolsonaro, candidato adversário no 2º turno. O Guilherme sabe do risco e decidiu seguir com Flávio como obstáculo com áudio, por conta própria, fora da campanha. O jogo **não embute áudios do Flávio**: só toca o que o Guilherme colocar na pasta `audios/`.

## 3. Progressão: reconstruir o Brasil

### 3.1 Rota

A jornada começa em **Pernambuco** (Caetés, terra natal do Lula) e segue por região:

1. **Nordeste:** PE, PB, RN, CE, PI, MA, AL, SE, BA
2. **Norte:** PA, AP, AM, RR, AC, RO, TO
3. **Centro-Oeste:** GO, DF, MT, MS
4. **Sudeste:** MG, ES, RJ, SP
5. **Sul:** PR, SC, RS

No início, o mapa inteiro está **cinza e "abandonado"** (textura de rachadura, sem ícones).

### 3.2 Ciclo de um estado

1. O jogador joga as fases do estado atual (3 a 5 fases). Cada fase vale **1 a 3 ⭐** conforme a pontuação atingida (limiares definidos por fase).
2. As estrelas pagam **3 obras** no estado, **3 ⭐ cada**, na ordem fixa:
   - 🏫 escola
   - 🏥 posto de saúde
   - 🏠 casas populares
   - Alguns estados trocam uma obra por uma **temática**: cisterna (Sertão: PE, PB, RN, CE, PI, BA), reflorestamento (Amazônia: PA, AM, RR, AC, RO, AP), metrô (SP, RJ, MG), universidade (DF).
3. Cada obra concluída **muda o visual do estado no mapa**: a cor sai do cinza em 3 degraus (cinza, bege, verde claro, verde) e o ícone da obra aparece dentro do estado.
4. Com as 3 obras, o estado fica **verde e amarelo com brilho**, sobe confete, o **Lula fala uma frase** de celebração e o próximo estado é liberado.

Total: cerca de 100 fases. Para liberar o estado seguinte basta concluir as 3 obras (9 ⭐). Como as fases do estado dão até 15 ⭐, o jogador pode avançar sem 3 estrelas em tudo, mas fases de 1 ⭐ obrigam a repetir ou a jogar todas.

### 3.3 Fases

- **Fases 1 a 10** são desenhadas à mão em `dados/fases.js` (tutorial progressivo: match, listrada, L, objetivo de coleta, primeira gelatina).
- **Fases 11 em diante** são geradas a partir de **modelos** (`template`) em `fases.js`: cada modelo define forma do tabuleiro, tipo de objetivo, obstáculos permitidos e faixas de jogadas. A geração é **determinística** a partir do número da fase (seed = número da fase), para que a fase 37 seja sempre a mesma fase 37.
- **Curva de dificuldade:** o número de jogadas cai e a quantidade de obstáculos sobe conforme o índice da fase; a cada 5 fases há uma "fase de respiro" mais fácil.

### 3.4 Introdução dos obstáculos

| A partir da fase | Obstáculo | Comportamento |
|---|---|---|
| 5 | **Damares (gelatina)** | Camada embaixo da peça; some quando há match em cima. 1 ou 2 camadas |
| 12 | **Fake news** | Peça que, se não for atingida por match adjacente em 2 jogadas, **gera uma cópia** numa casa vizinha. Some ao ser atingida |
| 20 | **Pazuello (corrente)** | Prende uma peça no lugar; ela não troca nem cai. Um match adjacente solta a peça |
| 30 | **Bolsonaro (bloco)** | Bloco sólido que ocupa uma casa; **2 golpes** (matches adjacentes) para quebrar. Fala ao ser atingido |
| 45 | **Salles (boiada)** | Bloco que **se espalha** para uma casa vizinha a cada jogada em que **nenhuma boiada** foi destruída. 1 golpe para destruir. Fala "passar a boiada" ao se espalhar |
| Última fase de cada região (5 fases no total) | **Flávio (chefe)** | Bloco grande (2×2) no topo com barra de vida; perde vida com matches adjacentes e com peças especiais. A cada 3 jogadas, **lança uma gelatina ou uma fake news** numa casa aleatória. Fala apenas se houver áudio na pasta |

## 4. Jogabilidade

### 4.1 Tabuleiro

- Grade 8×8 por padrão; fases podem usar máscaras (casas bloqueadas) para formar outros desenhos (ex.: contorno do estado, formato de L).
- Troca por **arraste** (mouse ou toque) ou por clique em duas peças adjacentes.
- Após cada troca: detectar matches, remover, aplicar gravidade, preencher, repetir enquanto houver cascata.
- Cascatas acumulam **multiplicador** (×1, ×2, ×3...).
- Se não houver jogada possível, o tabuleiro **embaralha sozinho** (com aviso).
- Após **10 s** sem jogada, uma dica pisca (par válido).

### 4.2 Peças especiais

| Formação | Peça | Efeito |
|---|---|---|
| 4 em linha | **Listrada** (horizontal ou vertical conforme o movimento) | Limpa a linha ou a coluna inteira |
| **T** (5 peças) | **Bomba** | Limpa a área 3×3 ao redor |
| **L** (5 peças) | **O L** ✋ | Peça com a mão fazendo o L. Ao ativar, a mão aparece grande e **limpa a linha e a coluna inteiras** a partir do canto onde está. Toca "Faz o L". Cada peça limpa vale **pontos em dobro** |
| 5 em linha | **Estrela** ⭐ | Troca com um aliado qualquer e limpa **todas** as peças dele. Fala "Nunca antes na história deste país" |
| Listrada + Listrada | combo | Linha **e** coluna |
| Listrada + Bomba | combo | 3 linhas e 3 colunas |
| Bomba + Bomba | combo | Área 5×5 |
| **L + L** | combo | Duas linhas e duas colunas, confete vermelho |
| **L + Estrela** | combo máximo | Todas as peças de um aliado viram L's e explodem em sequência |
| Estrela + Estrela | combo máximo | Limpa o tabuleiro inteiro |

**Contador de L:** no HUD, cada L ativado na fase acende um dedo num ícone de mão. **3 L's na mesma fase dão 1 ⭐ bônus** (além das 3 da pontuação).

### 4.3 Objetivos de fase

Cada fase tem **um ou dois** objetivos e um número limitado de **jogadas**:

- Atingir X pontos
- Coletar N peças de um aliado ("junte 20 Marinas")
- Limpar todas as gelatinas, todas as boiadas ou todas as fake news
- Quebrar todos os blocos do Bolsonaro
- Derrotar o chefe (Flávio)

Vitória: objetivos cumpridos antes de as jogadas acabarem. As jogadas restantes viram peças especiais aleatórias que explodem (bônus de pontos, como no Candy Crush). Derrota: jogadas acabam com objetivo pendente; o jogador pode repetir a fase sem custo.

### 4.4 Pontuação

- Peça comum em match: 60 pontos × multiplicador de cascata.
- Peça limpa por especial: 120. Pelo L: 240 (dobro).
- Obstáculo destruído: 300. Golpe no chefe: 500.
- As estrelas da fase usam 3 limiares definidos na fase (ou pelo modelo).

## 5. Falas e áudio

### 5.1 Quando alguém fala

| Situação | Som |
|---|---|
| Match de 3 | Efeito curto ("plim") e balão com o nome |
| Match de 4 ou mais, criação ou ativação de especial, cascata de 3 ou mais | **Frase completa** do personagem (balão + áudio) |
| Match que atinge um obstáculo | **Fala do obstáculo** no lugar da do aliado |
| Boiada se espalha | Salles |
| Fim de fase | Frase do Lula (vitória) ou do Bolsonaro (derrota, em tom de deboche) |
| Estado concluído | Frase de celebração do Lula |

Regras do gerenciador de voz (`voz.js`):

- Fila com **intervalo mínimo de 4 s** entre falas; se chegar outra antes, a mais recente substitui a pendente (nunca acumula).
- As frases de cada personagem **rodam sem repetir** até esgotar o repertório; depois reinicia embaralhado.
- Botão de mudo e controle de volume no HUD; o estado persiste no `localStorage`.

### 5.2 Fonte do som (ordem de tentativa)

1. `audios/<id>.mp3` existe: toca o clipe real.
2. Não existe: **voz sintetizada do Chrome** (`speechSynthesis`, `pt-BR`) lê o texto.
3. Frase marcada como `somenteAudio: true` (ex.: Flávio): sem arquivo, só mostra o balão com o nome.

Um `audios/LEIA-ME.txt` lista os nomes de arquivo exatos esperados.

### 5.3 Repertório inicial (com fonte)

Tudo em `dados/frases.js`, cada entrada com `id`, `personagem`, `texto`, `fonte` (URL), `contexto` (ano ou evento). Repertório inicial:

**Lula**
- `lula-nunca-antes`: "Nunca antes na história deste país". Bordão dos mandatos de 2003 a 2010 ([UFES](https://periodicos.ufes.br/dimensoes/article/download/2598/2094/4018))
- `lula-sou-uma-ideia`: "Eu não sou mais um ser humano, eu sou uma ideia". São Bernardo, 07/04/2018 ([JB](https://www.jb.com.br/pais/noticias/2018/04/07/as-principais-frases-do-discurso-de-lula/))
- `lula-brasil-de-volta`: "O Brasil está de volta". COP27, 16/11/2022 ([EM](https://www.em.com.br/app/noticia/politica/2022/11/16/interna_politica,1421644/o-brasil-esta-de-volta-como-foi-primeiro-discurso-de-lula-na-cop27.shtml))
- `lula-picanha`: "Cervejinha e picanha". JN, agosto de 2022 ([SBT News](https://sbtnews.sbt.com.br/noticia/politica/nao-esqueci-da-cervejinha-e-da-picanha-diz-lula-ao-comentar-que-queda-de-popularidade-nao-preocupa))
- `lula-faz-o-l`: "Faz o L". Gesto e bordão da campanha de 2022 (usado na peça especial)

**Alckmin**
- `alckmin-gag`: "Gag de la gag". Abril de 2026 ([Portal Tela](https://www.portaltela.com/noticias/politica/2026/04/19/alckmin-faz-brincadeira-e-cita-expressao-gag-de-la-gag-em-goias/))
- `alckmin-dr-geraldo`: "Dr. Geraldo responde". Série de memes do perfil oficial, janeiro de 2024 ([O Antagonista](https://oantagonista.com.br/?p=1042782))

**Marina Silva**
- `marina-boiadas`: "Boiadas se passaram no lugar onde apenas deveriam se passar políticas de proteção ambiental". Posse, 2023 ([Money Times](https://www.moneytimes.com.br/em-posse-concorrida-marina-silva-fala-em-fim-da-barbarie-veja-discurso-na-integra-de-nova-ministra/))
- `marina-apatia`: "A maior ameaça ambiental no Brasil é a apatia". Paráfrase registrada em ((o))eco ([lista](https://www.oeco.org.br/wp-content/uploads/wp-post-to-pdf-enhanced-cache/1/21-frases-de-meio-ambiente-por-politicos.pdf)); **marcar para confirmação literal**

**Boulos**
- `boulos-vai-vencer`: "Não foi nessa eleição, mas a gente vai vencer". 2020 ([IHU](https://ihu.unisinos.br/categorias/576962-boulos-sobe-a-rampa))
- `boulos-nao-por-eleicao`: "Nós não estamos na política por causa de eleição". 2024 ([BandAB](https://www.bandab.com.br/politica/boulos-repete-lula-com-carta-para-tentar-reduzir-rejeicao-e-decide-dormir-na-casa-de-eleitores/amp/))

**Dilma** (tom de autoironia)
- `dilma-dobrar-meta`: "Dobrar a meta". Pronatec, julho de 2015 ([TNH1](https://www.tnh1.com.br/noticia/nid/em-ato-dos-cem-dias-damares-parodia-dilma-e-diz-que-vai-dobrar-meta/))
- `dilma-estocar-vento`: "Estocar vento" ([Jus](https://jus.com.br/artigos/43635/dilma-rousseff-e-o-vento-muito-alem-de-dilma))

**Bolsonaro** (obstáculo). Fonte: [Poder360, 30 frases](https://www.poder360.com.br/coronavirus/2-anos-de-covid-relembre-30-frases-de-bolsonaro-sobre-pandemia/)
- `bolso-coveiro`: "Eu não sou coveiro". 20/04/2020
- `bolso-e-dai`: "E daí? Lamento". Abril de 2020
- `bolso-gripezinha`: "Gripezinha". Março de 2020
- `bolso-esgoto`: "O cara pula em esgoto, sai, mergulha e não acontece nada". 26/03/2020
- `bolso-messias`: "Eu sou Messias, mas não faço milagre". Abril de 2020

**Salles**: `salles-boiada`: "Passar a boiada". Reunião ministerial de 22/04/2020 (fonte a anexar em `frases.js`)

**Damares, Pazuello, Fake news, Flávio**: entram sem texto verificado, `somenteAudio: true`. Falam só com arquivo na pasta.

Antes do lançamento, o Guilherme revisa `frases.js` e pode adicionar, trocar ou remover qualquer entrada sem tocar no código.

## 6. Arte e mapa

- **Caricaturas vetoriais** estilizadas (SVG) dos 5 aliados e dos obstáculos, sem fotos: Lula (barba branca, vermelho), Alckmin (óculos, azul), Marina (coque, verde), Boulos (barba escura, laranja), Dilma (cabelo ruivo curto, roxo). Cada aliado tem **cor própria** e **silhueta distinta**, para leitura rápida mesmo em tela pequena.
- Os arquivos ficam em `arte/` e podem ser **substituídos por PNG com o mesmo nome**.
- **Mapa:** SVG dos 27 estados gerado a partir de dados geográficos abertos (malhas do IBGE ou Natural Earth). A licença é conferida e registrada em `arte/LICENCAS.md` antes do uso.
- Visual geral: paleta vermelho, verde e amarelo da campanha, fundo escuro, tipografia pesada e arredondada.

## 7. Arquitetura

### 7.1 Pasta

```
faz-o-l/
├─ index.html              ← abre no Chrome
├─ lib/phaser.min.js       ← Phaser 3 embutido (offline)
├─ dados/
│  ├─ frases.js            ← frases + fonte (editável sem código)
│  ├─ estados.js           ← 27 estados: rota, obras, cores, ids SVG
│  └─ fases.js             ← fases 1-10 à mão + modelos da curva
├─ src/
│  ├─ logica/              ← regras puras, SEM Phaser
│  │  ├─ tabuleiro.js      ← grade, troca, gravidade, preenchimento
│  │  ├─ matches.js        ← detecção de 3/4/5, L e T
│  │  ├─ especiais.js      ← criação e ativação de especiais e combos
│  │  ├─ obstaculos.js     ← gelatina, fake news, corrente, bloco, boiada, chefe
│  │  ├─ pontuacao.js      ← pontos, multiplicador, estrelas
│  │  ├─ geradorFases.js   ← fases 11+ a partir dos modelos (seed = nº da fase)
│  │  └─ rng.js            ← gerador determinístico com seed
│  ├─ cenas/               ← cenas Phaser
│  │  ├─ CenaTabuleiro.js  ← renderiza a lógica, input, tweens, partículas
│  │  └─ CenaFimDeFase.js  ← vitória/derrota, estrelas, próximo passo
│  ├─ mapa.js              ← camada SVG dos estados, obras, transições
│  ├─ voz.js               ← fila de falas: mp3, depois speechSynthesis, depois balão
│  ├─ progresso.js         ← localStorage: estrelas, obras, fase atual, áudio
│  └─ main.js              ← liga tudo: menu, mapa, tabuleiro
├─ audios/                 ← clipes <id>.mp3 (+ LEIA-ME.txt)
├─ arte/                   ← SVG/PNG das peças, obstáculos, obras, mapa
├─ testes/                 ← testes node --test da pasta logica/
└─ docs/superpowers/specs/ ← este documento
```

### 7.2 Princípios

- **`logica/` é pura:** funções sobre um objeto de estado do tabuleiro, sem Phaser, sem DOM, sem áudio. A cena Phaser só **renderiza** o resultado e emite eventos (`match`, `especialAtivado`, `obstaculoAtingido`, `faseVencida`...).
- **Eventos alimentam voz e mapa:** `voz.js` e `mapa.js` escutam os eventos; nenhuma frase ou cor de estado é decidida dentro da cena.
- **Dados fora do código:** quem edita frases, estados ou fases só mexe em `dados/`.
- **Carregamento:** módulos ES (`<script type="module">`) não funcionam com `file://` no Chrome. Por isso os scripts são carregados como `<script>` clássicos em ordem, cada um expondo um namespace global (`FazOL.logica`, `FazOL.dados`...). Para os testes em Node, cada arquivo de `logica/` também faz `if (typeof module !== 'undefined') module.exports = ...`.

### 7.3 Dados principais

```js
// estado do tabuleiro (logica)
{
  linhas: 8, colunas: 8,
  mascara: [[true, ...]],          // casa jogável?
  celulas: [[{ peca: 'lula' | ... | null,
               especial: null | 'listradaH' | 'listradaV' | 'bomba' | 'L' | 'estrela',
               gelatina: 0 | 1 | 2, corrente: false,
               bloco: null | { tipo: 'bolsonaro' | 'boiada' | 'fakenews' | 'chefe', vida: n } }]],
  jogadasRestantes: n,
  objetivos: [{ tipo: 'pontos' | 'coletar' | 'limparGelatina' | 'limparBoiada' | 'limparFakeNews' | 'quebrarBlocos' | 'chefe', alvo, atual }],
  pontos: 0, multiplicador: 1, contadorL: 0,
  rng: estadoDoRng
}

// progresso (localStorage, chave 'fazol.progresso.v1')
{ estadoAtual: 'PE', fases: { 1: { estrelas: 3, pontos: 12400 }, ... },
  obras: { PE: 3, PB: 1, ... }, estrelasGastas: 9, audio: { mudo: false, volume: 0.8 } }
```

### 7.4 Tratamento de erros

- Áudio ausente: cai para `speechSynthesis`; se o Chrome não tiver voz pt-BR, cai para só balão. Nunca trava.
- `localStorage` indisponível (modo anônimo com bloqueio): progresso em memória e aviso discreto "progresso não será salvo".
- Fase gerada sem jogada possível: embaralha até haver.
- `frases.js` com erro de sintaxe: o jogo abre, mas o console avisa e nenhuma peça fala.

## 8. Testes

- **`logica/` com `node --test`** (sem instalar nada): detecção de 3/4/5, L e T; gravidade e preenchimento com máscara; criação e ativação de cada especial e combo; cada obstáculo (gelatina some, fake news multiplica, corrente prende, bloco leva 2 golpes, boiada espalha, chefe perde vida e lança obstáculo); pontuação, multiplicador e estrelas; geração determinística (mesma seed gera a mesma fase; fase gerada sempre tem jogada possível).
- **`voz.js`** testado com stubs de `Audio` e `speechSynthesis`: ordem de fallback, intervalo de 4 s, rotação sem repetição.
- **Visual e áudio no Chrome real:** eu abro o `index.html`, jogo as fases 1 a 10, verifico as falas, o mapa mudando de cor e a persistência ao recarregar.

## 9. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Frase falsa atribuída a alguém | Só entra frase com fonte; `frases.js` registra a URL; Guilherme revisa |
| Risco jurídico (TSE) com o Flávio | Jogo não embute áudio dele; decisão e material ficam com o Guilherme |
| `file://` bloqueia módulos ES | Scripts clássicos com namespace global |
| Mapa SVG pesado | Simplificar geometria (tolerância de cerca de 0,01°); meta abaixo de 200 KB |
| Caricaturas parecidas em tela pequena | Cor e silhueta distintas por personagem; teste a 40 px |
| Repertório pequeno fica repetitivo | Rotação sem repetição; falas completas só em 4+, especial ou cascata |

## 10. Desvios aceitos

Decisões tomadas durante a implementação que diferem do texto acima:

- As fases geradas são guiadas por constantes em `src/logica/geradorFases.js` (desbloqueio, máximos por obstáculo, curva de dificuldade), e não por modelos em `dados/fases.js`; esse arquivo guarda só as fases manuais.
- O mapa cinza não tem textura de rachaduras, e os estados concluídos não têm brilho.
- A gelatina (Damares) e a corrente (Pazuello) não falam; só os blocos falam quando atingidos.
- O bônus final de vitória vale 10% dos pontos que as jogadas restantes gerariam.
- Estrelas: vale a melhor nota entre os pontos (limiares) e as jogadas que sobraram antes do bônus (metade ou mais dá 3, um quarto dá 2), com +1 por 3 L e teto de 4.
- Fase sem jogada possível: embaralha; se o embaralhamento falha, a fase termina em derrota.

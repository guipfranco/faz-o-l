# Licenças de terceiros

## Mapa dos estados (`dados/mapaBr.js`)

- Derivado de `public/data/brazil-states.geojson` do repositório
  [codeforgermany/click_that_hood](https://github.com/codeforgermany/click_that_hood), licença MIT
  (Copyright (c) 2013-2021 Code for America).
- As geometrias trazem o código IBGE de cada UF (`codigo_ibg`); a origem primária são as malhas
  territoriais do IBGE, dado público.
- Processamento: simplificação Douglas-Peucker (0,04°) e projeção equirretangular com fator
  cos(15°), em `ferramentas/construir-mapa.js`.

## Phaser (`lib/phaser.min.js`)

- Phaser 3.80.1, licença MIT, Photon Storm Ltd. https://phaser.io

## Arte das peças (`arte/`)

- Caricaturas vetoriais geradas por `arte/gerar.js`, criadas para este projeto.

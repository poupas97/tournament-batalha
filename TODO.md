# TODO

- quando o jogo estiver em fase de penalties, so se pode criar match events do tipo penalties e cartoes
  - no BE a rota tem de verificar isso
  - no FE tem de ser filtrado

- refazer o estado de jogo terminado
  - refazer penalties para PENALTIES_START e adicionar PENALTIES_END
  - refazer as funcoes que verificar se o jogo acabou ou usando PENALTIES_END
  - esconder/impossibilitar buttao "Finalizar competicao", deve ser uma acao automatica do BE

- no component RankingScoresTable
  - adicionar o click para ir para a pagina do jogador
  - a pagina do jogador (VIEW) tem de ser criada no frontoffice e backoffice

- sobre o jogador
  - pode ter uma foto, é opcional nos formularios
    - é enviada para o BE e depois o BE é que trata do storage

- refazer/analisar o file @libs/shuffle

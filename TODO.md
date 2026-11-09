# TODO

1. nao marcar jogos todos seguidos
   - como há varias competicoes, ou podem haver várias competicoes a decorrer nos mesmo intervalos de tempo, os jogos evitam de ser marcados todos seguidos, tentar com que haja um certo balanceamento entre jogos entre as várias competicoes

2. **Completar o registo de auditoria.**
   Atualmente há auditoria em algumas alterações de jogos, mas não nas alterações de equipas, jogadores, competições, utilizadores e eventos; registar as operações para que o histórico administrativo seja completo.

3. **Melhorar o calendário e a página inicial.**
   - Permitir filtrar jogos por competição e estado, e tornar claro o resultado e o estado de cada jogo no calendário.
   - Na página inicial, mostrar estados de carregamento, erro e semana sem jogos; atualmente o calendário é apresentado sem receber esses estados.
   - No backoffice, facilitar a consulta de jogos por data e competição quando há várias competições em paralelo.

4. **Guiar melhor o fluxo de gestão da competição.**
   - Simplificar a orientação do fluxo: indicar os passos, requisitos em falta e ação seguinte para cada estado. A mensagem contextual de progresso fica adiada por agora.
   - Antes do sorteio, apresentar um resumo de confirmação com equipas, formato e consequências, dado que o sorteio só pode ser feito uma vez.
   - Tornar as ações disponíveis em cada estado mais evidentes e explicar junto da ação quando está bloqueada.

5. **Reforçar acessibilidade e uso em ecrãs pequenos no frontoffice.**
   - Garantir foco visível e operação por teclado em elementos clicáveis, como linhas de tabela e cartões de jogadores/staff usados para registar eventos.

6. **Revisão do frontoffice: estados, navegação e robustez.**
   - Separar corretamente os estados de carregamento, erro, lista vazia e pesquisa sem resultados; não apresentar “Sem dados” enquanto o pedido ainda está pendente.
   - Disponibilizar uma ação “Tentar novamente” em todos os erros de pedidos à API.
   - Cancelar pedidos pendentes e evitar apresentar dados do registo anterior quando se navega entre páginas de detalhe.
   - Rever mensagens de erro da API para que sejam claras para utilizadores finais.

7. **Melhorar a página inicial pública.**
   - Criar uma entrada mais informativa para o torneio: nome/identidade, breve descrição e calendário.
   - Destacar jogos de hoje, próximos jogos e resultados recentes.
   - Considerar indicadores rápidos, como competições ativas, equipas, jogos realizados e melhor marcador.
   - Mostrar um estado explícito quando a semana selecionada não tem jogos.

8. **Reforçar identidade visual e navegação do frontoffice.**
   - Criar um cabeçalho com símbolo ou logótipo, nome do torneio e navegação consistente.
   - Criar uma versão compacta da navegação para telemóvel.
   - Melhorar o rodapé com ano atual, identificação da organização e, caso se aplique, contactos ou redes sociais.
   - Definir uma linguagem visual própria do torneio (cores, superfícies, tipografia e destaques), reduzindo o aspeto genérico dos componentes base.
   - Usar links de contexto nas páginas de detalhe quando possível; o botão “Voltar” baseado apenas no histórico pode ser pouco útil ao entrar diretamente por um link.

9. **Evoluir as listagens de competições, equipas e jogos.**
   - Adicionar filtros úteis por competição, estado, data e ronda.
   - Permitir ordenação das colunas mais relevantes.
   - Melhorar a hierarquia visual da vista em cartões e garantir uma experiência confortável em tabelas largas no telemóvel.
   - Manter pesquisa, filtros e tipo de visualização na URL para que uma lista possa ser partilhada ou retomada.
   - Usar IDs estáveis como `key` em listas, evitando índices quando os dados já têm identificador.

10. **Completar a acessibilidade do frontoffice.**
    - Garantir que linhas clicáveis nas tabelas podem ser abertas por teclado e têm foco visível.
    - Usar cabeçalhos semânticos nas tabelas e texto alternativo consistente nas fotos e logótipos.
    - Rever o contraste das cores das competições e não comunicar estados apenas através da cor.
    - Garantir áreas de toque adequadas em telemóvel.

11. **Melhorar páginas de detalhe e acompanhamento de jogos.**
    - Em ecrãs pequenos, apresentar campos de detalhe numa coluna para evitar blocos apertados.
    - Melhorar a apresentação do resultado e dos eventos de um jogo com uma cronologia visual clara.
    - Adicionar ligações de contexto entre jogador, equipa, competição e jogo.
    - No calendário, distinguir claramente jogos futuros, em curso e terminados; acrescentar filtros por competição e estado.
    - Avaliar uma vista mensal do calendário se o volume de jogos aumentar.

12. **Rever detalhes técnicos e possíveis inconsistências.**
    - Confirmar a foto apresentada para a equipa na tabela de marcadores; a implementação deve usar a foto da equipa, não a do jogador.
    - Rever nomes longos de equipas e jogadores para que não sejam cortados de forma prejudicial em tabelas, cartões e calendário.
    - Evitar conteúdo complexo dentro de componentes tipográficos que renderizam parágrafos; usar contentores semânticos adequados.
    - Centralizar componentes e padrões de feedback para loading, erro, vazio e repetição de pedido.

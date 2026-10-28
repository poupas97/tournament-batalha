"use client";

import Title from "@/components/Title";
import {
  MATCH_EVENT_MAX_MINUTE,
  MATCH_EVENT_MIN_MINUTE,
  MAX_NAME_LENGTH,
  PLAYER_NUMBER_MAX,
  PLAYER_NUMBER_MIN,
  TEAM_POT_MAX,
  TEAM_POT_MIN,
} from "@/constants/validation";
import type { ReactNode } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import NextLink from "next/link";

const sections = [
  { id: "faq", label: "Perguntas frequentes" },
  { id: "workflow", label: "Fluxo recomendado" },
  { id: "competitions", label: "Competições" },
  { id: "teams", label: "Equipas e plantéis" },
  { id: "draw-and-schedule", label: "Sorteio e calendário" },
  { id: "matches", label: "Jogos e resultados" },
];

export default function BackofficeHelpPage() {
  return (
    <>
      <Title
        label="Ajuda do Backoffice"
        description="Passos, regras e respostas para gerir uma competição do início ao fim."
      />

      <Stack spacing={3}>
        <Box
          aria-label="Índice do guia"
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {sections.map((section) => (
            <Button
              key={section.id}
              component={NextLink}
              href={`#${section.id}`}
              variant="outlined"
            >
              {section.label}
            </Button>
          ))}
        </Box>

        <GuideSection id="faq" title="Perguntas frequentes">
          <Box>
            <Typography variant="h6">
              Porque não consigo editar uma equipa ou um jogador?
            </Typography>
            <Typography color="text.secondary">
              A competição já não está em DRAFT. Os plantéis podem ser editados
              durante a preparação; antes do sorteio, confirme os nomes, os
              números e as fotografias.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6">O sorteio foi recusado.</Typography>
            <Typography color="text.secondary">
              Confirme que há equipas suficientes, que Qualificados tem um valor
              suportado que não ultrapassa o total de equipas e que Oponentes é
              válido para o formato escolhido. O sorteio não pode ser repetido
              depois de os jogos serem criados.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6">
              A competição não aparece no site público.
            </Typography>
            <Typography color="text.secondary">
              Confirme o campo Ativo da competição. Esse campo controla a
              publicação nas páginas públicas, independentemente de estar em
              DRAFT, DRAWN ou IN_PROGRESS.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6">
              Porque não consigo avançar o estado de um jogo?
            </Typography>
            <Typography color="text.secondary">
              Verifique se a competição foi iniciada, se ambas as equipas estão
              definidas e se está a escolher uma transição permitida. Para
              concluir os penáltis, o registo tem de indicar um vencedor.
            </Typography>
          </Box>
        </GuideSection>

        <GuideSection id="workflow" title="Fluxo recomendado">
          <GuideList
            items={[
              "Crie a competição e escolha o formato, a data de início, o número de qualificados e os oponentes ou o tamanho dos grupos.",
              "Adicione todas as equipas, jogadores e membros do staff enquanto a competição está em rascunho.",
              "Ao criar cada equipa, atribua-lhe um pote: 1 corresponde às equipas mais fortes. Use o mesmo número para equipas de nível semelhante.",
              "Reveja os dados e faça o sorteio. O sistema gera as jornadas, os grupos quando aplicável e os jogos da fase eliminatória.",
              "Consulte o sorteio e o calendário. Se necessário, ajuste os jogos ainda agendados antes de iniciar a competição.",
              "Inicie a competição e atualize o estado de cada jogo à medida que decorre.",
              "A classificação, a passagem entre fases e a conclusão da competição são calculadas automaticamente com base nos jogos concluídos.",
            ]}
          />
          <Typography color="text.secondary">
            Os estados seguem esta ordem: <strong>DRAFT</strong> (preparação),{" "}
            <strong>DRAWN</strong> (sorteio feito), <strong>IN_PROGRESS</strong>{" "}
            (a decorrer) e <strong>FINISHED</strong> (concluída). A competição
            só pode ser iniciada depois do sorteio e passa automaticamente a
            FINISHED quando termina a última eliminatória.
          </Typography>
        </GuideSection>

        <GuideSection id="competitions" title="Competições">
          <Typography>
            Em Competições, crie uma competição e preencha os campos antes de
            adicionar equipas.
          </Typography>
          <GuideList
            items={[
              `O nome e a data de início identificam a competição. A data serve de referência para o calendário gerado. O nome pode ter até ${MAX_NAME_LENGTH} caracteres.`,
              "Cada competição tem de ter uma cor única. Ativo controla se aparece nas páginas públicas; não altera o estado da competição.",
              "LEAGUE: cada equipa defronta o número de adversários diferentes indicado em Oponentes. O valor tem de ser pelo menos 1 e inferior ao total de equipas; com um número ímpar de equipas, Oponentes tem de ser par.",
              "GROUP: Oponentes indica o tamanho máximo de cada grupo e tem de ser pelo menos 2. O sorteio distribui as equipas por grupos equilibrados e não cria grupos com apenas uma equipa.",
              "Qualificados indica quantas equipas passam à fase eliminatória. O valor tem de ser 2, 4, 8, 16 ou 32 e não pode ultrapassar o número de equipas.",
              "Depois do sorteio, a competição, a sua configuração, a ativação nas páginas públicas e os plantéis deixam de poder ser editados. Confirme tudo antes de fazer o sorteio; só é permitido um sorteio por competição.",
            ]}
          />
          <Typography>
            A classificação atribui 3 pontos por vitória e 1 por empate. Os
            desempates são resolvidos por pontos, diferença de golos, golos
            marcados e, por fim, nome da equipa. Em grupos, a ordenação para
            apurar os qualificados considera primeiro a posição no grupo e
            depois esses critérios.
          </Typography>
        </GuideSection>

        <GuideSection id="teams" title="Equipas e plantéis">
          <Typography>
            Crie cada equipa dentro da competição correspondente. Pode adicionar
            jogadores, números de camisola, membros do staff e fotografias no
            mesmo formulário.
          </Typography>
          <GuideList
            items={[
              `O nome da equipa, dos jogadores e dos membros do staff pode ter até ${MAX_NAME_LENGTH} caracteres.`,
              `O número de camisola tem de estar entre ${PLAYER_NUMBER_MIN} e ${PLAYER_NUMBER_MAX}. Ao editar o plantel no formulário da equipa, não pode repetir números dentro da mesma equipa.`,
              "Os jogadores e os membros do staff pertencem à equipa e seguem as regras de edição da competição: só podem ser alterados enquanto esta estiver em DRAFT.",
              "As fotografias são opcionais. Para as guardar, o servidor tem de estar configurado com armazenamento de objetos; consulte o README ou o administrador técnico se o envio falhar.",
              `O pote é um número inteiro entre ${TEAM_POT_MIN} e ${TEAM_POT_MAX}. Atribua um número baixo às equipas mais fortes e potes seguintes às restantes; equipas do mesmo pote são distribuídas por grupos diferentes de forma equilibrada. Na LEAGUE, os potes ajudam a espaçar os emparelhamentos gerados, mas não alteram quem cada equipa defronta: se todas as equipas forem oponentes, todas jogarão entre si.`,
              "Se uma equipa não aparecer no sorteio, confirme que foi associada à competição certa antes de gerar os jogos.",
            ]}
          />
        </GuideSection>

        <GuideSection id="draw-and-schedule" title="Sorteio e calendário">
          <Typography>
            Abra a competição e escolha <strong>Fazer sorteio</strong>. O
            sorteio só está disponível em DRAFT e só pode ser feito antes de
            existirem jogos nessa competição.
          </Typography>
          <GuideList
            items={[
              "Verifique Qualificados e Oponentes no diálogo do sorteio. Estes valores determinam a fase regular e a fase eliminatória; tem de haver pelo menos duas equipas.",
              "Na LEAGUE, Oponentes tem de ser inferior ao número de equipas. Com um número ímpar de equipas, tem de ser par para que todas joguem o mesmo número de partidas.",
              "Em GROUP, Oponentes é o tamanho máximo do grupo; o sorteio cria grupos equilibrados com pelo menos duas equipas em cada um.",
              "O calendário automático começa às 18:00, agenda até três jogos por dia às 18:00, 19:00 e 20:00, e evita os domingos.",
              "Os jogos da fase eliminatória começam depois da fase regular, com um dia de descanso entre rondas.",
              "A distribuição automática é feita por competição. Reveja as datas e edite os jogos agendados se precisar de ajustar o calendário.",
              "No formato GROUP, os grupos e jogos são sorteados; no formato LEAGUE, as jornadas são geradas para o número de oponentes escolhido.",
            ]}
          />
        </GuideSection>

        <GuideSection id="matches" title="Jogos e resultados">
          <Typography>
            Na área de <NextLink href="/backoffice/matches">Jogos</NextLink>,
            abra um jogo para gerir o estado e registar eventos. Os botões de
            estado dependem do estado atual; siga a sequência disponível em vez
            de saltar etapas.
          </Typography>
          <GuideList
            items={[
              "Para criar um jogo manualmente, use + Criar em Jogos e indique a competição, a data, a ronda e duas equipas diferentes dessa competição.",
              "As duas equipas de um jogo têm de pertencer à competição selecionada e ser diferentes.",
              "Um jogo agendado pode ser editado antes de começar enquanto a competição estiver em DRAFT ou DRAWN. Depois de começar, os dados do jogo deixam de poder ser editados.",
              "Num jogo adiado, a edição serve para alterar a data; ao guardar, o jogo volta a SCHEDULED. Um jogo cancelado não pode ser reaberto no Backoffice.",
              "Só é possível iniciar jogos quando a competição está em IN_PROGRESS e ambas as equipas estão definidas.",
              "Siga as transições de estado disponíveis: início, intervalo, recomeço e fim do tempo regulamentar. Um jogo da fase regular termina aí; nas eliminatórias pode seguir-se prolongamento e, se necessário, penáltis.",
              "Um jogo interrompido pode ser retomado a partir dos estados disponíveis ou cancelado. Jogos adiados, interrompidos ou cancelados não contam como concluídos; enquanto houver um destes jogos na fase regular, a eliminatória não avança.",
              "Registe golos, autogolos, golos de penálti e cartões na equipa e no jogador corretos. O resultado é calculado a partir destes eventos, não é introduzido manualmente.",
              "O autor do evento tem de pertencer à equipa selecionada. Pode escolher um jogador para qualquer evento; um membro do staff só pode receber cartões.",
              `O minuto do evento tem de estar entre ${MATCH_EVENT_MIN_MINUTE} e ${MATCH_EVENT_MAX_MINUTE}. Só é possível adicionar ou remover eventos nos estados RT_START, RT_HALF_TIME, RT_RESTART, ET_START, ET_HALF_TIME, ET_RESTART e PENALTIES_START. Depois de o jogo terminar, ficam bloqueados.`,
              "Durante a série de penáltis, só se podem registar golos de penálti e cartões. Para terminar a série, uma equipa tem de ter mais golos de penálti do que a outra.",
              "Quando todos os jogos da fase regular estiverem concluídos, a classificação determina os qualificados e o sistema preenche os jogos da primeira eliminatória. Depois de cada ronda eliminatória concluída, os vencedores avançam automaticamente.",
              "Na fase regular, os jogos empatados podem terminar empatados. Cada jogo eliminatório tem de terminar com um vencedor para permitir a passagem à ronda seguinte.",
            ]}
          />
        </GuideSection>
      </Stack>
    </>
  );
}

function GuideSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Paper
      component="section"
      id={id}
      variant="outlined"
      sx={{ p: 3, scrollMarginTop: 100 }}
    >
      <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Paper>
  );
}

function GuideList({ items }: { items: string[] }) {
  return (
    <List component="ul" dense disablePadding>
      {items.map((item) => (
        <ListItem
          key={item}
          component="li"
          sx={{
            display: "list-item",
            listStyleType: "disc",
            ml: 2,
            py: 0.25,
            pl: 0,
          }}
        >
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}

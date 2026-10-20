import DataTable from "@/components/DataTable";
import { CompetitionStatsBEResponse } from "@/types/competition";
import { Paper, Typography } from "@mui/material";
import TeamIdentity from "@/components/TeamIdentity";
import PlayerIdentity from "@/components/PlayerIdentity";
import { Player, Team } from "@/generated/prisma";

interface RankingScoresTableProps {
  rankingScores: CompetitionStatsBEResponse["rankingScores"];
}

export default function RankingScoresTable({
  rankingScores,
}: RankingScoresTableProps) {
  return (
    <>
      <Typography variant="h5">Marcadores</Typography>
      <Paper>
        <DataTable
          data={rankingScores || []}
          columns={[
            { key: "position", header: "º" },
            {
              key: "playerName",
              header: "Jogador",
              render: (it) => (
                <PlayerIdentity player={it as unknown as Player} />
              ),
            },
            {
              key: "teamName",
              header: "Equipa",
              render: (it) => (
                <TeamIdentity team={it as unknown as Team} />
              ),
            },
            { key: "goals", header: "Golos" },
            { key: "matches", header: "Jogos" },
          ]}
        />
      </Paper>
    </>
  );
}

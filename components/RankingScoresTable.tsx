import DataTable from "@/components/DataTable";
import { CompetitionStatsBEResponse } from "@/types/competition";
import { Paper, Typography } from "@mui/material";
import TeamIdentity from "@/components/TeamIdentity";
import PlayerIdentity from "@/components/PlayerIdentity";
import { Team } from "@/generated/prisma";

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
          href={(it) => `/players/${it.playerId}`}
          columns={[
            { key: "position", header: "º" },
            {
              key: "playerName",
              header: "Jogador",
              render: (it) => (
                <PlayerIdentity
                  //TODO: add numer on query
                  player={{ id: it.playerId, name: it.playerName, number: 0 }}
                />
              ),
            },
            {
              key: "teamName",
              header: "Equipa",
              render: (it) => (
                <TeamIdentity
                  //TODO: add id on query
                  team={
                    {
                      id: 0,
                      name: it.teamName,
                      photo: it.playerPhoto,
                    } as unknown as Team
                  }
                />
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

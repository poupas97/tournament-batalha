"use client";

import DataTable from "@/components/DataTable";
import { CompetitionStatsBEResponse } from "@/types/competition";
import { Typography } from "@mui/material";

interface RankingScoresTableProps {
  rankingScores: CompetitionStatsBEResponse["rankingScores"];
}

export default function RankingScoresTable({
  rankingScores,
}: RankingScoresTableProps) {
  return (
    <>
      <Typography variant="h5">Marcadores</Typography>
      <DataTable
        data={rankingScores || []}
        columns={[
          { key: "position", header: "º" },
          { key: "playerName", header: "Nome" },
          { key: "teamName", header: "Equipa" },
          { key: "goals", header: "Golos" },
          { key: "matches", header: "Jogos" },
        ]}
      />
    </>
  );
}

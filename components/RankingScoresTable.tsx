import DataTable from "@/components/DataTable";
import { CompetitionStatsBEResponse } from "@/types/competition";
import { Paper, Typography } from "@mui/material";

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
            { key: "playerPhoto", header: "Foto", format: "photo" },
            { key: "playerName", header: "Nome" },
            { key: "teamName", header: "Equipa" },
            { key: "goals", header: "Golos" },
            { key: "matches", header: "Jogos" },
          ]}
        />
      </Paper>
    </>
  );
}

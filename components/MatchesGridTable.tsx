import GridTable from "@/components/GridTable";
import { MatchBEResponse } from "@/types/match";

interface MatchesGridTableProps {
  data: MatchBEResponse[] | undefined;
  loading: boolean;
  error: string | undefined;
  emptyMessage?: string;
  title?: string;
}

export default function MatchesGridTable({
  data,
  loading,
  error,
  emptyMessage,
  title,
}: MatchesGridTableProps) {
  return (
    <GridTable
      loading={loading}
      error={error}
      data={data}
      href={(it) => `/matches/${it.id}`}
      title={title}
      emptyMessage={emptyMessage}
      columns={[
        { key: "competition.name", header: "Competição" },
        { key: "round", header: "Ronda" },
        { key: "homeTeam.name", header: "Equipa da Casa" },
        { key: "awayTeam.name", header: "Equipa Visitante" },
        { key: "date", header: "Data", format: "datetime" },
      ]}
    />
  );
}

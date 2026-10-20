import GridTable from "@/components/GridTable";
import { MatchBEResponse } from "@/types/match";
import TeamIdentity from "@/components/TeamIdentity";

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
        {
          key: "homeTeam.name",
          header: "Equipa da Casa",
          render: (match) => <TeamIdentity team={match.homeTeam} />,
        },
        {
          key: "awayTeam.name",
          header: "Equipa Visitante",
          render: (match) => <TeamIdentity team={match.awayTeam} />,
        },
        { key: "date", header: "Data", format: "datetime" },
      ]}
    />
  );
}

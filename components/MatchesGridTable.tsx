import GridTable from "@/components/GridTable";
import { MatchBEResponse } from "@/types/match";
import { useRouter } from "next/navigation";

interface MatchesGridTableProps {
  data: MatchBEResponse[] | undefined;
  loading: boolean;
  error: string | undefined;
  emptyMessage?: string;
}

export default function MatchesGridTable({
  data,
  loading,
  error,
  emptyMessage,
}: MatchesGridTableProps) {
  const router = useRouter();

  return (
    <GridTable
      loading={loading}
      error={error}
      data={data}
      clickableRow={(it) => router.push(`/matches/${it.id}`)}
      emptyMessage={emptyMessage}
      columns={[
        { key: "competition.name", header: "Competição" },
        { key: "round", header: "Ronda" },
        { key: "homeTeam.name", header: "Equipa da Casa" },
        { key: "awayTeam.name", header: "Equipa Visitante" },
        { key: "date", header: "Data", format: "date" },
      ]}
    />
  );
}

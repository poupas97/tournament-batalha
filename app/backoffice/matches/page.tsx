"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { useRouter } from "next/navigation";

type MatchSummary = {
  id: number;
  name: string;
  createdAt: string;
  _count: {
    teams: number;
  };
};

export default function BackofficeMatchesPage() {
  const router = useRouter();

  const { data, loading, error } = useGetState<MatchSummary[]>(
    "/api/backoffice/matches",
  );

  return (
    <>
      <Title label="Jogos" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        create="/backoffice/matches/create"
        clickableRow={(it) => router.push(`/backoffice/matches/${it.id}`)}
        columns={[
          { key: "competition.name", header: "Competição" },
          { key: "date", header: "Data", format: "date" },
          { key: "round", header: "Ronda" },
          { key: "homeTeam.name", header: "Equipa da Casa" },
          { key: "awayTeam.name", header: "Equipa Visitante" },
        ]}
      />
    </>
  );
}

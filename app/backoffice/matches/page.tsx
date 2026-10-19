"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";

type MatchSummary = {
  id: number;
  name: string;
  createdAt: string;
  _count: {
    teams: number;
  };
};

export default function BackofficeMatchesPage() {
  const { data, loading, error } = useGetState<MatchSummary[]>(
    "/api/backoffice/matches",
  );

  return (
    <>
      <Title
        label="Jogos"
        description="Consulte e gira o calendário e o estado dos jogos"
      />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        create="/backoffice/matches/create"
        href={(it) => `/backoffice/matches/${it.id}`}
        columns={[
          { key: "competition.name", header: "Competição" },
          { key: "date", header: "Data", format: "datetime" },
          { key: "round", header: "Ronda" },
          { key: "homeTeam.name", header: "Equipa da Casa" },
          { key: "awayTeam.name", header: "Equipa Visitante" },
          { key: "status", header: "Estado" },
        ]}
      />
    </>
  );
}

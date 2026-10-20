"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";
import TeamIdentity from "@/components/TeamIdentity";

export default function BackofficeMatchesPage() {
  const { data, loading, error } = useGetState<MatchBEResponse[]>(
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
          {
            key: "homeTeam.name",
            header: "Equipa da Casa",
            render: (match) => (
              <TeamIdentity
                team={match.homeTeam}
                placeholder="A definir"
               
              />
            ),
          },
          {
            key: "awayTeam.name",
            header: "Equipa Visitante",
            render: (match) => (
              <TeamIdentity
                team={match.awayTeam}
                placeholder="A definir"
               
              />
            ),
          },
          { key: "status", header: "Estado" },
        ]}
      />
    </>
  );
}

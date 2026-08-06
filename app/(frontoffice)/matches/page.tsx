"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";
import { useRouter } from "next/navigation";

export default function MatchesPage() {
  const router = useRouter();

  const { data, loading, error } =
    useGetState<MatchBEResponse[]>("/api/matches");

  return (
    <>
      <Title label="Jogos" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        clickableRow={(it) => router.push(`/matches/${it.id}`)}
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

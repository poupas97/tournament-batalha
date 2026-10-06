"use client";

import MatchesGridTable from "@/components/MatchesGridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";

export default function Home() {
  const { data, loading, error } = useGetState<MatchBEResponse[]>(
    "/api/matches?today=true",
  );

  return (
    <>
      <Title label="Bem-vindo" />

      <MatchesGridTable
        loading={loading}
        error={error}
        data={data}
        emptyMessage="Nenhum jogo encontrado para o dia de hoje."
      />
    </>
  );
}

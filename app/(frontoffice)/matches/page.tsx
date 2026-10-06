"use client";

import MatchesGridTable from "@/components/MatchesGridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";

export default function MatchesPage() {
  const { data, loading, error } =
    useGetState<MatchBEResponse[]>("/api/matches");

  return (
    <>
      <Title label="Jogos" />

      <MatchesGridTable loading={loading} error={error} data={data} />
    </>
  );
}

"use client";

import MatchCalendar from "@/components/MatchCalendar";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";

export default function BackofficePage() {
  const { data, loading, error } = useGetState<MatchBEResponse[]>(
    "/api/backoffice/matches",
  );

  return (
    <>
      <Title
        label="Backoffice"
        description="Aceda às áreas de gestão de competições, equipas, jogos e utilizadores"
      />

      <MatchCalendar data={data} isBackoffice />
    </>
  );
}

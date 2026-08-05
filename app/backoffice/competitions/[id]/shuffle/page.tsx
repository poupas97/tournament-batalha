"use client";

import CompetitionShuffle from "@/components/CompetitionShuffle";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewCompetitionMatchesPage() {
  const params = useParams();
  const competitionId = params?.id;

  const {
    data: competitionData,
    loading: competitionLoading,
    error: competitionError,
  } = useGetState<CompetitionBEResponse>(
    competitionId ? `/api/backoffice/competitions/${competitionId}` : undefined,
  );

  const {
    data: matchesData,
    loading: matchesLoading,
    error: matchesError,
  } = useGetState<MatchBEResponse[]>(
    competitionId
      ? `/api/backoffice/competitions/${competitionId}/shuffle`
      : undefined,
  );

  return (
    <>
      <Title label="Ver sorteio" back />

      {matchesLoading && <p>A carregar sorteio...</p>}
      {matchesError && <p style={{ color: "crimson" }}>{matchesError}</p>}

      {competitionLoading && <p>A carregar competição...</p>}
      {competitionError && (
        <p style={{ color: "crimson" }}>{competitionError}</p>
      )}

      {!matchesLoading &&
        !competitionLoading &&
        competitionData &&
        matchesData && (
          <CompetitionShuffle
            competition={competitionData}
            matches={matchesData}
          />
        )}
    </>
  );
}

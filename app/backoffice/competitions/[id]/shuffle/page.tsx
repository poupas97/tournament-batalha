"use client";

import CompetitionShuffle from "@/components/CompetitionShuffle";
import DataTable from "@/components/DataTable";
import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import {
  CompetitionBEResponse,
  CompetitionStatsBEResponse,
} from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { Typography } from "@mui/material";
import { useParams } from "next/navigation";

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

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useGetState<CompetitionStatsBEResponse>(
    competitionId
      ? `/api/backoffice/competitions/${competitionId}/stats`
      : undefined,
  );

  return (
    <>
      <Title
        label="Ver sorteio"
        description="Consulte os grupos, eliminatórias e jogos gerados para a competição"
        back
      />

      {matchesLoading && (
        <Typography variant="body1">A carregar sorteio...</Typography>
      )}
      {matchesError && (
        <Typography variant="body1" color="error">
          {matchesError}
        </Typography>
      )}

      {competitionLoading && (
        <Typography variant="body1">A carregar competição...</Typography>
      )}
      {competitionError && (
        <Typography variant="body1" color="error">
          {competitionError}
        </Typography>
      )}

      {!matchesLoading &&
        !competitionLoading &&
        competitionData &&
        matchesData && (
          <CompetitionShuffle
            competition={competitionData}
            matches={matchesData}
            isBackoffice
          />
        )}

      <Typography variant="h5">Marcadores</Typography>
      <DataTable
        data={statsData?.rankingScores || []}
        //TODO: clickableRow={(it) => router.push(`/players/${it.playerId}`)}
        columns={[
          { key: "position", header: "º" },
          { key: "playerName", header: "Nome" },
          { key: "teamName", header: "Equipa" },
          { key: "goals", header: "Golos" },
          { key: "matches", header: "Jogos" },
        ]}
      />
    </>
  );
}

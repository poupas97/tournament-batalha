"use client";

import CompetitionShuffle from "@/components/CompetitionShuffle";
import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import { CompetitionStatus } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import {
  getCompetitionConfigHint,
  getCompetitionOpponentsHint,
  getCompetitionQualifiedHint,
  getCompetitionStatusHint,
} from "@/lib/detailHints";
import {
  CompetitionBEResponse,
  CompetitionStatsBEResponse,
} from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

export default function ViewCompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params?.id;

  const {
    data: competitionData,
    loading: competitionLoading,
    error: competitionError,
  } = useGetState<CompetitionBEResponse>(
    competitionId ? `/api/competitions/${competitionId}` : undefined,
  );

  const {
    data: matchesData,
    loading: matchesLoading,
    error: matchesError,
  } = useGetState<MatchBEResponse[]>(
    competitionId ? `/api/competitions/${competitionId}/shuffle` : undefined,
  );

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useGetState<CompetitionStatsBEResponse>(
    competitionId ? `/api/competitions/${competitionId}/stats` : undefined,
  );

  return (
    <>
      <Title label="Ver competição" back />

      <Detail<CompetitionBEResponse>
        loading={competitionLoading}
        error={competitionError}
        data={competitionData}
        fields={[
          { key: "name", label: "Nome" },
          { key: "_count.teams", label: "Equipas" },
          {
            key: "config",
            label: "Configuração",
            hint: getCompetitionConfigHint,
          },
          {
            key: "qualified",
            label: "Qualificados",
            hint: getCompetitionQualifiedHint,
          },
          {
            key: "opponents",
            label: "Oponentes",
            hint: getCompetitionOpponentsHint,
          },
          { key: "active", label: "Ativo", format: "boolean" },
          {
            key: "status",
            label: "Estado",
            hint: getCompetitionStatusHint,
          },
        ]}
      />

      {competitionLoading || statsLoading || matchesLoading ? (
        <Typography variant="body1">A carregar competição...</Typography>
      ) : competitionError || statsError || matchesError ? (
        <Typography variant="body1" color="error">
          {competitionError || statsError || matchesError}
        </Typography>
      ) : (
        !!competitionData &&
        !!statsData &&
        !!matchesData && (
          <>
            {competitionData?.status === CompetitionStatus.DRAFT ||
            competitionData?.status === CompetitionStatus.DRAWN ? (
              <GridTable
                loading={false}
                error={undefined}
                data={competitionData?.teams}
                clickableRow={(it) => router.push(`/teams/${it.id}`)}
                notChangeRoute
                title={`Equipas (${competitionData?.teams.length})`}
                columns={[
                  { key: "name", header: "Nome" },
                  { key: "_count.players", header: "Jogadores" },
                  { key: "_count.staffs", header: "Staffs" },
                ]}
              />
            ) : (
              <>
                <CompetitionShuffle
                  competition={competitionData}
                  matches={matchesData}
                />

                <Typography variant="h5">Marcadores</Typography>
                <DataTable
                  data={statsData.rankingScores || []}
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
            )}
          </>
        )
      )}
    </>
  );
}

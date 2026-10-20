"use client";

import CompetitionShuffle from "@/components/CompetitionShuffle";
import Detail from "@/components/Detail";
import GridTable from "@/components/GridTable";
import RankingScoresTable from "@/components/RankingScoresTable";
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
import TeamIdentity from "@/components/TeamIdentity";
import { Typography } from "@mui/material";
import { useParams } from "next/navigation";

export default function ViewCompetitionPage() {
  const params = useParams();
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
          { key: "startDate", label: "Data de início", format: "date" },
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
          {
            key: "status",
            label: "Estado",
            hint: getCompetitionStatusHint,
          },
          { key: "_count.teams", label: "Equipas" },
          { key: "color", label: "Cor", format: "color" },
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
            {competitionData?.status === CompetitionStatus.DRAFT ? (
              <GridTable
                loading={false}
                error={undefined}
                data={competitionData?.teams}
                href={(it) => `/teams/${it.id}`}
                notChangeRoute
                title={`Equipas (${competitionData?.teams.length || 0})`}
                columns={[
                  {
                    key: "name",
                    header: "Equipa",
                    render: (team) => <TeamIdentity team={team} />,
                  },
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

                <RankingScoresTable rankingScores={statsData.rankingScores} />
              </>
            )}
          </>
        )
      )}
    </>
  );
}

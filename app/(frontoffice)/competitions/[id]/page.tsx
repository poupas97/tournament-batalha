"use client";

import Detail from "@/components/Detail";
import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import { useParams } from "next/navigation";

type Stats = {
  rankingScores:
    | {
        position: number;
        playerId: number;
        playerName: string;
        goals: number;
        teamName: string;
        matches: number;
      }[]
    | undefined;
  rankingTeams:
    | {
        draws: number;
        goalDifference: string;
        goalsAgainst: number;
        goalsFor: string;
        losses: number;
        matches: string;
        points: number;
        position: string;
        teamId: number;
        teamName: string;
        wins: string;
      }[]
    | undefined;
};

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
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useGetState<Stats>(
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
          { key: "config", label: "Configuração" },
          { key: "qualified", label: "Qualificados" },
          { key: "opponents", label: "Oponentes" },
        ]}
      />

      {/* <h4>Classificações</h4>
      <GridTable
        loading={statsLoading}
        error={statsError}
        data={statsData?.rankingTeams || []}
        clickableRow={(it) => router.push(`/teams/${it.teamId}`)}
        notChangeRoute
        columns={[
          { key: "position", header: "º" },
          { key: "teamName", header: "Equipa" },
          { key: "matches", header: "Jogos" },
          { key: "wins", header: "V" },
          { key: "draws", header: "E" },
          { key: "losses", header: "D" },
          { key: "goalsAgainst", header: "GM" },
          { key: "goalsFor", header: "GS" },
          { key: "goalDifference", header: "DG" },
        ]}
      /> */}

      <h4>Equipas</h4>
      <GridTable
        loading={competitionLoading}
        error={competitionError}
        data={competitionData?.teams}
        clickableRow={(it) => `/teams/${it.id}`}
        notChangeRoute
        columns={[{ key: "name", header: "Nome" }]}
      />

      <h4>Marcadores</h4>
      <GridTable
        loading={statsLoading}
        error={statsError}
        data={statsData?.rankingScores || []}
        notChangeRoute
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

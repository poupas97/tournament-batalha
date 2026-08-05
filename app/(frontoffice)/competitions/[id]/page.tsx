"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import Link from "next/link";
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

      {competitionLoading && <p>A carregar competição...</p>}
      {competitionError && (
        <p style={{ color: "crimson" }}>{competitionError}</p>
      )}

      {statsLoading && <p>A carregar estatísticas...</p>}
      {statsError && <p style={{ color: "crimson" }}>{statsError}</p>}

      {!competitionLoading && competitionData && (
        <Detail<CompetitionBEResponse>
          data={competitionData}
          fields={[{ key: "name", label: "Nome da competição" }]}
        />
      )}

      {!statsLoading && statsData && (
        <>
          <h4>Classificações</h4>
          <DataTable
            data={statsData.rankingTeams || []}
            columns={[
              { key: "position", header: "º" },
              {
                key: "teamName",
                header: "Equipa",
                render: (it) => (
                  <Link
                    href={`/teams/${it.teamId}`}
                    style={{ color: "#2563eb" }}
                  >
                    {it.teamName}
                  </Link>
                ),
              },
              { key: "matches", header: "Jogos" },
              { key: "wins", header: "V" },
              { key: "draws", header: "E" },
              { key: "losses", header: "D" },
              { key: "goalsAgainst", header: "GM" },
              { key: "goalsFor", header: "GS" },
              { key: "goalDifference", header: "DG" },
            ]}
          />

          <h4>Marcadores</h4>
          <DataTable
            data={statsData.rankingScores || []}
            columns={[
              { key: "position", header: "º" },
              {
                key: "playerName",
                header: "Nome",
                render: (it) => (
                  <Link
                    href={`/players/${it.playerId}`}
                    style={{ color: "#2563eb" }}
                  >
                    {it.playerName}
                  </Link>
                ),
              },
              { key: "goals", header: "Golos" },
              { key: "teamName", header: "Equipa" },
              { key: "matches", header: "Jogos" },
            ]}
          />
        </>
      )}
    </>
  );
}

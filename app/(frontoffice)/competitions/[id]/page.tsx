"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import { Player } from "@/generated/prisma";
import { CompetitionBEResponse } from "@/types/competition";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [competition, setTeam] = useState<CompetitionBEResponse | null>(null);
  const [stats, setStats] = useState<Stats>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!competitionId) return;

    fetch(`/api/competitions/${competitionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setTeam(data);
      })
      .catch(() => {
        alert("Erro ao carregar a equipa.");
      })
      .finally(() => setLoading(false));
  }, [competitionId]);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch(
          `/api/competitions/${competitionId}/stats`,
        );

        if (!response.ok) {
          throw new Error("Não foi possível carregar as estatisticas.");
        }

        const data = (await response.json()) as Stats;
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, [competitionId]);

  return (
    <>
      <h1>Ver competição</h1>

      {loading && <p>A carregar competição...</p>}

      {!loading && competition && (
        <Detail<CompetitionBEResponse>
          data={competition}
          fields={[{ key: "name", label: "Nome da competição" }]}
        />
      )}

      {!loading && stats && (
        <>
          <h4>Classificações</h4>
          <DataTable
            data={stats.rankingTeams || []}
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
            data={stats.rankingScores || []}
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

      <Link
        href="/competitions"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </>
  );
}

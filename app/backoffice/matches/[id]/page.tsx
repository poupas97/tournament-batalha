"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import MatchEventGrid from "@/components/MatchEventGrid";
import { MatchEvent, MatchStatus } from "@/generated/prisma";
import { MatchBEResponse } from "@/types/match";
import { MatchEventBEResponse } from "@/types/match-event";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;

  const [match, setMatch] = useState<MatchBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMatch = useCallback(async () => {
    if (!matchId) return;

    try {
      const response = await fetch(`/api/backoffice/matches/${matchId}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setMatch(data);
    } catch {
      alert("Erro ao carregar a jogo.");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  async function handleChangeStatus(status: MatchStatus) {
    const response = await fetch(`/api/backoffice/matches/${matchId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar o status." }));
      alert(error.error ?? "Erro ao guardar o status.");
      return;
    }

    await loadMatch();
  }

  async function handleRemoveEvent(matchEvent: MatchEvent) {
    const response = await fetch(
      `/api/backoffice/match-events/${matchEvent.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao remover evento." }));
      alert(error.error ?? "Erro ao remover evento.");
      return;
    }

    await loadMatch();
  }

  return (
    <>
      <h1>Ver jogo</h1>

      {loading && <p>A carregar jogo...</p>}

      {!loading && match && (
        <>
          <Detail<MatchBEResponse>
            data={match}
            fields={[
              { key: "competition.name", label: "Competição" },
              { key: "date", label: "Data" },
              { key: "round", label: "Ronda" },
              { key: "homeTeam.name", label: "Equipa da Casa" },
              { key: "awayTeam.name", label: "Equipa Visitante" },
              { key: "status", label: "Estado" },
            ]}
          />

          <h3>Estado do jogo</h3>
          <div
            style={{
              flex: 2,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
            }}
          >
            {Object.keys(MatchStatus).map((it) => {
              const key = it as keyof typeof MatchStatus;

              return (
                <button
                  key={it}
                  type="button"
                  onClick={() => handleChangeStatus(key)}
                  disabled={false}
                  style={{
                    padding: "0.6rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    background: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {it}
                </button>
              );
            })}
          </div>

          <h3>Eventos</h3>
          <div style={{ display: "flex", gap: "2rem" }}>
            <MatchEventGrid
              team={match.homeTeam}
              matchId={matchId as string}
              loadMatch={loadMatch}
            />
            <MatchEventGrid
              team={match.awayTeam}
              matchId={matchId as string}
              loadMatch={loadMatch}
            />
          </div>

          <h3>Tabela de Eventos</h3>
          {match.events && (
            <DataTable
              data={match.events}
              columns={[
                { key: "type", header: "Tipo" },
                { key: "minute", header: "Minuto" },
                { key: "player.name", header: "Jogador" },
                { key: "staff.name", header: "Staff" },
                { key: "team.name", header: "Equipa" },
                {
                  key: "actions",
                  header: "Ações",
                  render: (it) => (
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(it)}
                      style={{
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        color: "crimson",
                        cursor: "pointer",
                      }}
                    >
                      Remover
                    </button>
                  ),
                },
              ]}
            />
          )}
        </>
      )}

      <Link
        href="/backoffice/matches"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </>
  );
}

"use client";

import DataTable from "@/components/DataTable";
import { MatchBEResponse } from "@/types/match";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchBEResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch("/api/matches");

        if (!response.ok) {
          throw new Error("Não foi possível carregar as jogos.");
        }

        const data = (await response.json()) as MatchBEResponse[];
        setMatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }

    void loadTeams();
  }, []);

  return (
    <>
      <h1>Jogos</h1>

      {loading && <p>A carregar jogos...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={matches}
            columns={[
              { key: "competition.name", header: "Competição" },
              { key: "date", header: "Data" },
              { key: "round", header: "Ronda" },
              { key: "homeTeam.name", header: "Equipa da Casa" },
              { key: "awayTeam.name", header: "Equipa Visitante" },
              {
                key: "actions",
                header: "Ações",
                render: (it) => (
                  <Link href={`/matches/${it.id}`} style={{ color: "#2563eb" }}>
                    Ver
                  </Link>
                ),
              },
            ]}
          />
        </div>
      )}
    </>
  );
}

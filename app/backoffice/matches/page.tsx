"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import Link from "next/link";
import { useEffect, useState } from "react";

type MatchSummary = {
  id: number;
  name: string;
  createdAt: string;
  _count: {
    teams: number;
  };
};

export default function BackofficeMatchesPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/backoffice/matches")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setMatches(data);
      })
      .catch(() => {
        setError("Erro ao carregar jogos.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Title label="Jogos" />

      <div>
        <Link
          href="/backoffice/matches/create"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
          }}
        >
          Adicionar jogo
        </Link>
      </div>

      {loading && <p>A carregar jogos...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            columns={[
              { key: "competition.name", header: "Competição" },
              { key: "date", header: "Data", format: "date" },
              { key: "round", header: "Ronda" },
              { key: "homeTeam.name", header: "Equipa da Casa" },
              { key: "awayTeam.name", header: "Equipa Visitante" },
              {
                key: "actions",
                header: "Ações",
                render: (team) => (
                  <>
                    <Link
                      href={`/backoffice/matches/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/backoffice/matches/edit/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Editar
                    </Link>
                  </>
                ),
              },
            ]}
            data={matches}
          />
        </div>
      )}
    </>
  );
}

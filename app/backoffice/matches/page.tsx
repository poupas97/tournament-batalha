"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MatchSummary = {
  id: number;
  name: string;
  createdAt: string;
  _count: {
    teams: number;
  };
};

export default function BackofficeMatchesPage() {
  const router = useRouter();

  const { data, loading, error } = useGetState<MatchSummary[]>(
    "/api/backoffice/matches",
  );

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

      {!loading && data && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={data}
            clickableRow={(it) => router.push(`/backoffice/matches/${it.id}`)}
            columns={[
              { key: "competition.name", header: "Competição" },
              { key: "date", header: "Data", format: "date" },
              { key: "round", header: "Ronda" },
              { key: "homeTeam.name", header: "Equipa da Casa" },
              { key: "awayTeam.name", header: "Equipa Visitante" },
            ]}
          />
        </div>
      )}
    </>
  );
}

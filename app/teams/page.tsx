"use client";

import DataTable from "@/components/DataTable";
import { useEffect, useState } from "react";

type TeamSummary = {
  id: number;
  name: string;
  createdAt: string;
  _count: {
    players: number;
    staff: number;
  };
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch("/api/teams");

        if (!response.ok) {
          throw new Error("Não foi possível carregar as equipas.");
        }

        const data = (await response.json()) as TeamSummary[];
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }

    void loadTeams();
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Equipas</h1>

      {loading && <p>A carregar equipas...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            columns={[
              { key: "name", header: "Nome" },
              { key: "_count.players", header: "Jogadores" },
              { key: "_count.staff", header: "Staff" },
            ]}
            data={teams}
          />
        </div>
      )}
    </main>
  );
}

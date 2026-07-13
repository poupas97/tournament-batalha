"use client";

import DataTable from "@/components/DataTable";
import { CompetitionBEResponse } from "@/types/competition";
import { useEffect, useState } from "react";

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<CompetitionBEResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch("/api/competitions");

        if (!response.ok) {
          throw new Error("Não foi possível carregar as competições.");
        }

        const data = (await response.json()) as CompetitionBEResponse[];
        setCompetitions(data);
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

      {loading && <p>A carregar competições...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={competitions}
            columns={[
              { key: "name", header: "Nome" },
              { key: "_count.teams", header: "Equipas" },
            ]}
          />
        </div>
      )}
    </>
  );
}

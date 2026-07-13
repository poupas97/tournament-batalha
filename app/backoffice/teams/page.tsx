"use client";

import DataTable from "@/components/DataTable";
import Link from "next/link";
import { useEffect, useState } from "react";

type TeamSummary = {
  id: number;
  name: string;
  createdAt: string;
  _count: {
    players: number;
    staffs: number;
  };
};

export default function BackofficeTeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/backoffice/teams")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setTeams(data);
      })
      .catch(() => {
        setError("Erro ao carregar equipas.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1>Equipas</h1>
      <div>
        <Link
          href="/backoffice/teams/create"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
          }}
        >
          Adicionar equipa
        </Link>
      </div>

      {loading && <p>A carregar equipas...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            columns={[
              { key: "name", header: "Nome" },
              { key: "competition.name", header: "Competição" },
              { key: "_count.players", header: "Jogadores" },
              { key: "_count.staffs", header: "Staff" },
              {
                key: "actions",
                header: "Ações",
                render: (team) => (
                  <>
                    <Link
                      href={`/backoffice/teams/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/backoffice/teams/edit/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Editar
                    </Link>
                  </>
                ),
              },
            ]}
            data={teams}
          />
        </div>
      )}
    </>
  );
}

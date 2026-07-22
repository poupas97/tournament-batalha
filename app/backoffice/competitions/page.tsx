"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import { CompetitionConfig } from "@/generated/prisma";
import Link from "next/link";
import { useEffect, useState } from "react";

type CompetitionSummary = {
  id: number;
  name: string;
  createdAt: string;
  config: CompetitionConfig;
  qualifed?: number;
  opponents?: number;
  _count: {
    teams: number;
  };
};

export default function BackofficeCompetitionsPage() {
  const [competitions, setCompetitions] = useState<CompetitionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/backoffice/competitions")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setCompetitions(data);
      })
      .catch(() => {
        setError("Erro ao carregar competições.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Title label="Competições" />

      <div>
        <Link
          href="/backoffice/competitions/create"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
          }}
        >
          Adicionar competição
        </Link>
      </div>

      {loading && <p>A carregar competições...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            columns={[
              { key: "name", header: "Nome" },
              { key: "config", header: "Configuração" },
              { key: "qualified", header: "Qualificados" },
              { key: "opponents", header: "Oponentes" },
              { key: "active", header: "Ativo", format: "boolean" },
              { key: "_count.teams", header: "Equipas" },
              {
                key: "actions",
                header: "Ações",
                render: (team) => (
                  <>
                    <Link
                      href={`/backoffice/competitions/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/backoffice/competitions/edit/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Editar
                    </Link>
                  </>
                ),
              },
            ]}
            data={competitions}
          />
        </div>
      )}
    </>
  );
}

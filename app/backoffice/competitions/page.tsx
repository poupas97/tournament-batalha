"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import { CompetitionConfig } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const { data, loading, error } = useGetState<CompetitionSummary[]>(
    "/api/backoffice/competitions",
  );

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

      {!loading && data && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={data}
            clickableRow={(it) =>
              router.push(`/backoffice/competitions/${it.id}`)
            }
            columns={[
              { key: "name", header: "Nome" },
              { key: "config", header: "Configuração" },
              { key: "qualified", header: "Qualificados" },
              { key: "opponents", header: "Oponentes" },
              { key: "active", header: "Ativo", format: "boolean" },
              { key: "_count.teams", header: "Equipas" },
            ]}
          />
        </div>
      )}
    </>
  );
}

"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const { data, loading, error } = useGetState<TeamSummary[]>(
    "/api/backoffice/teams",
  );

  return (
    <>
      <Title label="Equipas" />

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

      {!loading && data && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={data}
            clickableRow={(it) => router.push(`/backoffice/teams/${it.id}`)}
            columns={[
              { key: "name", header: "Nome" },
              { key: "competition.name", header: "Competição" },
              { key: "_count.players", header: "Jogadores" },
              { key: "_count.staffs", header: "Staff" },
            ]}
          />
        </div>
      )}
    </>
  );
}

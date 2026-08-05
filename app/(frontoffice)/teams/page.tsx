"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
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

export default function TeamsPage() {
  const router = useRouter();

  const { data, loading, error } = useGetState<TeamSummary[]>("/api/teams");

  return (
    <>
      <Title label="Equipas" />

      {loading && <p>A carregar equipas...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && data && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={data}
            clickableRow={(it) => router.push(`/teams/${it.id}`)}
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

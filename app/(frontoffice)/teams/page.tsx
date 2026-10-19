"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";

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
  const { data, loading, error } = useGetState<TeamSummary[]>("/api/teams");

  return (
    <>
      <Title label="Equipas" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        href={(it) => `/teams/${it.id}`}
        columns={[
          { key: "name", header: "Nome" },
          { key: "competition.name", header: "Competição" },
          { key: "_count.players", header: "Jogadores" },
          { key: "_count.staffs", header: "Staffs" },
        ]}
      />
    </>
  );
}

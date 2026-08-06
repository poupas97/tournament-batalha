"use client";

import GridTable from "@/components/GridTable";
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

export default function BackofficeTeamsPage() {
  const router = useRouter();

  const { data, loading, error } = useGetState<TeamSummary[]>(
    "/api/backoffice/teams",
  );

  return (
    <>
      <Title label="Equipas" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        create="/backoffice/teams/create"
        clickableRow={(it) => router.push(`/backoffice/teams/${it.id}`)}
        columns={[
          { key: "name", header: "Nome" },
          { key: "competition.name", header: "Competição" },
          { key: "_count.players", header: "Jogadores" },
          { key: "_count.staffs", header: "Staff" },
        ]}
      />
    </>
  );
}

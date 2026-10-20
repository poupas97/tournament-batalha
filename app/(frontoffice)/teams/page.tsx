"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import TeamIdentity from "@/components/TeamIdentity";
import { TeamBEResponse } from "@/types/team";

export default function TeamsPage() {
  const { data, loading, error } = useGetState<TeamBEResponse[]>("/api/teams");

  return (
    <>
      <Title label="Equipas" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        href={(it) => `/teams/${it.id}`}
        columns={[
          {
            key: "name",
            header: "Equipa",
            render: (team) => <TeamIdentity team={team} />,
          },
          { key: "competition.name", header: "Competição" },
          { key: "_count.players", header: "Jogadores" },
          { key: "_count.staffs", header: "Staffs" },
        ]}
      />
    </>
  );
}

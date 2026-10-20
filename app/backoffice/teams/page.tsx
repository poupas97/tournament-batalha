"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import TeamIdentity from "@/components/TeamIdentity";
import { TeamBEResponse } from "@/types/team";

export default function BackofficeTeamsPage() {
  const { data, loading, error } = useGetState<TeamBEResponse[]>(
    "/api/backoffice/teams",
  );

  return (
    <>
      <Title
        label="Equipas"
        description="Consulte e gere as equipas inscritas nas competições"
      />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        create="/backoffice/teams/create"
        href={(it) => `/backoffice/teams/${it.id}`}
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

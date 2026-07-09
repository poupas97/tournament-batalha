"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import { TeamBEResponse } from "@/types/team";

type DetailsTeamProps = {
  team: TeamBEResponse;
};

export default function DetailsTeam({ team }: DetailsTeamProps) {
  return (
    <Detail<TeamBEResponse>
      data={team}
      fields={[{ key: "name", label: "Nome da equipa" }]}
    >
      <h4>Jogadores</h4>
      <DataTable
        data={team.players}
        columns={[
          { key: "name", header: "Nome" },
          { key: "number", header: "Nº" },
        ]}
      />

      <h4>Staff</h4>
      <DataTable
        data={team.staffs}
        columns={[{ key: "name", header: "Nome" }]}
      />
    </Detail>
  );
}

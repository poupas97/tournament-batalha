"use client";

import Detail from "@/components/Detail";
import { TeamBEResponse } from "@/types/team";
import GridTable from "./GridTable";

type DetailsTeamProps = {
  loading: boolean;
  error: string | undefined;
  team: TeamBEResponse | undefined;
};

export default function DetailsTeam({
  loading,
  error,
  team,
}: DetailsTeamProps) {
  return (
    <>
      <Detail<TeamBEResponse>
        loading={loading}
        error={error}
        data={team}
        fields={[
          { key: "name", label: "Nome" },
          { key: "competition.name", label: "Competição" },
        ]}
      />

      <h4>Jogadores ({team?.players.length})</h4>
      <GridTable
        loading={loading}
        error={error}
        data={team?.players || []}
        notChangeRoute
        columns={[
          { key: "name", header: "Nome" },
          { key: "number", header: "Nº" },
        ]}
      />

      <h4>Staff ({team?.staffs.length})</h4>
      <GridTable
        loading={loading}
        error={error}
        data={team?.staffs || []}
        notChangeRoute
        columns={[{ key: "name", header: "Nome" }]}
      />
    </>
  );
}

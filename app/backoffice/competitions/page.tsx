"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import { CompetitionConfig } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";

type CompetitionSummary = {
  id: number;
  name: string;
  color: string;
  config: CompetitionConfig;
  qualifed?: number;
  opponents?: number;
  _count: {
    teams: number;
  };
  createdAt: string;
};

export default function BackofficeCompetitionsPage() {
  const { data, loading, error } = useGetState<CompetitionSummary[]>(
    "/api/backoffice/competitions",
  );

  return (
    <>
      <Title
        label="Competições"
        description="Consulte e gere as configurações das competições"
      />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        create="/backoffice/competitions/create"
        href={(it) => `/backoffice/competitions/${it.id}`}
        columns={[
          { key: "name", header: "Nome" },
          { key: "config", header: "Configuração" },
          { key: "qualified", header: "Qualificados" },
          { key: "opponents", header: "Oponentes" },
          { key: "status", header: "Estado" },
          { key: "_count.teams", header: "Equipas" },
          { key: "color", header: "Cor", format: "color" },
          { key: "active", header: "Ativo", format: "boolean" },
        ]}
      />
    </>
  );
}

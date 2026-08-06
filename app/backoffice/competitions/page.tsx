"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import { CompetitionConfig } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
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

      <GridTable
        loading={loading}
        error={error}
        data={data}
        create="/backoffice/competitions/create"
        clickableRow={(it) => router.push(`/backoffice/competitions/${it.id}`)}
        columns={[
          { key: "name", header: "Nome" },
          { key: "config", header: "Configuração" },
          { key: "qualified", header: "Qualificados" },
          { key: "opponents", header: "Oponentes" },
          { key: "active", header: "Ativo", format: "boolean" },
          { key: "_count.teams", header: "Equipas" },
        ]}
      />
    </>
  );
}

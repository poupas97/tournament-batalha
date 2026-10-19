"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";

export default function CompetitionsPage() {
  const { data, loading, error } =
    useGetState<CompetitionBEResponse[]>("/api/competitions");

  return (
    <>
      <Title label="Competições" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        href={(it) => `/competitions/${it.id}`}
        columns={[
          { key: "name", header: "Nome" },
          { key: "config", header: "Configuração" },
          { key: "qualified", header: "Qualificados" },
          { key: "opponents", header: "Oponentes" },
          { key: "status", header: "Estado" },
          { key: "_count.teams", header: "Equipas" },
          { key: "color", header: "Cor", format: "color" },
        ]}
      />
    </>
  );
}

"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import { useRouter } from "next/navigation";

export default function CompetitionsPage() {
  const router = useRouter();

  const { data, loading, error } =
    useGetState<CompetitionBEResponse[]>("/api/competitions");

  return (
    <>
      <Title label="Competições" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        clickableRow={(it) => router.push(`/competitions/${it.id}`)}
        columns={[
          { key: "name", header: "Nome" },
          { key: "_count.teams", header: "Equipas" },
        ]}
      />
    </>
  );
}

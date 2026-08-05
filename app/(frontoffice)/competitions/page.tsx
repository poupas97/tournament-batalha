"use client";

import DataTable from "@/components/DataTable";
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

      {loading && <p>A carregar competições...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && data && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={data}
            clickableRow={(it) => router.push(`/competitions/${it.id}`)}
            columns={[
              { key: "name", header: "Nome" },
              { key: "_count.teams", header: "Equipas" },
            ]}
          />
        </div>
      )}
    </>
  );
}

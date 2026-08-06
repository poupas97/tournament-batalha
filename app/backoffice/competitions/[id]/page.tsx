"use client";

import Detail from "@/components/Detail";
import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ViewCompetitionPage() {
  const params = useParams();
  const competitionId = params?.id;

  const { data, loading, error } = useGetState<CompetitionBEResponse>(
    competitionId ? `/api/backoffice/competitions/${competitionId}` : undefined,
  );

  async function onShuffle() {
    fetch(`/api/backoffice/competitions/${competitionId}/shuffle`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        alert("Sucesso");
      })
      .catch(() => {
        alert("Erro ao fazer sorteio.");
      });
  }

  return (
    <>
      <Title
        label="Ver competição"
        back
        edit={`/backoffice/competitions/${competitionId}/edit`}
      />

      <Detail<CompetitionBEResponse>
        loading={loading}
        error={error}
        data={data}
        fields={[
          { key: "name", label: "Nome" },
          { key: "_count.teams", label: "Equipas" },
          { key: "config", label: "Configuração" },
          { key: "qualified", label: "Qualificados" },
          { key: "opponents", label: "Oponentes" },
          { key: "active", label: "Ativo", format: "boolean" },
        ]}
      />

      <h4>Equipas</h4>
      <GridTable
        loading={loading}
        error={error}
        data={data?.teams}
        clickableRow={(it) => `/backoffice/teams/${it.id}`}
        notChangeRoute
        columns={[{ key: "name", header: "Nome" }]}
      />

      <button
        onClick={onShuffle}
        style={{
          padding: "1rem",
          border: "none",
          borderRadius: "0.5rem",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Sorteio
      </button>

      <Link href={`${competitionId}/shuffle`} style={{ color: "#0366d6" }}>
        Ver sorteio
      </Link>
    </>
  );
}

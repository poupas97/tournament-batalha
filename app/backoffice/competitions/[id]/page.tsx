"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
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
      <Title label="Ver competição" back />

      {loading && <p>A carregar competição...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && data && (
        <>
          <Detail<CompetitionBEResponse>
            data={data}
            fields={[
              { key: "name", label: "Nome" },
              { key: "config", label: "Configuração" },
              { key: "qualified", label: "Qualificados" },
              { key: "opponents", label: "Oponentes" },
              { key: "active", label: "Ativo", format: "boolean" },
            ]}
          />

          <h4>Equipas</h4>
          <DataTable
            data={data.teams}
            columns={[{ key: "name", header: "Nome" }]}
          />

          <button
            onClick={onShuffle}
            style={{
              padding: "0.7rem 1rem",
              border: "none",
              borderRadius: "6px",
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
      )}
    </>
  );
}

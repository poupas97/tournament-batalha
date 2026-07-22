"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import Title from "@/components/Title";
import { CompetitionBEResponse } from "@/types/competition";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewCompetitionPage() {
  const params = useParams();
  const competitionId = params?.id;
  const [competition, setCompetition] = useState<CompetitionBEResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!competitionId) return;

    fetch(`/api/backoffice/competitions/${competitionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setCompetition(data);
      })
      .catch(() => {
        alert("Erro ao carregar a competição.");
      })
      .finally(() => setLoading(false));
  }, [competitionId]);

  return (
    <>
      <Title label="Ver competição" back />

      {loading && <p>A carregar competição...</p>}

      {!loading && competition && (
        <>
          <Detail<CompetitionBEResponse>
            data={competition}
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
            data={competition.teams}
            columns={[{ key: "name", header: "Nome" }]}
          />
        </>
      )}
    </>
  );
}

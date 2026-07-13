"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import { CompetitionBEResponse } from "@/types/competition";
import Link from "next/link";
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
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Ver competição</h1>
      <p style={{ marginBottom: "1rem" }}>Veja os dados da competição.</p>

      {loading && <p>A carregar competição...</p>}

      {!loading && competition && (
        <Detail<CompetitionBEResponse>
          data={competition}
          fields={[{ key: "name", label: "Nome da competição" }]}
        >
          <h4>Equipas</h4>
          <DataTable
            data={competition.teams}
            columns={[{ key: "name", header: "Nome" }]}
          />
        </Detail>
      )}

      <Link
        href="/backoffice/competitions"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </main>
  );
}

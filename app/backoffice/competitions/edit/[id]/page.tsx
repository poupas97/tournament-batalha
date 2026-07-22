"use client";

import Form from "@/components/Form";
import { CompetitionConfig } from "@/generated/prisma";
import {
  CompetitionBEResponse,
  ICompetitionFormValues,
} from "@/types/competition";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCompetitionPage() {
  const params = useParams();
  const router = useRouter();
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

  async function handleSubmit(values: ICompetitionFormValues) {
    const response = await fetch(
      `/api/backoffice/competitions/${competitionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar competição." }));
      alert(error.error ?? "Erro ao guardar competição.");
      return;
    }

    router.push("/backoffice/competitions");
  }

  return (
    <>
      <h1>Editar competição</h1>

      {loading && <p>A carregar competição...</p>}

      {!loading && competition && (
        <Form<ICompetitionFormValues>
          initialValues={competition}
          fields={[
            { key: "name", label: "Nome" },
            {
              key: "config",
              label: "Configuracao",
              type: "select",
              options: Object.keys(CompetitionConfig).map((it) => ({
                label: it,
                value: it,
              })),
            },
            { key: "qualified", label: "Qualificados" },
            { key: "opponents", label: "Oponentes" },
            { key: "active", label: "Ativo", type: "checkbox" },
          ]}
          onSubmit={handleSubmit}
        />
      )}

      <Link
        href="/backoffice/competitions"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </>
  );
}

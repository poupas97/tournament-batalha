"use client";

import Form from "@/components/Form";
import Title from "@/components/Title";
import { CompetitionConfig } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import {
  CompetitionBEResponse,
  ICompetitionFormValues,
} from "@/types/competition";
import { useParams, useRouter } from "next/navigation";

export default function EditCompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params?.id;

  const { data, loading, error } = useGetState<CompetitionBEResponse>(
    competitionId ? `/api/backoffice/competitions/${competitionId}` : undefined,
  );

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

    router.back();
  }

  return (
    <>
      <Title label="Editar competição" back />

      {loading && <p>A carregar competição...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && data && (
        <Form<ICompetitionFormValues>
          initialValues={data}
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
    </>
  );
}

"use client";

import Form from "@/components/Form";
import Title from "@/components/Title";
import { CompetitionConfig } from "@/generated/prisma";
import { ICompetitionFormValues } from "@/types/competition";
import { useRouter } from "next/navigation";

export default function CreateCompetitionPage() {
  const router = useRouter();

  async function handleSubmit(values: ICompetitionFormValues) {
    const response = await fetch("/api/backoffice/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao criar competição." }));
      alert(error.error ?? "Erro ao criar competição.");
      return;
    }

    router.push("/backoffice/competitions");
  }

  return (
    <>
      <Title label="Criar competição" back />

      <Form<ICompetitionFormValues>
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
        ]}
        onSubmit={handleSubmit}
      />
    </>
  );
}

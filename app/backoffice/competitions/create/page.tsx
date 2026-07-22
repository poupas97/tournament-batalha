"use client";

import Form from "@/components/Form";
import { ICompetitionFormValues } from "@/types/competition";
import Link from "next/link";
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
      <h1>Criar competição</h1>

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

      <Link
        href="/backoffice/competitions"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </>
  );
}

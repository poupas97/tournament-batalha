"use client";

import FormCompetition from "@/components/FormCompetition";
import Title from "@/components/Title";
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
        .catch(() => ({ error: "Erro ao criar competição" }));
      alert(error.error ?? "Erro ao criar competição");
      return;
    }

    router.back();
  }

  return (
    <>
      <Title
        label="Criar competição"
        description="Defina a configuração e as regras da nova competição"
        back
      />

      <FormCompetition onSubmit={handleSubmit} />
    </>
  );
}

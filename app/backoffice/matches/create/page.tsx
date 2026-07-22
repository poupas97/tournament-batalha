"use client";

import FormMatch from "@/components/FormMatch";
import Title from "@/components/Title";
import { IMatchFormValues } from "@/types/match";
import { useRouter } from "next/navigation";

export default function CreateMatchPage() {
  const router = useRouter();

  async function handleSubmit(values: IMatchFormValues) {
    const response = await fetch("/api/backoffice/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao criar jogos." }));
      alert(error.error ?? "Erro ao criar jogos.");
      return;
    }

    router.push("/backoffice/matches");
  }

  return (
    <>
      <Title label="Criar jogo" back />

      <FormMatch handleSubmit={handleSubmit} />
    </>
  );
}

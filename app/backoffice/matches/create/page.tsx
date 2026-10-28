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

    return { response, onSuccess: () => router.back() };
  }

  return (
    <>
      <Title
        label="Criar jogo"
        description="Agende um jogo entre duas equipas da mesma competição"
        back
      />

      <FormMatch handleSubmit={handleSubmit} />
    </>
  );
}

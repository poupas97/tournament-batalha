"use client";

import FormTeam from "@/components/FormTeam";
import { ITeamFormValues } from "@/types/team";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateTeamPage() {
  const router = useRouter();

  async function handleSubmit(values: ITeamFormValues) {
    const response = await fetch("/api/backoffice/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao criar equipa." }));
      alert(error.error ?? "Erro ao criar equipa.");
      return;
    }

    router.push("/backoffice/teams");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Criar equipa</h1>
      <p style={{ marginBottom: "1rem" }}>
        Preencha os dados para criar uma nova equipa.
      </p>
      <FormTeam handleSubmit={handleSubmit} />

      <Link
        href="/backoffice/teams"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </main>
  );
}

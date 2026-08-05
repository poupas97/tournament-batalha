"use client";

import FormTeam from "@/components/FormTeam";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import { ITeamFormValues } from "@/types/team";
import { useRouter } from "next/navigation";

export default function CreateTeamPage() {
  const router = useRouter();

  const { data, loading, error } = useGetState<CompetitionBEResponse[]>(
    "/api/backoffice/competitions",
  );

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
    <>
      <Title label="Criar equipa" back />

      {data && !loading && (
        <FormTeam handleSubmit={handleSubmit} competitions={data} />
      )}
    </>
  );
}

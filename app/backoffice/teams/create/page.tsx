"use client";

import FormTeam from "@/components/FormTeam";
import Title from "@/components/Title";
import { CompetitionBEResponse } from "@/types/competition";
import { ITeamFormValues } from "@/types/team";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateTeamPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<CompetitionBEResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/backoffice/competitions`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setCompetitions(data);
      })
      .catch(() => {
        alert("Erro ao carregar as competições.");
      })
      .finally(() => setLoading(false));
  }, []);

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

      {competitions && !loading && (
        <FormTeam handleSubmit={handleSubmit} competitions={competitions} />
      )}
    </>
  );
}

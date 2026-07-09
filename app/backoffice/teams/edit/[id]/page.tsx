"use client";

import FormTeam from "@/components/FormTeam";
import { ITeamFormValues, TeamBEResponse } from "@/types/team";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.id;
  const [team, setTeam] = useState<TeamBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    fetch(`/api/backoffice/teams/${teamId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setTeam(data);
      })
      .catch(() => {
        alert("Erro ao carregar a equipa.");
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  async function handleSubmit(values: ITeamFormValues) {
    const response = await fetch(`/api/backoffice/teams/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar equipa." }));
      alert(error.error ?? "Erro ao guardar equipa.");
      return;
    }

    router.push("/backoffice/teams");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Editar equipa</h1>
      <p style={{ marginBottom: "1rem" }}>
        Atualize os dados da equipa, jogadores e staff associados.
      </p>

      {loading && <p>A carregar equipa...</p>}

      {!loading && team && (
        <FormTeam initialValues={team} handleSubmit={handleSubmit} />
      )}

      <Link
        href="/backoffice/teams"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </main>
  );
}

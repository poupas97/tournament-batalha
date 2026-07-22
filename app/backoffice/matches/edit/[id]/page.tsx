"use client";

import FormMatch from "@/components/FormMatch";
import Title from "@/components/Title";
import { IMatchFormValues, MatchBEResponse } from "@/types/match";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id;
  const [match, setMatch] = useState<MatchBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;

    fetch(`/api/backoffice/matches/${matchId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setMatch(data);
      })
      .catch(() => {
        alert("Erro ao carregar a jogos.");
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  async function handleSubmit(values: IMatchFormValues) {
    const response = await fetch(`/api/backoffice/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar jogos." }));
      alert(error.error ?? "Erro ao guardar jogos.");
      return;
    }

    router.push("/backoffice/matches");
  }

  return (
    <>
      <Title label="Editar jogo" back />

      {loading && <p>A carregar jogo...</p>}

      {!loading && match && (
        <FormMatch initialValues={match} handleSubmit={handleSubmit} />
      )}
    </>
  );
}

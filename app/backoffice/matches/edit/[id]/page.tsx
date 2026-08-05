"use client";

import FormMatch from "@/components/FormMatch";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { IMatchFormValues, MatchBEResponse } from "@/types/match";
import { useParams, useRouter } from "next/navigation";

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id;

  const { data, loading, error } = useGetState<MatchBEResponse>(
    matchId ? `/api/backoffice/matches/${matchId}` : undefined,
  );

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
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && data && (
        <FormMatch initialValues={data} handleSubmit={handleSubmit} />
      )}
    </>
  );
}

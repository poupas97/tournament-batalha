"use client";

import FormMatch from "@/components/FormMatch";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { IMatchFormValues, MatchBEResponse } from "@/types/match";
import { Typography } from "@mui/material";
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
        .catch(() => ({ error: "Erro ao guardar jogos" }));
      alert(error.error ?? "Erro ao guardar jogos");
      return;
    }

    router.back();
  }

  return (
    <>
      <Title
        label="Editar jogo"
        description="Atualize a data, ronda e equipas deste jogo"
        back
      />

      {loading && <Typography variant="body1">A carregar jogo...</Typography>}
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}

      {!loading && data && (
        <FormMatch initialValues={data} handleSubmit={handleSubmit} />
      )}
    </>
  );
}

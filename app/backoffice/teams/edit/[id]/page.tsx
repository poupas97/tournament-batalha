"use client";

import FormTeam from "@/components/FormTeam";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import { ITeamFormValues, TeamBEResponse } from "@/types/team";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.id;

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
  } = useGetState<TeamBEResponse>(`/api/backoffice/teams/${teamId}`);

  const {
    data: competitionsData,
    loading: competitionsLoading,
    error: competitionsError,
  } = useGetState<CompetitionBEResponse[]>("/api/backoffice/competitions");

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
    <>
      <Title label="Editar equipa" back />

      {teamLoading && <p>A carregar equipa...</p>}
      {teamError && <p style={{ color: "crimson" }}>{teamError}</p>}

      {competitionsLoading && <p>A carregar competições...</p>}
      {competitionsError && (
        <p style={{ color: "crimson" }}>{competitionsError}</p>
      )}

      {!teamLoading && teamData && competitionsData && (
        <FormTeam
          initialValues={teamData}
          handleSubmit={handleSubmit}
          competitions={competitionsData}
        />
      )}
    </>
  );
}

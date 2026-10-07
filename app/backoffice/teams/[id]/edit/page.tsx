"use client";

import FormTeam from "@/components/FormTeam";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import { ITeamFormValues, TeamBEResponse } from "@/types/team";
import { Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

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
        .catch(() => ({ error: "Erro ao guardar equipa" }));
      alert(error.error ?? "Erro ao guardar equipa");
      return;
    }

    router.back();
  }

  return (
    <>
      <Title
        label="Editar equipa"
        description="Atualize os dados e a competição associada a esta equipa"
        back
      />

      {teamLoading && (
        <Typography variant="body1">A carregar equipa...</Typography>
      )}
      {teamError && (
        <Typography variant="body1" color="error">
          {teamError}
        </Typography>
      )}

      {competitionsLoading && (
        <Typography variant="body1">A carregar competições...</Typography>
      )}
      {competitionsError && (
        <Typography variant="body1" color="error">
          {competitionsError}
        </Typography>
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

"use client";

import FormCompetition from "@/components/FormCompetition";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import {
  CompetitionBEResponse,
  ICompetitionFormValues,
} from "@/types/competition";
import { Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

export default function EditCompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params?.id;

  const { data, loading, error } = useGetState<CompetitionBEResponse>(
    competitionId ? `/api/backoffice/competitions/${competitionId}` : undefined,
  );

  async function handleSubmit(values: ICompetitionFormValues) {
    const response = await fetch(
      `/api/backoffice/competitions/${competitionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
    );

    return { response, onSuccess: () => router.back() };
  }

  return (
    <>
      <Title
        label="Editar competição"
        description="Atualize as configurações e regras desta competição"
        back
      />

      {loading && (
        <Typography variant="body1">A carregar competição...</Typography>
      )}
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}

      {!loading && data && (
        <FormCompetition initialValues={data} onSubmit={handleSubmit} />
      )}
    </>
  );
}

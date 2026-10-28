"use client";

import Form from "@/components/Form";
import Title from "@/components/Title";
import { CompetitionStatus } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import { IPlayerEditValues, PlayerBEResponse } from "@/types/team";
import { Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params?.id;

  const { data, loading, error } = useGetState<PlayerBEResponse>(
    `/api/backoffice/players/${playerId}`,
  );

  async function handleSubmit(values: IPlayerEditValues) {
    const response = await fetch(`/api/backoffice/players/${playerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    return { response, onSuccess: () => router.back() };
  }

  const canEdit = data?.team.competition.status === CompetitionStatus.DRAFT;

  return (
    <>
      <Title
        label="Editar jogador"
        description="Atualize os dados deste jogador"
        back
      />

      {loading && <Typography>A carregar jogador...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {canEdit && (
        <Form<IPlayerEditValues>
          initialValues={data}
          fields={[
            { key: "photo", label: "Foto", type: "photo" },
            { key: "name", label: "Nome" },
            { key: "number", label: "Número", type: "number" },
          ]}
          onSubmit={handleSubmit}
        />
      )}

      {!loading && data && !canEdit && (
        <Typography color="text.secondary">
          Só é possível editar jogadores enquanto a competição está em rascunho.
        </Typography>
      )}
    </>
  );
}

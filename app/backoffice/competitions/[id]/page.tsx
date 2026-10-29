"use client";

import Detail from "@/components/Detail";
import Form from "@/components/Form";
import GridTable from "@/components/GridTable";
import { useModal } from "@/components/ModalProvider";
import Title from "@/components/Title";
import { CompetitionStatus } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import {
  getCompetitionConfigHint,
  getCompetitionStatusHint,
  getCompetitionOpponentsHint,
  getCompetitionQualifiedHint,
} from "@/lib/detailHints";
import {
  CompetitionBEResponse,
  ICompetitionFormValues,
} from "@/types/competition";
import { Alert, Button } from "@mui/material";
import TeamIdentity from "@/components/TeamIdentity";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ViewCompetitionPage() {
  const params = useParams();
  const competitionId = params?.id;
  const { openModal, closeModal } = useModal();
  const [actionError, setActionError] = useState("");
  const [actionPending, setActionPending] = useState(false);

  const { data, loading, error } = useGetState<CompetitionBEResponse>(
    `/api/backoffice/competitions/${competitionId}`,
  );
  const isDeleted = Boolean(data?.deletedAt);

  async function onShuffle(values: ICompetitionFormValues) {
    const response = await fetch(
      `/api/backoffice/competitions/${competitionId}/shuffle`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
    );
    return {
      response,
      onSuccess: () => {
        closeModal();
        window.location.reload();
      },
    };
  }

  async function handleChangeStatus(status: CompetitionStatus) {
    if (actionPending || !competitionId) return;
    setActionPending(true);
    setActionError("");
    try {
      const response = await fetch(
        `/api/backoffice/competitions/${competitionId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Erro ao alterar estado");
      }
      window.location.reload();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Erro ao alterar estado",
      );
    } finally {
      setActionPending(false);
    }
  }

  function openShuffleModal() {
    if (!data) {
      return;
    }

    openModal({
      title: "Confirmar sorteio",
      content: (
        <Form<ICompetitionFormValues>
          initialValues={data}
          entity="competitions"
          fields={[
            {
              key: "qualified",
              label: "Qualificados",
              hint: getCompetitionQualifiedHint,
            },
            {
              key: "opponents",
              label: "Oponentes",
              hint: getCompetitionOpponentsHint,
            },
          ]}
          vertical
          submitLabel="Confirmar sorteio"
          onSubmit={onShuffle}
        />
      ),
    });
  }

  return (
    <>
      <Title
        label="Ver competição"
        description="Consulte os dados, equipas e estado desta competição"
        back
        edit={
          data?.status === CompetitionStatus.DRAFT
            ? `/backoffice/competitions/${competitionId}/edit`
            : undefined
        }
      />
      <Detail<CompetitionBEResponse>
        loading={loading}
        error={error}
        data={data}
        fields={[
          { key: "name", label: "Nome" },
          { key: "startDate", label: "Data de início", format: "date" },
          {
            key: "config",
            label: "Configuração",
            hint: getCompetitionConfigHint,
          },
          {
            key: "qualified",
            label: "Qualificados",
            hint: getCompetitionQualifiedHint,
          },
          {
            key: "opponents",
            label: "Oponentes",
            hint: getCompetitionOpponentsHint,
          },
          {
            key: "status",
            label: "Estado",
            hint: getCompetitionStatusHint,
          },
          { key: "_count.teams", label: "Equipas" },
          { key: "color", label: "Cor", format: "color" },
          { key: "active", label: "Ativo", format: "boolean" },
        ]}
      />

      {actionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {actionError}
        </Alert>
      )}

      {data?.status === CompetitionStatus.DRAFT && !isDeleted && (
        <Button
          size="small"
          onClick={openShuffleModal}
          disabled={actionPending}
        >
          Rever e fazer sorteio
        </Button>
      )}
      {data?.status === CompetitionStatus.DRAWN && !isDeleted && (
        <Button
          size="small"
          onClick={() => handleChangeStatus(CompetitionStatus.IN_PROGRESS)}
          disabled={actionPending}
        >
          {actionPending ? "A guardar…" : "Iniciar competição"}
        </Button>
      )}
      {(data?.status === CompetitionStatus.DRAWN ||
        data?.status === CompetitionStatus.IN_PROGRESS) &&
        !isDeleted && (
          <Button href={`${competitionId}/shuffle`}>Ver sorteio</Button>
        )}

      <GridTable
        loading={loading}
        error={error}
        data={data?.teams}
        href={(it) => `/backoffice/teams/${it.id}`}
        notChangeRoute
        title={`Equipas (${data?.teams.length || 0})`}
        columns={[
          {
            key: "name",
            header: "Equipa",
            render: (team) => <TeamIdentity team={team} />,
          },
          { key: "_count.players", header: "Jogadores" },
          { key: "_count.staffs", header: "Staffs" },
        ]}
      />
    </>
  );
}

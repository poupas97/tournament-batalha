"use client";

import Detail from "@/components/Detail";
import Form from "@/components/Form";
import GridTable from "@/components/GridTable";
import { useModal } from "@/components/ModalProvider";
import Title from "@/components/Title";
import { CompetitionConfig, CompetitionStatus } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import {
  CompetitionBEResponse,
  ICompetitionFormValues,
} from "@/types/competition";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ViewCompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params?.id;
  const { openModal, closeModal } = useModal();

  const { data, loading, error } = useGetState<CompetitionBEResponse>(
    competitionId ? `/api/backoffice/competitions/${competitionId}` : undefined,
  );

  async function onShuffle(values: ICompetitionFormValues) {
    const response = await fetch(
      `/api/backoffice/competitions/${competitionId}/shuffle`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
    ).catch(() => null);

    const responseData = await response?.json().catch(() => null);

    if (!response?.ok || responseData?.error) {
      alert(responseData?.error ?? "Erro ao fazer sorteio.");
      return;
    }

    closeModal();
    alert("Sucesso");

    window.location.reload();
  }

  async function changeCompetitionStatus(status: CompetitionStatus) {
    const response = await fetch(
      `/api/backoffice/competitions/${competitionId}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    const responseData = await response.json().catch(() => null);

    if (!response.ok || responseData?.error) {
      alert(responseData?.error ?? "Erro ao alterar estado.");
      return;
    }

    window.location.reload();
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
          fields={[
            { key: "qualified", label: "Qualificados" },
            { key: "opponents", label: "Oponentes" },
          ]}
          onSubmit={onShuffle}
        />
      ),
    });
  }

  return (
    <>
      <Title
        label="Ver competição"
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
          { key: "_count.teams", label: "Equipas" },
          { key: "config", label: "Configuração" },
          { key: "qualified", label: "Qualificados" },
          { key: "opponents", label: "Oponentes" },
          { key: "active", label: "Ativo", format: "boolean" },
          { key: "status", label: "Estado" },
        ]}
      />
      <h4>Equipas</h4>
      <GridTable
        loading={loading}
        error={error}
        data={data?.teams}
        clickableRow={(it) => router.push(`/backoffice/teams/${it.id}`)}
        notChangeRoute
        columns={[
          { key: "name", header: "Nome" },
          { key: "_count.players", header: "Jogadores" },
          { key: "_count.staffs", header: "Staffs" },
        ]}
      />
      {data?.status === CompetitionStatus.DRAFT && (
        <button type="button" onClick={openShuffleModal}>
          Sorteio
        </button>
      )}
      {data?.status === CompetitionStatus.DRAWN && (
        <button
          type="button"
          onClick={() => changeCompetitionStatus(CompetitionStatus.IN_PROGRESS)}
        >
          Iniciar competição
        </button>
      )}
      {data?.status === CompetitionStatus.IN_PROGRESS && (
        <button
          type="button"
          onClick={() => changeCompetitionStatus(CompetitionStatus.FINISHED)}
        >
          Finalizar competição
        </button>
      )}

      <Link href={`${competitionId}/shuffle`} style={{ color: "#0366d6" }}>
        Ver sorteio
      </Link>
    </>
  );
}

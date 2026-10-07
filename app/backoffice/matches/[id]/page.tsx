"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import Form from "@/components/Form";
import MatchEventGrid from "@/components/MatchEventGrid";
import { useModal } from "@/components/ModalProvider";
import Title from "@/components/Title";
import { MatchEvent, MatchEventType, MatchStatus } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import { canTransition } from "@/lib/match";
import {
  getMatchStatusHint,
  getMatchOpponentsHint,
  getMatchQualifiedHint,
  getMatchCompetitionConfigHint,
} from "@/lib/detailHints";
import { MatchBEResponse } from "@/types/match";
import { IMatchEventFormValues } from "@/types/match-event";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, Typography } from "@mui/material";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;

  const { data, loading, error, setData } = useGetState<MatchBEResponse>(
    `/api/backoffice/matches/${matchId}`,
  );
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { openModal, closeModal } = useModal();

  const handleChangeStatus = async (status: MatchStatus) => {
    if (updatingStatus) return;

    setUpdatingStatus(true);

    try {
      const response = await fetch(
        `/api/backoffice/matches/${matchId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      const responseData = (await response
        .json()
        .catch(() => null)) as MatchBEResponse | null;

      if (!response.ok || !responseData) {
        alert("Erro ao guardar o status");
        return;
      }

      setData(responseData);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddEvent =
    (key: "playerId" | "staffId", id: number, teamId: number) =>
    async (values: IMatchEventFormValues) => {
      const response = await fetch("/api/backoffice/match-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, teamId, matchId, [key]: id }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response?.ok || responseData?.error) {
        alert(responseData?.error ?? "Erro ao guardar evento");
        return;
      }

      setData((prev) =>
        prev
          ? { ...prev, events: [responseData, ...(prev.events || [])] }
          : prev,
      );

      closeModal();
    };

  const addStaffMatchEvent = (staffId: number, teamId: number) => () => {
    openModal({
      title: "Adicionar evento",
      content: (
        <Form<IMatchEventFormValues>
          fields={[
            {
              key: "type",
              label: "Tipo",
              type: "select",
              options: [
                MatchEventType.YELLOW_CARD,
                MatchEventType.RED_CARD,
              ].map((it) => ({ label: it, value: it })),
            },
            { key: "minute", label: "Minuto" },
          ]}
          vertical
          onSubmit={handleAddEvent("staffId", staffId, teamId)}
        />
      ),
    });
  };

  const handleRemoveEvent = async (matchEvent: MatchEvent) => {
    const response = await fetch(
      `/api/backoffice/match-events/${matchEvent.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao remover evento" }));
      alert(error.error ?? "Erro ao remover evento");
      return;
    }

    setData((prev) =>
      prev
        ? {
            ...prev,
            events: prev.events?.filter((it) => it.id !== matchEvent.id),
          }
        : prev,
    );
  };

  const addPlayerMatchEvent = (playerId: number, teamId: number) => () => {
    openModal({
      title: "Adicionar evento",
      content: (
        <Form<IMatchEventFormValues>
          fields={[
            {
              key: "type",
              label: "Tipo",
              type: "select",
              options: Object.keys(MatchEventType).map((it) => ({
                label: it,
                value: it,
              })),
            },
            { key: "minute", label: "Minuto" },
          ]}
          vertical
          onSubmit={handleAddEvent("playerId", playerId, teamId)}
        />
      ),
    });
  };

  return (
    <>
      <Title
        label="Ver jogo"
        description="Consulte os detalhes, estado e eventos registados neste jogo"
        back
        edit={
          data?.status === MatchStatus.SCHEDULED ||
          data?.status === MatchStatus.POSTPONED
            ? `/backoffice/matches/${matchId}/edit`
            : undefined
        }
      />

      <Detail<MatchBEResponse>
        loading={loading}
        error={error}
        data={data}
        fields={[
          { key: "competition.name", label: "Competição" },
          {
            key: "competition.config",
            label: "Configuração",
            hint: getMatchCompetitionConfigHint,
          },
          {
            key: "competition.opponents",
            label: "Oponentes",
            hint: getMatchOpponentsHint,
          },
          {
            key: "competition.qualified",
            label: "Qualificados",
            hint: getMatchQualifiedHint,
          },
          { key: "date", label: "Data", format: "date" },
          { key: "round", label: "Ronda" },
          { key: "homeTeam.name", label: "Equipa da Casa" },
          { key: "awayTeam.name", label: "Equipa Visitante" },
          {
            key: "status",
            label: "Estado",
            hint: getMatchStatusHint,
          },
        ]}
      />

      <Typography variant="h6">Mudar o estado do jogo</Typography>
      {data && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1rem",
          }}
        >
          {Object.values(MatchStatus)
            .filter((status) => canTransition(data, status))
            .map((status) => (
              <Button
                key={status}
                variant="contained"
                disabled={
                  updatingStatus || !data.homeTeamId || !data.awayTeamId
                }
                onClick={() => handleChangeStatus(status)}
              >
                {status}
              </Button>
            ))}
        </div>
      )}

      {data && (
        <div style={{ display: "flex", gap: "2rem" }}>
          <MatchEventGrid
            team={data.homeTeam}
            addPlayerMatchEvent={addPlayerMatchEvent}
            addStaffMatchEvent={addStaffMatchEvent}
          />
          <MatchEventGrid
            team={data.awayTeam}
            addPlayerMatchEvent={addPlayerMatchEvent}
            addStaffMatchEvent={addStaffMatchEvent}
          />
        </div>
      )}

      <Typography variant="h6">Eventos de jogo</Typography>
      <DataTable
        data={data?.events || []}
        columns={[
          { key: "type", header: "Tipo" },
          { key: "minute", header: "Minuto" },
          { key: "player.name", header: "Jogador" },
          { key: "staff.name", header: "Staff" },
          { key: "team.name", header: "Equipa" },
          {
            key: "actions",
            header: "Ações",
            render: (it) => (
              <Button onClick={() => handleRemoveEvent(it)} color="error">
                Remover
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}

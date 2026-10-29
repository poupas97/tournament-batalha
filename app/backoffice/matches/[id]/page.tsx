"use client";

import Detail from "@/components/Detail";
import Form from "@/components/Form";
import MatchEventGrid from "@/components/MatchEventGrid";
import { useModal } from "@/components/ModalProvider";
import Title from "@/components/Title";
import { MatchEventType, MatchStatus } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import { canTransition, getMatchScore, isMatchFinished } from "@/lib/match";
import { getAvailableMatchEventTypes } from "@/lib/matchEvents";
import {
  getCompetitionQualifiedHint,
  getMatchStatusHint,
  getMatchOpponentsHint,
  getMatchCompetitionConfigHint,
} from "@/lib/detailHints";
import { MatchBEResponse } from "@/types/match";
import {
  IMatchEventFormValues,
  MatchEventBEResponse,
} from "@/types/match-event";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Alert, Box, Button, Grid, Typography } from "@mui/material";
import MatchEventsTable from "@/components/MatchEventsTable";
import PhotoAvatar from "@/components/PhotoAvatar";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;

  const { data, loading, error, setData } = useGetState<MatchBEResponse>(
    `/api/backoffice/matches/${matchId}`,
  );
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState("");

  const { openModal, closeModal } = useModal();

  const handleChangeStatus = async (status: MatchStatus) => {
    if (updatingStatus) return;

    setUpdatingStatus(true);
    setActionError("");

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
        setActionError("Erro ao guardar o estado do jogo.");
        return;
      }

      setData(responseData);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Erro ao guardar o estado do jogo.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddEvent =
    (key: "playerId" | "staffId", id: number, teamId: number) =>
    async (values: IMatchEventFormValues) => {
      if (!data || isMatchFinished(data.status)) return;

      const response = await fetch("/api/backoffice/match-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, teamId, matchId, [key]: id }),
      });

      if (!response.ok) return { response };

      const responseData = await response.json();

      setData((prev) =>
        prev
          ? { ...prev, events: [responseData, ...(prev.events || [])] }
          : prev,
      );

      return { response, onSuccess: closeModal };
    };

  const addStaffMatchEvent = (staffId: number, teamId: number) => () => {
    if (!data || isMatchFinished(data.status)) return;

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

  const onRemoveMatchEvent = async (matchEvent: MatchEventBEResponse) => {
    if (!data || isMatchFinished(data.status)) return;

    const response = await fetch(
      `/api/backoffice/match-events/${matchEvent.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      setActionError("Não foi possível remover o evento.");
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
    if (!data || isMatchFinished(data.status)) return;

    openModal({
      title: "Adicionar evento",
      content: (
        <Form<IMatchEventFormValues>
          fields={[
            {
              key: "type",
              label: "Tipo",
              type: "select",
              options: getAvailableMatchEventTypes(
                data?.status ?? MatchStatus.SCHEDULED,
              ).map((it) => ({ label: it, value: it })),
            },
            { key: "minute", label: "Minuto" },
          ]}
          vertical
          onSubmit={handleAddEvent("playerId", playerId, teamId)}
        />
      ),
    });
  };

  const { homeGoals, awayGoals } = getMatchScore(data);

  return (
    <>
      <Title
        label="Ver jogo"
        description="Consulte os detalhes, estado e eventos registados neste jogo"
        back
        edit={
          data &&
          (data.deletedAt ||
            data.competition.deletedAt ||
            data.status === MatchStatus.SCHEDULED ||
            data.status === MatchStatus.POSTPONED)
            ? `/backoffice/matches/${matchId}/edit`
            : undefined
        }
      />
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

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
            hint: getCompetitionQualifiedHint,
          },
          { key: "date", label: "Data", format: "datetime" },
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

      {data?.homeTeam?.name && data?.awayTeam?.name && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <PhotoAvatar
              photo={data.homeTeam.photo}
              alt={`Logo de ${data.homeTeam.name}`}
              size="large"
            />
            <Typography
              variant="h6"
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: "right",
                overflowWrap: "anywhere",
              }}
            >
              {data.homeTeam.name}
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="h5">
              {homeGoals} - {awayGoals}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 1,
            }}
          >
            <PhotoAvatar
              photo={data.awayTeam.photo}
              alt={`Logo de ${data.awayTeam.name}`}
              size="large"
            />
            <Typography
              variant="h6"
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: "left",
                overflowWrap: "anywhere",
              }}
            >
              {data.awayTeam.name}
            </Typography>
          </Box>
        </Box>
      )}

      {data && !data.deletedAt && (
        <>
          <Typography variant="h6">Mudar o estado do jogo</Typography>
          <Grid container spacing={2}>
            {Object.values(MatchStatus)
              .filter((status) => canTransition(data, status))
              .map((status) => (
                <Grid key={status} size={{ xs: 12, sm: 6, md: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={
                      updatingStatus || !data.homeTeamId || !data.awayTeamId
                    }
                    onClick={() => handleChangeStatus(status)}
                  >
                    {updatingStatus ? "A guardar…" : status}
                  </Button>
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {data && !data.deletedAt && !isMatchFinished(data.status) && (
        <Box style={{ display: "flex", gap: "2rem" }}>
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
        </Box>
      )}

      <MatchEventsTable
        data={data}
        onRemoveMatchEvent={
          data && !data.deletedAt && !isMatchFinished(data.status)
            ? onRemoveMatchEvent
            : undefined
        }
        isBackoffice
      />
    </>
  );
}

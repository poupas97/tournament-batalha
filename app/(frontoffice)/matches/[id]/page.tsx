"use client";

import Detail from "@/components/Detail";
import MatchEventsTable from "@/components/MatchEventsTable";
import PhotoAvatar from "@/components/PhotoAvatar";
import Title from "@/components/Title";
import { SocketEvents } from "@/enums/socket";
import useGetState from "@/hooks/useGetState";
import {
  getCompetitionQualifiedHint,
  getMatchCompetitionConfigHint,
  getMatchOpponentsHint,
  getMatchStatusHint,
} from "@/lib/detailHints";
import { getMatchScore } from "@/lib/match";
import {
  dispatchSocketMessage,
  getSocket,
  onSocket,
  sendSocketMessage,
} from "@/lib/websocket";
import { MatchBEResponse } from "@/types/match";
import {
  NotifyAddMatchEvent,
  NotifyMatchStatus,
  NotifyRemoveMatchEvent,
} from "@/types/socket";
import { Box, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;

  const { data, loading, error, setData } = useGetState<MatchBEResponse>(
    matchId ? `/api/matches/${matchId}` : undefined,
  );

  useEffect(() => {
    if (!matchId) return;

    const socket = getSocket();
    const onMessage = (event: MessageEvent) => dispatchSocketMessage(event);
    socket.addEventListener("message", onMessage);
    const cancelJoin = sendSocketMessage({ type: SocketEvents.JOIN, matchId });

    const offStatus = onSocket(SocketEvents.MATCH_STATUS, (payload) => {
      setData({ status: (payload as NotifyMatchStatus).status });
    });

    const offAdd = onSocket(SocketEvents.ADD_MATCH_EVENT, (payload) => {
      const event = payload as NotifyAddMatchEvent;
      setData((current) =>
        current
          ? { ...current, events: [event, ...(current.events || [])] }
          : undefined,
      );
    });

    const offRemove = onSocket(SocketEvents.REMOVE_MATCH_EVENT, (payload) => {
      const { id } = payload as NotifyRemoveMatchEvent;
      setData((current) =>
        current
          ? {
              ...current,
              events: current.events?.filter((it) => it.id !== id),
            }
          : undefined,
      );
    });

    return () => {
      cancelJoin();

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: SocketEvents.LEAVE }));
      }

      socket.removeEventListener("message", onMessage);

      offStatus();
      offAdd();
      offRemove();
    };
  }, [matchId]);

  const { homeGoals, awayGoals } = getMatchScore(data);

  return (
    <>
      <Title label="Ver Jogo" back />

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
          { key: "status", label: "Estado", hint: getMatchStatusHint },
        ]}
      />

      {data?.homeTeam?.name && data.awayTeam?.name && (
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
              flexDirection: { xs: "column", sm: "row-reverse" },
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-end" },
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
                flex: { xs: "0 0 auto", sm: 1 },
                minWidth: 0,
                width: { xs: "100%", sm: "auto" },
                textAlign: { xs: "center", sm: "right" },
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
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-start" },
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
                flex: { xs: "0 0 auto", sm: 1 },
                minWidth: 0,
                width: { xs: "100%", sm: "auto" },
                textAlign: { xs: "center", sm: "left" },
                overflowWrap: "anywhere",
              }}
            >
              {data.awayTeam.name}
            </Typography>
          </Box>
        </Box>
      )}

      {!loading && <MatchEventsTable data={data} />}
    </>
  );
}

"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import {
  dispatchSocketMessage,
  getSocket,
  onSocket,
  sendSocketMessage,
} from "@/lib/websocket";
import { MatchBEResponse } from "@/types/match";
import { SocketEvents } from "@/enums/socket";
import {
  getMatchCompetitionConfigHint,
  getMatchStatusHint,
  getMatchOpponentsHint,
  getMatchQualifiedHint,
} from "@/lib/detailHints";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  NotifyAddMatchEvent,
  NotifyMatchStatus,
  NotifyRemoveMatchEvent,
} from "@/types/socket";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { Typography } from "@mui/material";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;

  const { data, loading, error, setData } = useGetState<MatchBEResponse>(
    matchId ? `/api/matches/${matchId}` : undefined,
  );

  useEffect(() => {
    const socket = getSocket();

    const onMessage = (event: MessageEvent) => {
      dispatchSocketMessage(event);
    };

    socket.addEventListener("message", onMessage);
    const cancelJoin = sendSocketMessage({ type: SocketEvents.JOIN, matchId });

    const offStatus = onSocket(SocketEvents.MATCH_STATUS, (payload) => {
      const { status } = payload as NotifyMatchStatus;

      setData({ status });
    });

    const offAdd = onSocket(SocketEvents.ADD_MATCH_EVENT, (payload) => {
      const event = payload as NotifyAddMatchEvent;

      setData((current) => {
        if (!current) return undefined;

        return {
          ...current,
          events: [event, ...(current?.events || [])],
        };
      });
    });

    const offRemove = onSocket(SocketEvents.REMOVE_MATCH_EVENT, (payload) => {
      const { id } = payload as NotifyRemoveMatchEvent;

      setData((current) => {
        if (!current) return undefined;

        return {
          ...current,
          events: current.events?.filter((it) => it.id !== id),
        };
      });
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

      <Typography variant="h6">Eventos de jogo</Typography>
      <DataTable
        // loading={loading}
        // error={error}
        data={data?.events || []}
        columns={[
          { key: "type", header: "Tipo" },
          { key: "minute", header: "Minuto" },
          { key: "player.name", header: "Jogador" },
          { key: "staff.name", header: "Staff" },
          { key: "team.name", header: "Equipa" },
        ]}
      />
    </>
  );
}

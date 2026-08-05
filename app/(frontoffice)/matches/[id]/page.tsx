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
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  NotifyAddMatchEvent,
  NotifyMatchStatus,
  NotifyRemoveMatchEvent,
} from "@/types/socket";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";

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
        if (!current) return null;

        return {
          ...current,
          events: [event, ...(current?.events || [])],
        };
      });
    });

    const offRemove = onSocket(SocketEvents.REMOVE_MATCH_EVENT, (payload) => {
      const { id } = payload as NotifyRemoveMatchEvent;

      setData((current) => {
        if (!current) return null;

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

      {loading && <p>A carregar jogo...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && data && (
        <>
          <Detail<MatchBEResponse>
            data={data}
            fields={[
              { key: "competition.name", label: "Competição" },
              { key: "competition.config", label: "Configuração" },
              { key: "competition.opponents", label: "Oponentes" },
              { key: "competition.qualified", label: "Qualificados" },
              { key: "date", label: "Data", format: "date" },
              { key: "round", label: "Ronda" },
              { key: "homeTeam.name", label: "Equipa da Casa" },
              { key: "awayTeam.name", label: "Equipa Visitante" },
              { key: "status", label: "Estado" },
            ]}
          />

          <h3>Tabela de Eventos</h3>
          {data.events && (
            <DataTable
              data={data.events}
              columns={[
                { key: "type", header: "Tipo" },
                { key: "minute", header: "Minuto" },
                { key: "player.name", header: "Jogador" },
                { key: "staff.name", header: "Staff" },
                { key: "team.name", header: "Equipa" },
              ]}
            />
          )}
        </>
      )}
    </>
  );
}

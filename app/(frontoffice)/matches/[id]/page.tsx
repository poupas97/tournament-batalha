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
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  NotifyAddMatchEvent,
  NotifyMatchStatus,
  NotifyRemoveMatchEvent,
} from "@/types/socket";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;
  const [match, setMatch] = useState<MatchBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatch = () => {
      if (!matchId) return;

      fetch(`/api/matches/${matchId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
            return;
          }
          setMatch(data);
        })
        .catch(() => {
          alert("Erro ao carregar o jogo.");
        })
        .finally(() => setLoading(false));
    };

    loadMatch();
  }, [matchId]);

  useEffect(() => {
    const socket = getSocket();

    const onMessage = (event: MessageEvent) => {
      dispatchSocketMessage(event);
    };

    socket.addEventListener("message", onMessage);
    const cancelJoin = sendSocketMessage({ type: SocketEvents.JOIN, matchId });

    const offStatus = onSocket(SocketEvents.MATCH_STATUS, (payload) => {
      const { status } = payload as NotifyMatchStatus;

      setMatch((current) => (current ? { ...current, status } : null));
    });

    const offAdd = onSocket(SocketEvents.ADD_MATCH_EVENT, (payload) => {
      const event = payload as NotifyAddMatchEvent;

      setMatch((current) => {
        if (!current) return null;

        return {
          ...current,
          events: [event, ...(current?.events || [])],
        };
      });
    });

    const offRemove = onSocket(SocketEvents.REMOVE_MATCH_EVENT, (payload) => {
      const { id } = payload as NotifyRemoveMatchEvent;

      setMatch((current) => {
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
      <h1>Ver Jogo</h1>

      {loading && <p>A carregar jogo...</p>}

      {!loading && match && (
        <>
          <Detail<MatchBEResponse>
            data={match}
            fields={[
              { key: "competition.name", label: "Competição" },
              { key: "date", label: "Data", format: "date" },
              { key: "round", label: "Ronda" },
              { key: "homeTeam.name", label: "Equipa da Casa" },
              { key: "awayTeam.name", label: "Equipa Visitante" },
              { key: "status", label: "Estado" },
            ]}
          />

          <h3>Tabela de Eventos</h3>
          {match.events && (
            <DataTable
              data={match.events}
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

      <Link
        href="/matches"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </>
  );
}

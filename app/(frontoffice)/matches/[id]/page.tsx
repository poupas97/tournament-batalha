"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import { getSocket } from "@/lib/websocket";
import { MatchBEResponse } from "@/types/match";
import { SocketEvents } from "@/enums/socket";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MatchStatus } from "@/generated/prisma";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;
  const [match, setMatch] = useState<MatchBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMatch = useCallback(() => {
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
  }, [matchId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  useEffect(() => {
    const socket = getSocket();

    const onOpen = () => {
      socket.send(JSON.stringify({ type: SocketEvents.JOIN, matchId }));
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case SocketEvents.MATCH_STATUS:
            if (!message.payload.status) break;
            const status = message.payload.status as MatchStatus;

            setMatch((current) => (current ? { ...current, status } : null));

            break;
        }
      } catch (error) {
        console.error("Socket message error", error);
      }
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("message", onMessage);

    return () => {
      socket.send(JSON.stringify({ type: SocketEvents.LEAVE }));

      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("message", onMessage);
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
              { key: "date", label: "Data" },
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

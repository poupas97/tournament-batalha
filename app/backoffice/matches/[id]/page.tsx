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
import { MatchBEResponse } from "@/types/match";
import { IMatchEventFormValues } from "@/types/match-event";
import { useParams } from "next/navigation";

export default function ViewMatchPage() {
  const params = useParams();
  const matchId = params?.id;

  const { data, loading, error, setData } = useGetState<MatchBEResponse>(
    `/api/backoffice/matches/${matchId}`,
  );

  const { openModal, closeModal } = useModal();

  const handleChangeStatus = async (status: MatchStatus) => {
    const response = await fetch(`/api/backoffice/matches/${matchId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const responseData = (await response
      .json()
      .catch(() => null)) as MatchBEResponse | null;

    if (!responseData) {
      alert("Erro ao guardar o status.");
      return;
    }

    setData((prev) => (prev ? { ...prev, ...responseData } : prev));
  };

  const handleAddEvent =
    (key: "playerId" | "staffId", id: number, teamId: number) =>
    async (values: IMatchEventFormValues) => {
      const response = await fetch("/api/backoffice/match-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, teamId, matchId, [key]: id }),
      });

      const responseData = (await response
        .json()
        .catch(() => null)) as MatchEvent | null;

      if (!responseData) {
        alert("Erro ao guardar evento.");
        return;
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              events: [responseData, ...(prev.events || []), responseData],
            }
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
        .catch(() => ({ error: "Erro ao remover evento." }));
      alert(error.error ?? "Erro ao remover evento.");
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
          onSubmit={handleAddEvent("playerId", playerId, teamId)}
        />
      ),
    });
  };

  return (
    <>
      <Title label="Ver jogo" back />

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

          <h3>Estado do jogo</h3>
          <div
            style={{
              flex: 2,
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 16,
            }}
          >
            {Object.values(MatchStatus).map((status) => (
              <button
                key={status}
                disabled={!canTransition(data.status, status)}
                onClick={() => handleChangeStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

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
                {
                  key: "actions",
                  header: "Ações",
                  render: (it) => (
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(it)}
                      style={{
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        color: "crimson",
                        cursor: "pointer",
                      }}
                    >
                      Remover
                    </button>
                  ),
                },
              ]}
            />
          )}
        </>
      )}
    </>
  );
}

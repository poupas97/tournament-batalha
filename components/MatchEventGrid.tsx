"use client";

import Form from "@/components/Form";
import { useModal } from "@/components/ModalProvider";
import { MatchEventType } from "@/generated/prisma";
import { MatchBEResponse } from "@/types/match";
import { IMatchEventFormValues } from "@/types/match-event";

type MatchEventGridProps = {
  matchId: string;
  team: MatchBEResponse["homeTeam"] | MatchBEResponse["awayTeam"];
};

export default function MatchEventGrid({ team, matchId }: MatchEventGridProps) {
  const { openModal, closeModal } = useModal();

  const handleAddEvent =
    (key: "playerId" | "staffId", id: number) =>
    async (values: IMatchEventFormValues) => {
      const response = await fetch("/api/backoffice/match-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          teamId: team?.id,
          matchId,
          [key]: id,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Erro ao guardar evento." }));
        alert(error.error ?? "Erro ao guardar evento.");
        return;
      }

      closeModal();
    };

  const addPlayerMatchEventModal = (playerId: number) => () => {
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
          onSubmit={handleAddEvent("playerId", playerId)}
        />
      ),
    });
  };

  const addStaffMatchEventModal = (staffId: number) => () => {
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
              ].map((it) => ({
                label: it,
                value: it,
              })),
            },
            { key: "minute", label: "Minuto" },
          ]}
          onSubmit={handleAddEvent("staffId", staffId)}
        />
      ),
    });
  };

  return (
    <div
      style={{
        flex: 2,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
      }}
    >
      {team?.players.map((it) => (
        <div
          key={it.id}
          onClick={addPlayerMatchEventModal(it.id)}
          style={{
            cursor: "pointer",
            border: "1px solid black",
            backgroundColor: "aqua",
          }}
        >
          {it.name}
        </div>
      ))}
      {team?.staffs.map((it) => (
        <div
          key={it.id}
          onClick={addStaffMatchEventModal(it.id)}
          style={{
            cursor: "pointer",
            border: "1px solid black",
            backgroundColor: "greenyellow",
          }}
        >
          {it.name}
        </div>
      ))}
    </div>
  );
}

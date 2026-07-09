"use client";

import { useBackofficeModal } from "@/components/BackofficeModalProvider";
import DataTable from "@/components/DataTable";
import Form from "@/components/Form";
import { IPlayerDraft, ITeamFormValues } from "@/types/team";
import { useState } from "react";

type FormTeamProps = {
  initialValues?: ITeamFormValues;
  handleSubmit: (values: ITeamFormValues) => Promise<void>;
};

export default function FormTeam({
  initialValues,
  handleSubmit,
}: FormTeamProps) {
  const { openModal, closeModal } = useBackofficeModal();
  const [players, setPlayers] = useState<IPlayerDraft[]>(
    initialValues?.players || [],
  );

  function onSubmit(values: ITeamFormValues) {
    handleSubmit({ ...values, players });
  }

  function handleAddPlayer(values: IPlayerDraft) {
    const name = values.name.trim();
    const number = values.number.trim();

    if (!name || !number) {
      alert("Por favor, preencha todos os campos do jogador.");
      return;
    }

    setPlayers((current) => [...current, { id: Date.now(), name, number }]);
    closeModal();
  }

  function handleEditPlayer(player: IPlayerDraft) {
    const index = players.findIndex((it) => it.id === player.id);

    if (index === -1) {
      alert("Jogador não encontrado.");
      return;
    }

    const next = [...players];
    next.splice(index, 1, player);

    setPlayers(next);
    closeModal();
  }

  function removePlayer(player: IPlayerDraft) {
    setPlayers((current) => current.filter((it) => it.id !== player.id));
  }

  const openPlayerModal = (player?: IPlayerDraft) => () => {
    openModal({
      title: player ? "Editar jogador" : "Adicionar jogador",
      content: (
        <Form<IPlayerDraft>
          initialValues={player}
          fields={[
            { key: "name", label: "Nome" },
            { key: "number", label: "Nº" },
          ]}
          onSubmit={player ? handleEditPlayer : handleAddPlayer}
        />
      ),
    });
  };

  return (
    <Form<ITeamFormValues>
      initialValues={initialValues}
      fields={[{ key: "name", label: "Nome da equipa" }]}
      onSubmit={onSubmit}
    >
      <h5>Jogadores</h5>
      <button
        type="button"
        onClick={openPlayerModal()}
        style={{
          padding: "0.6rem 1rem",
          border: "none",
          borderRadius: "6px",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Adicionar
      </button>

      <DataTable
        data={players}
        columns={[
          { key: "name", header: "Nome" },
          { key: "number", header: "Nº" },
          {
            key: "actions",
            header: "Ações",
            render: (it) => (
              <>
                <button
                  type="button"
                  onClick={openPlayerModal(it)}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: "dimgrey",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => removePlayer(it)}
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
              </>
            ),
          },
        ]}
      />
    </Form>
  );
}

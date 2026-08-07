"use client";

import { useModal } from "@/components/ModalProvider";
import DataTable from "@/components/DataTable";
import Form from "@/components/Form";
import {
  IPlayerFormValues,
  IStaffFormValues,
  ITeamFormValues,
} from "@/types/team";
import { useState } from "react";
import { CompetitionBEResponse } from "@/types/competition";

type FormTeamProps = {
  initialValues?: ITeamFormValues;
  handleSubmit: (values: ITeamFormValues) => Promise<void>;
  competitions: CompetitionBEResponse[];
};

export default function FormTeam({
  initialValues,
  handleSubmit,
  competitions,
}: FormTeamProps) {
  const { openModal, closeModal } = useModal();
  const [players, setPlayers] = useState<IPlayerFormValues[]>(
    initialValues?.players || [],
  );
  const [staffs, setStaffs] = useState<IStaffFormValues[]>(
    initialValues?.staffs || [],
  );

  function onSubmit(values: ITeamFormValues) {
    handleSubmit({ ...values, players, staffs });
  }

  function handleAddPlayer(values: IPlayerFormValues) {
    const name = values.name.trim();
    const number = values.number.trim();

    if (!name || !number) {
      alert("Por favor, preencha todos os campos do jogador.");
      return;
    }

    setPlayers((current) => [...current, { id: Date.now(), name, number }]);
    closeModal();
  }

  function handleEditPlayer(player: IPlayerFormValues) {
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

  function removePlayer(player: IPlayerFormValues) {
    setPlayers((current) => current.filter((it) => it.id !== player.id));
  }

  const openPlayerModal = (player?: IPlayerFormValues) => () => {
    openModal({
      title: player ? "Editar jogador" : "Adicionar jogador",
      content: (
        <Form<IPlayerFormValues>
          initialValues={player}
          fields={[
            { key: "name", label: "Nome" },
            { key: "number", label: "Nº" },
          ]}
          onSubmit={player ? handleEditPlayer : handleAddPlayer}
          vertical
        />
      ),
    });
  };

  function handleAddStaff(values: IStaffFormValues) {
    const name = values.name.trim();

    if (!name) {
      alert("Por favor, preencha todos os campos do staff.");
      return;
    }

    setStaffs((current) => [...current, { id: Date.now(), name }]);
    closeModal();
  }

  function handleEditStaff(staff: IStaffFormValues) {
    const index = staffs.findIndex((it) => it.id === staff.id);

    if (index === -1) {
      alert("Staff não encontrado.");
      return;
    }

    const next = [...staffs];
    next.splice(index, 1, staff);

    setStaffs(next);
    closeModal();
  }

  function removeStaff(staff: IStaffFormValues) {
    setStaffs((current) => current.filter((it) => it.id !== staff.id));
  }

  const openStaffModal = (staff?: IStaffFormValues) => () => {
    openModal({
      title: staff ? "Editar staff" : "Adicionar staff",
      content: (
        <Form<IStaffFormValues>
          initialValues={staff}
          fields={[{ key: "name", label: "Nome" }]}
          onSubmit={staff ? handleEditStaff : handleAddStaff}
          vertical
        />
      ),
    });
  };

  return (
    <Form<ITeamFormValues>
      initialValues={initialValues}
      fields={[
        { key: "name", label: "Nome" },
        {
          key: "competitionId",
          label: "Competição",
          type: "select",
          options: competitions.map((c) => ({ value: c.id, label: c.name })),
        },
      ]}
      onSubmit={onSubmit}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <h3>Jogadores</h3>
        <button type="button" onClick={openPlayerModal()}>
          Adicionar
        </button>
      </div>

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

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <h3>Staff</h3>
        <button type="button" onClick={openStaffModal()}>
          Adicionar
        </button>
      </div>

      <DataTable
        data={staffs}
        columns={[
          { key: "name", header: "Nome" },
          {
            key: "actions",
            header: "Ações",
            render: (it) => (
              <>
                <button
                  type="button"
                  onClick={openStaffModal(it)}
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
                  onClick={() => removeStaff(it)}
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

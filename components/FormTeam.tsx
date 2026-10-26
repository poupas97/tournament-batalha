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
import { Button, Typography } from "@mui/material";
import { PLAYER_NUMBER_MAX, PLAYER_NUMBER_MIN } from "@/constants/validation";
import PlayerIdentity from "@/components/PlayerIdentity";
import StaffIdentity from "@/components/StaffIdentity";

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
    const number = Number(values.number);
    const photo = values.photo;

    if (
      !name ||
      !Number.isInteger(number) ||
      number < PLAYER_NUMBER_MIN ||
      number > PLAYER_NUMBER_MAX
    ) {
      alert("Por favor, preencha todos os campos do jogador");
      return;
    }

    setPlayers((current) => [
      ...current,
      { id: Date.now(), name, number, photo },
    ]);
    closeModal();
  }

  function handleEditPlayer(player: IPlayerFormValues) {
    const index = players.findIndex((it) => it.id === player.id);

    if (index === -1) {
      alert("Jogador não encontrado");
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
            { key: "photo", label: "Foto", type: "photo" },
            { key: "name", label: "Nome" },
            { key: "number", label: "Nº", type: "number" },
          ]}
          onSubmit={player ? handleEditPlayer : handleAddPlayer}
          vertical
        />
      ),
    });
  };

  function handleAddStaff(values: IStaffFormValues) {
    const name = values.name.trim();
    const photo = values.photo;

    if (!name) {
      alert("Por favor, preencha todos os campos do staff");
      return;
    }

    setStaffs((current) => [...current, { id: Date.now(), name, photo }]);
    closeModal();
  }

  function handleEditStaff(staff: IStaffFormValues) {
    const index = staffs.findIndex((it) => it.id === staff.id);

    if (index === -1) {
      alert("Staff não encontrado");
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
          fields={[
            { key: "photo", label: "Foto", type: "photo" },
            { key: "name", label: "Nome" },
          ]}
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
        { key: "photo", label: "Logo", type: "photo" },
        { key: "name", label: "Nome" },
        {
          key: "pot",
          label: "Pote",
          type: "number",
          hint: "Use 1 para as equipas mais fortes",
        },
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
        <Typography variant="h6">Jogadores ({players.length || 0})</Typography>
        <Button variant="outlined" onClick={openPlayerModal()}>
          + Adicionar
        </Button>
      </div>

      <DataTable
        data={players}
        columns={[
          {
            key: "name",
            header: "Jogador",
            render: (it) => <PlayerIdentity player={it} />,
          },
          { key: "number", header: "Nº" },
          {
            key: "actions",
            header: "Ações",
            render: (it) => (
              <>
                <Button onClick={openPlayerModal(it)}>Editar</Button>
                <Button onClick={() => removePlayer(it)} color="error">
                  Remover
                </Button>
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
        <Typography variant="h6">Staffs ({staffs.length || 0})</Typography>
        <Button variant="outlined" onClick={openStaffModal()}>
          + Adicionar
        </Button>
      </div>

      <DataTable
        data={staffs}
        columns={[
          {
            key: "name",
            header: "Staff",
            render: (it) => <StaffIdentity staff={it} />,
          },
          {
            key: "actions",
            header: "Ações",
            render: (it) => (
              <>
                <Button onClick={openStaffModal(it)} style={{}}>
                  Editar
                </Button>
                <Button color="error" onClick={() => removeStaff(it)}>
                  Remover
                </Button>
              </>
            ),
          },
        ]}
      />
    </Form>
  );
}

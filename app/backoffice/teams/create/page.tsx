"use client";

import { useBackofficeModal } from "@/components/BackofficeModalProvider";
import DataTable from "@/components/DataTable";
import Form from "@/components/Form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormValues = {
  name: string;
};

type PlayerFormValues = {
  name: string;
};

type PlayerDraft = {
  id: number;
  name: string;
};

export default function CreateTeamPage() {
  const router = useRouter();
  const { openModal, closeModal } = useBackofficeModal();
  const [players, setPlayers] = useState<PlayerDraft[]>([]);

  async function handleSubmit(values: FormValues) {
    const response = await fetch("/api/backoffice/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, players }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao criar equipa." }));
      alert(error.error ?? "Erro ao criar equipa.");
      return;
    }

    router.push("/backoffice/teams");
  }

  function handleAddPlayer(values: PlayerFormValues) {
    const name = values.name.trim();

    if (!name) {
      alert("O nome do jogador é obrigatório.");
      return;
    }

    setPlayers((current) => [...current, { id: Date.now(), name }]);
    closeModal();
  }

  function removePlayer(playerId: number) {
    setPlayers((current) => current.filter((player) => player.id !== playerId));
  }

  function openPlayerModal() {
    openModal({
      title: "Adicionar jogador",
      content: (
        <Form<PlayerFormValues>
          fields={[{ key: "name", label: "Nome do jogador" }]}
          onSubmit={handleAddPlayer}
        />
      ),
    });
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Criar equipa</h1>
      <p style={{ marginBottom: "1rem" }}>
        Preencha os dados para criar uma nova equipa.
      </p>
      <Form<FormValues>
        fields={[{ key: "name", label: "Nome da equipa" }]}
        onSubmit={handleSubmit}
      >
        <h5>Jogadores</h5>
        <button
          type="button"
          onClick={openPlayerModal}
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
          columns={[
            { key: "name", header: "Nome" },
            {
              key: "actions",
              header: "Ações",
              render: (player) => (
                <button
                  type="button"
                  onClick={() => removePlayer(player.id)}
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
          data={players}
        />
      </Form>

      <Link
        href="/backoffice/teams"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </main>
  );
}

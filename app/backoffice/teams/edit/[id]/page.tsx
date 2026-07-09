"use client";

import { useBackofficeModal } from "@/components/BackofficeModalProvider";
import DataTable from "@/components/DataTable";
import Form from "@/components/Form";
import { Player } from "@/generated/prisma";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TeamData = {
  id: number;
  name: string;
  players: Player[];
  staff: { id: number; name: string }[];
};

type PlayerDraft = {
  id: number;
  name: string;
};

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.id;
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<PlayerDraft[]>([]);
  const { openModal, closeModal } = useBackofficeModal();

  useEffect(() => {
    if (!teamId) return;

    fetch(`/api/backoffice/teams/${teamId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setTeam(data);
        setPlayers(data.players);
      })
      .catch(() => {
        alert("Erro ao carregar a equipa.");
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  async function handleSubmit(values: { name: string }) {
    const response = await fetch(`/api/backoffice/teams/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, players }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar equipa." }));
      alert(error.error ?? "Erro ao guardar equipa.");
      return;
    }

    router.push("/backoffice/teams");
  }

  function handleAddPlayer(values: PlayerDraft) {
    const name = values.name.trim();

    if (!name) {
      alert("O nome do jogador é obrigatório.");
      return;
    }

    setPlayers((current) => [...current, { id: Date.now(), name }]);
    closeModal();
  }

  function removePlayer(player: PlayerDraft) {
    setPlayers((current) => current.filter((it) => it.id !== player.id));
  }

  const openPlayerModal = (player?: PlayerDraft) => () => {
    openModal({
      title: player ? "Editar jogador" : "Adicionar jogador",
      content: (
        <Form<PlayerDraft>
          initialValues={player}
          fields={[{ key: "name", label: "Nome do jogador" }]}
          onSubmit={handleAddPlayer}
        />
      ),
    });
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Editar equipa</h1>
      <p style={{ marginBottom: "1rem" }}>
        Atualize os dados da equipa, jogadores e staff associados.
      </p>

      {loading && <p>A carregar equipa...</p>}

      {!loading && team && (
        <Form<PlayerDraft>
          initialValues={team}
          fields={[{ key: "name", label: "Nome da equipa" }]}
          onSubmit={handleSubmit}
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
            columns={[
              { key: "name", header: "Nome" },
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
                        color: "",
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
            data={players}
          />
        </Form>
      )}

      <Link
        href="/backoffice/teams"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </main>
  );
}

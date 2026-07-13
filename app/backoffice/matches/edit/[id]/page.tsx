"use client";

import FormMatch from "@/components/FormMatch";
import { IMatchFormValues, MatchBEResponse } from "@/types/match";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id;
  const [match, setMatch] = useState<MatchBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;

    fetch(`/api/backoffice/matches/${matchId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setMatch(data);
      })
      .catch(() => {
        alert("Erro ao carregar a jogos.");
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  async function handleSubmit(values: IMatchFormValues) {
    const response = await fetch(`/api/backoffice/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar jogos." }));
      alert(error.error ?? "Erro ao guardar jogos.");
      return;
    }

    router.push("/backoffice/matches");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Editar jogos</h1>
      <p style={{ marginBottom: "1rem" }}>
        Atualize os dados da jogos, jogadores e staff associados.
      </p>

      {loading && <p>A carregar jogos...</p>}

      {!loading && match && (
        <FormMatch initialValues={match} handleSubmit={handleSubmit} />
      )}

      <Link
        href="/backoffice/matches"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </main>
  );
}

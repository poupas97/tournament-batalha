"use client";

import DataTable from "@/components/DataTable";
import Detail from "@/components/Detail";
import { MatchBEResponse } from "@/types/match";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewMatchPage() {
  const params = useParams();
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
        alert("Erro ao carregar a competição.");
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Ver competição</h1>
      <p style={{ marginBottom: "1rem" }}>Veja os dados da competição.</p>

      {loading && <p>A carregar competição...</p>}

      {!loading && match && (
        <Detail<MatchBEResponse>
          data={match}
          fields={[
            { key: "competition.name", label: "Competição" },
            { key: "date", label: "Data" },
            { key: "round", label: "Ronda" },
            { key: "homeTeam.name", label: "Equipa da Casa" },
            { key: "awayTeam.name", label: "Equipa Visitante" },
          ]}
        />
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

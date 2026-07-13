"use client";

import DetailsTeam from "@/components/DetailsTeam";
import { TeamBEResponse } from "@/types/team";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewTeamPage() {
  const params = useParams();
  const teamId = params?.id;
  const [team, setTeam] = useState<TeamBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    fetch(`/api/teams/${teamId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setTeam(data);
      })
      .catch(() => {
        alert("Erro ao carregar a equipa.");
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  return (
    <>
      <h1>Ver equipa</h1>

      {loading && <p>A carregar equipa...</p>}

      {!loading && team && <DetailsTeam team={team} />}

      <Link
        href="/teams"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </>
  );
}

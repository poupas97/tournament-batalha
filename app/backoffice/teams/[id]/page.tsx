"use client";

import DetailsTeam from "@/components/DetailsTeam";
import Title from "@/components/Title";
import { TeamBEResponse } from "@/types/team";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewTeamPage() {
  const params = useParams();
  const teamId = params?.id;
  const [team, setTeam] = useState<TeamBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      })
      .catch(() => {
        alert("Erro ao carregar a equipa.");
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  return (
    <>
      <Title label="Ver equipa" back />

      {loading && <p>A carregar equipa...</p>}

      {!loading && team && <DetailsTeam team={team} />}
    </>
  );
}

"use client";

import CompetitionShuffle from "@/components/CompetitionShuffle";
import Title from "@/components/Title";
import { CompetitionBEResponse } from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewCompetitionMatchesPage() {
  const params = useParams();
  const competitionId = params?.id;
  const [matches, setMatches] = useState<MatchBEResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState<CompetitionBEResponse | null>(
    null,
  );

  useEffect(() => {
    if (!competitionId) return;

    fetch(`/api/backoffice/competitions/${competitionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setCompetition(data);
      })
      .catch(() => {
        alert("Erro ao carregar a competição.");
      })
      .finally(() => setLoading(false));
  }, [competitionId]);

  useEffect(() => {
    if (!competitionId) return;

    fetch(`/api/backoffice/competitions/${competitionId}/shuffle`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setMatches(data);
      })
      .catch(() => {
        alert("Erro ao carregar o sorteio.");
      })
      .finally(() => setLoading(false));
  }, [competitionId]);

  return (
    <>
      <Title label="Ver sorteio" back />

      {loading && <p>A carregar sorteio...</p>}

      {!loading && competition && matches && (
        <CompetitionShuffle competition={competition} matches={matches} />
      )}
    </>
  );
}

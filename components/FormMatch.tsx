"use client";

import Form from "@/components/Form";
import { CompetitionBEResponse } from "@/types/competition";
import { IMatchFormValues, MatchBEResponse } from "@/types/match";
import { TeamBEResponse } from "@/types/team";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormMatchProps = {
  initialValues?: MatchBEResponse;
  handleSubmit: (values: IMatchFormValues) => Promise<void>;
};

export default function FormMatch({
  initialValues,
  handleSubmit,
}: FormMatchProps) {
  const [competitions, setCompetitions] = useState<CompetitionBEResponse[]>([]);
  const [teams, setTeams] = useState<TeamBEResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/backoffice/competitions`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setCompetitions(data);
      })
      .catch(() => {
        alert("Erro ao carregar as competições.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`/api/backoffice/teams`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setTeams(data);
      })
      .catch(() => {
        alert("Erro ao carregar as equipas.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !competitions.length || !teams.length) return;

  return (
    <Form<IMatchFormValues>
      initialValues={initialValues}
      fields={[
        {
          key: "competitionId",
          label: "Competição",
          type: "select",
          options: competitions.map((c) => ({ value: c.id, label: c.name })),
        },
        { key: "date", label: "Data", type: "datetime-local" },
        {
          key: "round",
          label: "Rodada",
          type: "select",
          options: [
            { value: "1ª jo", label: "1ª jo" },
            { value: "2ª jo", label: "2ª jo" },
            { value: "3ª jo", label: "3ª jo" },
            { value: "4ª jo", label: "4ª jo" },
            { value: "5ª jo", label: "5ª jo" },
            { value: "6ª jo", label: "6ª jo" },
            { value: "7ª jo", label: "7ª jo" },
            { value: "8ª jo", label: "8ª jo" },
            { value: "1/16 Final", label: "1/16 Final" },
            { value: "1/8 Final", label: "1/8 Final" },
            { value: "1/4 Final", label: "1/4 Final" },
            { value: "1/2 Final", label: "1/2 Final" },
            { value: "Final", label: "Final" },
          ],
        },
        {
          key: "homeTeamId",
          label: "Equipa da Casa",
          type: "select",
          options: teams.map((t) => ({ value: t.id, label: t.name })),
        },
        {
          key: "awayTeamId",
          label: "Equipa Visitante",
          type: "select",
          options: teams.map((t) => ({ value: t.id, label: t.name })),
        },
      ]}
      onSubmit={handleSubmit}
    />
  );
}

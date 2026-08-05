"use client";

import Form from "@/components/Form";
import useGetState from "@/hooks/useGetState";
import { CompetitionBEResponse } from "@/types/competition";
import { IMatchFormValues, MatchBEResponse } from "@/types/match";
import { TeamBEResponse } from "@/types/team";

type FormMatchProps = {
  initialValues?: MatchBEResponse;
  handleSubmit: (values: IMatchFormValues) => Promise<void>;
};

export default function FormMatch({
  initialValues,
  handleSubmit,
}: FormMatchProps) {
  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useGetState<CompetitionBEResponse[]>("/api/backoffice/competitions");

  const {
    data: teams,
    loading: teamsLoading,
    error: teamsError,
  } = useGetState<TeamBEResponse[]>("/api/backoffice/teams");

  if (
    teamsLoading ||
    competitionsLoading ||
    !competitions?.length ||
    !teams?.length ||
    competitionsError ||
    teamsError
  )
    return;

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
          label: "Equipa visitada",
          type: "select",
          options: teams.map((t) => ({ value: t.id, label: t.name })),
        },
        {
          key: "awayTeamId",
          label: "Equipa visitante",
          type: "select",
          options: teams.map((t) => ({ value: t.id, label: t.name })),
        },
      ]}
      onSubmit={handleSubmit}
    />
  );
}

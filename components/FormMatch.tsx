"use client";

import Form from "@/components/Form";
import useGetState from "@/hooks/useGetState";
import { getCompetitionRoundOptions } from "@/lib/competition/rounds";
import { CompetitionBEResponse } from "@/types/competition";
import { IMatchFormValues, MatchBEResponse } from "@/types/match";
import { TeamBEResponse } from "@/types/team";
import type { FormSubmitResult } from "@/types/form";

type FormMatchProps = {
  initialValues?: MatchBEResponse;
  handleSubmit: (values: IMatchFormValues) => Promise<FormSubmitResult>;
};

export default function FormMatch({
  initialValues,
  handleSubmit,
}: FormMatchProps) {
  const {
    data: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useGetState<CompetitionBEResponse[]>(
    "/api/backoffice/competitions?noDeleted=true",
  );

  const {
    data: teams,
    loading: teamsLoading,
    error: teamsError,
  } = useGetState<TeamBEResponse[]>("/api/backoffice/teams?noDeleted=true");

  if (
    teamsLoading ||
    competitionsLoading ||
    !competitions?.length ||
    !teams?.length ||
    competitionsError ||
    teamsError
  )
    return;

  const roundOptions = getCompetitionRoundOptions(competitions);

  return (
    <Form<IMatchFormValues>
      initialValues={initialValues}
      entity="matches"
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
          label: "Ronda",
          type: "select",
          options: roundOptions,
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

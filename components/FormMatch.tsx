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
          label: "Ronda",
          type: "select",
          options: [
            { value: `Jornada 1`, label: `Jornada 1` },
            { value: `Jornada 2`, label: `Jornada 2` },
            { value: `Jornada 3`, label: `Jornada 3` },
            { value: `Jornada 4`, label: `Jornada 4` },
            { value: `Jornada 5`, label: `Jornada 5` },
            { value: `Jornada 6`, label: `Jornada 6` },
            { value: `Jornada 7`, label: `Jornada 7` },
            { value: `Jornada 8`, label: `Jornada 8` },
            { value: "1/16 final", label: "1/16 final" },
            { value: "1/8 final", label: "1/8 final" },
            { value: "1/4 final", label: "1/4 final" },
            { value: "1/2 final", label: "1/2 final" },
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

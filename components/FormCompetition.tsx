"use client";

import Form from "@/components/Form";
import { CompetitionConfig } from "@/generated/prisma";
import {
  getCompetitionOpponentsHint,
  getCompetitionQualifiedHint,
} from "@/lib/detailHints";
import { ICompetitionFormValues } from "@/types/competition";

type FormCompetitionProps = {
  initialValues?: ICompetitionFormValues;
  onSubmit: (values: ICompetitionFormValues) => Promise<void>;
};

export default function FormCompetition({
  initialValues,
  onSubmit,
}: FormCompetitionProps) {
  return (
    <Form<ICompetitionFormValues>
      initialValues={initialValues}
      fields={[
        { key: "name", label: "Nome" },
        { key: "startDate", label: "Data de início", type: "date" },
        {
          key: "config",
          label: "Configuracao",
          type: "select",
          options: Object.keys(CompetitionConfig).map((it) => ({
            label: it,
            value: it,
          })),
        },
        {
          key: "qualified",
          label: "Qualificados",
          hint: getCompetitionQualifiedHint,
        },
        {
          key: "opponents",
          label: "Oponentes",
          hint: getCompetitionOpponentsHint,
        },
        {
          key: "color",
          label: "Cor",
          type: "color",
          hint: "Escolhe uma cor ainda não usada por outra competição.",
        },
        { key: "active", label: "Ativo", type: "checkbox" },
      ]}
      onSubmit={onSubmit}
    />
  );
}

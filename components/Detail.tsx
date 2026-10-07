"use client";

import { formatDateTime } from "@/lib/utils";
import HintTooltip from "@/components/HintTooltip";
import get from "lodash/get";
import { Grid, Typography } from "@mui/material";

type DetailField<T extends Record<string, unknown>> = {
  key: string;
  label: string;
  hint?: string | ((data: T) => string);
  format?: "date" | "boolean" | "json";
};

type DetailProps<T extends Record<string, unknown>> = {
  error: string | undefined;
  loading: boolean;
  data: T | undefined;
  fields: DetailField<T>[];
  emptyMessage?: string;
};

export default function Detail<T extends Record<string, unknown>>({
  error,
  loading,
  data,
  fields,
  emptyMessage,
}: DetailProps<T>) {
  if (loading)
    return <Typography variant="body1">A carregar dados...</Typography>;

  if (error)
    return (
      <Typography variant="body1" color="error">
        {error}
      </Typography>
    );

  if (!data)
    return (
      <Typography variant="body1">
        {emptyMessage || "Sem dados para mostrar"}
      </Typography>
    );

  return (
    <Grid container spacing={2}>
      {fields.map((it) => {
        const value = get(data, it.key, "");
        const hint = typeof it.hint === "function" ? it.hint(data) : it.hint;

        return (
          <Grid size={2} key={it.key}>
            <Typography variant="caption" color="text.secondary">
              {it.label}
              {hint && <HintTooltip label={it.label} hint={hint} />}
            </Typography>

            <Typography variant="body1">
              <>
                {it.format === "date"
                  ? formatDateTime(value as string | undefined)
                  : it.format === "boolean"
                    ? value
                      ? "Sim"
                      : "Não"
                    : it.format === "json"
                      ? JSON.stringify(value, null, 2)
                      : value}
              </>
            </Typography>
          </Grid>
        );
      })}
    </Grid>
  );
}

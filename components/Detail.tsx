import HintTooltip from "@/components/HintTooltip";
import _get from "lodash/get";
import { Grid, Skeleton, Stack, Typography } from "@mui/material";
import { formattedValue } from "@/lib/formattedValue";
import type { ReactNode } from "react";

const DETAIL_SKELETON_GRID_GAP = 2;
const DETAIL_SKELETON_FIELD_GAP = 0.5;

type DetailField<T extends Record<string, unknown>> = {
  key: string;
  label: string;
  hint?: string | ((data: T) => string);
  format?: "date" | "datetime" | "boolean" | "json" | "color" | "photo";
  render?: (data: T) => ReactNode;
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
  if (loading) return <DetailSkeleton fields={fields} />;

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
        const value = _get(data, it.key, "");
        const hint = typeof it.hint === "function" ? it.hint(data) : it.hint;

        return (
          <Grid size={{ xs: 6, sm: 2 }} key={it.key}>
            <Typography variant="caption" color="text.secondary">
              {it.label}
              {hint && <HintTooltip label={it.label} hint={hint} />}
            </Typography>

            {it.render ? (
              it.render(data)
            ) : (
              <Typography variant="body1">
                {formattedValue(value, it.format)}
              </Typography>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}

function DetailSkeleton<T extends Record<string, unknown>>({
  fields,
}: {
  fields: DetailField<T>[];
}) {
  return (
    <Grid
      container
      spacing={DETAIL_SKELETON_GRID_GAP}
      role="status"
      aria-label="A carregar detalhes"
    >
      {fields.map((field) => (
        <Grid size={{ xs: 6, sm: 2 }} key={field.key}>
          <Stack spacing={DETAIL_SKELETON_FIELD_GAP}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="90%" height={30} />
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}

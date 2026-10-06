"use client";

import { formatDateTime } from "@/lib/utils";
import HintTooltip from "@/components/HintTooltip";
import get from "lodash/get";

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
  if (loading) return <p>A carregar dados...</p>;

  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  if (!data) return <p>{emptyMessage || "Sem dados para mostrar"}</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "1rem",
      }}
    >
      {fields.map((it) => {
        const value = get(data, it.key, "");
        const hint = typeof it.hint === "function" ? it.hint(data) : it.hint;

        return (
          <div key={it.key}>
            <div className="flex items-center gap-1">
              <strong>{it.label}</strong>
              {hint && <HintTooltip label={it.label} hint={hint} />}
            </div>
            <div>
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

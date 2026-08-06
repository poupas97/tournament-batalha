"use client";

import { formatDateTime } from "@/lib/utils";
import get from "lodash/get";

type DetailField = {
  key: string;
  label: string;
  format?: "date" | "boolean";
};

type DetailProps<T extends Record<string, unknown>> = {
  error: string | undefined;
  loading: boolean;
  data: T | undefined;
  fields: DetailField[];
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

  if (!data) return <p>{emptyMessage || "Sem dados para mostrar."}</p>;

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

        return (
          <div key={it.key}>
            <strong>{it.label}</strong>
            <div>
              <>
                {it.format === "date"
                  ? formatDateTime(value as string | undefined)
                  : it.format === "boolean"
                    ? value
                      ? "Sim"
                      : "Não"
                    : value}
              </>
            </div>
          </div>
        );
      })}
    </div>
  );
}

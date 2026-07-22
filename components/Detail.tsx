"use client";

import { formatDateTime } from "@/lib/utils";
import get from "lodash/get";

type DetailField = {
  key: string;
  label: string;
  format?: "date" | "boolean";
};

type DetailProps<T extends Record<string, unknown>> = {
  data: T;
  fields: DetailField[];
};

export default function Detail<T extends Record<string, unknown>>({
  data,
  fields,
}: DetailProps<T>) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
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

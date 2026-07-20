"use client";

import { formatDateTime } from "@/lib/utils";
import get from "lodash/get";

type DetailField = {
  key: string;
  label: string;
  format?: "date";
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
      {fields.map((it) => (
        <div key={it.key}>
          <strong>{it.label}</strong>
          <div>
            <>
              {it.format === "date"
                ? formatDateTime(get(data, it.key) as string | undefined)
                : get(data, it.key, "")}
            </>
          </div>
        </div>
      ))}
    </div>
  );
}

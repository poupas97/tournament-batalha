"use client";

import { get } from "lodash";
import { type ReactNode } from "react";

type DetailField<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
};

type DetailProps<T extends Record<string, unknown>> = {
  data: T;
  fields: DetailField<T>[];
  children?: ReactNode;
};

export default function Detail<T extends Record<string, unknown>>({
  data,
  fields,
  children,
}: DetailProps<T>) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        {fields.map((it) => (
          <div>
            <strong>{it.label}</strong>
            <div>{String(get(data, it.key) ?? "")}</div>
          </div>
        ))}
      </div>

      {children}
    </>
  );
}

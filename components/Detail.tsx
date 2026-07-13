"use client";

import get from "lodash/get";
import { type ReactNode } from "react";

type DetailField = {
  key: string;
  label: string;
};

type DetailProps<T extends Record<string, unknown>> = {
  data: T;
  fields: DetailField[];
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
          <div key={it.key}>
            <strong>{it.label}</strong>
            <div>{String(get(data, it.key) ?? "")}</div>
          </div>
        ))}
      </div>

      {children}
    </>
  );
}

"use client";

import get from "lodash/get";
import set from "lodash/set";
import { useState, type FormEvent, type ReactNode } from "react";

type FormField<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "email" | "password" | "select" | "datetime-local";
  placeholder?: string;
  options?: { value: number | string; label: string }[];
};

type FormProps<T extends Record<string, unknown>> = {
  initialValues?: T;
  fields: FormField<T>[];
  onSubmit?: (values: T) => void;
  children?: ReactNode;
};

function formatDateTimeLocalValue(value: unknown) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Form<T extends Record<string, unknown>>({
  initialValues,
  fields,
  onSubmit,
  children,
}: FormProps<T>) {
  const [values, setValues] = useState<T | undefined>(
    fields.reduce((acc, field) => {
      set(acc, field.key, initialValues?.[field.key] ?? "");
      return acc;
    }, {} as T),
  );

  function handleChange(key: keyof T, value: string) {
    setValues((current) => ({
      ...(current || ({} as T)),
      [key]: value as T[keyof T],
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const hasRequiredValues = fields.every((field) => {
      const value = get(values, field.key);

      return (
        value !== undefined && value !== null && String(value).trim() !== ""
      );
    });

    if (!values || !hasRequiredValues) {
      return;
    }

    onSubmit?.(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "480px", display: "grid", gap: "1rem" }}
    >
      {fields.map((field) => (
        <label
          key={String(field.key)}
          style={{ display: "grid", gap: "0.4rem" }}
        >
          <span>{field.label}</span>

          {field.options ? (
            <select
              value={String(get(values, field.key) ?? "")}
              onChange={(event) => handleChange(field.key, event.target.value)}
              style={{
                padding: "0.7rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
              }}
            >
              <option value="">Selecione...</option>

              {field.options.map((it) => (
                <option key={it.value} value={it.value}>
                  {it.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type ?? "text"}
              value={
                field.type === "datetime-local"
                  ? formatDateTimeLocalValue(get(values, field.key))
                  : String(get(values, field.key) ?? "")
              }
              onChange={(event) => handleChange(field.key, event.target.value)}
              placeholder={field.placeholder}
              style={{
                padding: "0.7rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
              }}
            />
          )}
        </label>
      ))}

      {children}

      <button
        type="submit"
        style={{
          padding: "0.7rem 1rem",
          border: "none",
          borderRadius: "6px",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        {initialValues ? "Guardar" : "Adicionar"}
      </button>
    </form>
  );
}

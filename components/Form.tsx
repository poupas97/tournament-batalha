"use client";

import get from "lodash/get";
import { FormEvent, useState, type ReactNode } from "react";

type FormField<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "select"
    | "datetime-local"
    | "checkbox";
  placeholder?: string;
  options?: { value: number | string; label: string }[];
};

type FormProps<T extends Record<string, unknown>> = {
  initialValues?: T;
  fields: FormField<T>[];
  onSubmit?: (values: T) => void;
  children?: ReactNode;
  vertical?: boolean;
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

  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(
      "-",
    ) + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function Form<T extends Record<string, unknown>>({
  initialValues,
  fields,
  onSubmit,
  children,
  vertical,
}: FormProps<T>) {
  const [values, setValues] = useState<T | undefined>(initialValues);

  function handleChange(key: keyof T, value: string | boolean) {
    setValues((current) => ({
      ...(current || ({} as T)),
      [key]: value as T[keyof T],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${vertical ? 1 : 5}, minmax(0, 1fr))`,
          gap: "1rem",
        }}
      >
        {fields.map((field) => (
          <label
            key={String(field.key)}
            id={String(field.key)}
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <span>{field.label}</span>

            {field.options ? (
              <select
                name={String(field.key)}
                value={String(get(values, field.key) ?? "")}
                onChange={(event) =>
                  handleChange(field.key, event.target.value)
                }
                style={{
                  padding: "1rem",
                  border: "0.05rem solid #cbd5e1",
                  borderRadius: "0.5rem",
                }}
              >
                <option value="">Selecione...</option>

                {field.options.map((it) => (
                  <option key={it.value} value={it.value}>
                    {it.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                name={String(field.key)}
                type="checkbox"
                checked={Boolean(get(values, field.key))}
                onChange={(event) =>
                  handleChange(field.key, event.target.checked)
                }
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            ) : (
              <input
                name={String(field.key)}
                type={field.type ?? "text"}
                value={
                  field.type === "datetime-local"
                    ? formatDateTimeLocalValue(get(values, field.key))
                    : String(get(values, field.key) ?? "")
                }
                onChange={(event) =>
                  handleChange(field.key, event.target.value)
                }
                placeholder={field.placeholder}
                style={{
                  padding: "1rem",
                  border: "0.05rem solid #cbd5e1",
                  borderRadius: "0.5rem",
                }}
              />
            )}
          </label>
        ))}
      </div>

      {children}

      <button
        type="submit"
        style={{
          padding: "1rem",
          border: "none",
          borderRadius: "0.5rem",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Guardar
      </button>
    </form>
  );
}

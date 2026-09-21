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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className={`grid gap-4 ${
          vertical ? "grid-cols-1" : "grid-cols-1 md:grid-cols-5"
        }`}
      >
        {fields.map((field) => (
          <label
            key={String(field.key)}
            id={String(field.key)}
            className="flex flex-col gap-1 text-sm font-medium text-slate-700"
          >
            <span>{field.label}</span>

            {field.options ? (
              <select
                name={String(field.key)}
                value={String(get(values, field.key) ?? "")}
                onChange={(event) =>
                  handleChange(field.key, event.target.value)
                }
                className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-2 size-6 accent-blue-600"
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
                className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            )}
          </label>
        ))}
      </div>

      {children}

      <button
        type="submit"
        className="min-h-12 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Guardar
      </button>
    </form>
  );
}

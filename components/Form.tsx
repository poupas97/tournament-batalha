"use client";

import { get } from "lodash";
import { useState, type FormEvent, type ReactNode } from "react";

type FormField<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "email" | "password" | "color";
  placeholder?: string;
};

type FormProps<T extends Record<string, unknown>> = {
  initialValues?: T;
  fields: FormField<T>[];
  onSubmit?: (values: T) => void;
  children?: ReactNode;
};

export default function Form<T extends Record<string, unknown>>({
  initialValues,
  fields,
  onSubmit,
  children,
}: FormProps<T>) {
  const [values, setValues] = useState<T | undefined>(initialValues);

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
          <input
            type={field.type ?? "text"}
            value={String(get(values, field.key) ?? "")}
            onChange={(event) => handleChange(field.key, event.target.value)}
            placeholder={field.placeholder}
            style={{
              padding: "0.7rem",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />
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

"use client";

import FormCheckbox from "@/components/FormCheckbox";
import HintTooltip from "@/components/HintTooltip";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import get from "lodash/get";
import { FormEvent, useState, type ReactNode } from "react";

type FormInputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "datetime-local";

type FormFieldType = FormInputType | "select" | "checkbox";

type FormField<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
  hint?: string | ((data: T | undefined) => string);
  type?: FormFieldType;
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

function getInputType(type: FormFieldType | undefined): FormInputType {
  return type === "select" || type === "checkbox" ? "text" : (type ?? "text");
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
            <span className="flex items-center gap-1">
              {field.label}
              {field.hint && (
                <HintTooltip
                  label={field.label}
                  hint={
                    typeof field.hint === "function"
                      ? field.hint(values)
                      : field.hint
                  }
                />
              )}
            </span>

            {field.options ? (
              <FormSelect
                name={String(field.key)}
                value={String(get(values, field.key) ?? "")}
                options={field.options}
                onChange={(value) => handleChange(field.key, value)}
              />
            ) : field.type === "checkbox" ? (
              <FormCheckbox
                name={String(field.key)}
                checked={Boolean(get(values, field.key))}
                onChange={(checked) => handleChange(field.key, checked)}
              />
            ) : (
              <FormInput
                name={String(field.key)}
                type={getInputType(field.type)}
                value={
                  field.type === "datetime-local"
                    ? formatDateTimeLocalValue(get(values, field.key))
                    : String(get(values, field.key) ?? "")
                }
                placeholder={field.placeholder}
                onChange={(value) => handleChange(field.key, value)}
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

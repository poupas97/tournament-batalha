"use client";

import FormCheckbox from "@/components/FormCheckbox";
import HintTooltip from "@/components/HintTooltip";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import { Box, Button, Stack, Typography } from "@mui/material";
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
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: vertical
            ? "1fr"
            : { xs: "1fr", md: "repeat(5, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {fields.map((field) => (
          <Stack
            component="label"
            key={String(field.key)}
            id={String(field.key)}
            spacing={0.75}
          >
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 700,
              }}
            >
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
            </Typography>

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
          </Stack>
        ))}
      </Box>

      {children}

      <Button
        type="submit"
        variant="contained"
        sx={{ minHeight: 48, fontWeight: 700 }}
      >
        Guardar
      </Button>
    </Stack>
  );
}

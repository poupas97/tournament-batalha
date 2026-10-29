"use client";

import FormCheckbox from "@/components/FormCheckbox";
import FormPhoto from "@/components/FormPhoto";
import HintTooltip from "@/components/HintTooltip";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import {
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import _get from "lodash/get";
import { type FormEvent, useState } from "react";
import {
  formatDateInputValue,
  formatDateTimeLocalValue,
  getFormInputType,
  submitForm,
} from "@/lib/form";
import type { FormProps } from "@/types/form";
import RecordLifecycleButton from "./RecordLifecycleButton";

export default function Form<T extends Record<string, unknown>>({
  initialValues,
  fields,
  onSubmit,
  children,
  vertical,
  submitLabel,
  entity,
}: FormProps<T>) {
  const [values, setValues] = useState<T>(initialValues ?? ({} as T));
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const disabled = initialValues?.deletedAt != null;

  function handleChange(key: keyof T, value: string | boolean | null) {
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[String(key)];

      return next;
    });

    setValues((current) => ({ ...current, [key]: value as T[keyof T] }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      const outcome = await submitForm(values, fields, onSubmit);

      if (outcome.status === "field-error") {
        setFieldErrors({ [outcome.key]: outcome.message });
      } else if (outcome.status === "error") {
        alert(outcome.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={4}>
      <Stack spacing={4} direction="row" sx={{ justifyContent: "flex-end" }}>
        {!!values.id && entity && (
          <RecordLifecycleButton
            entity={entity}
            id={values.id}
            deletedAt={values.deletedAt}
          />
        )}

        <Button type="submit" variant="contained" disabled={saving || disabled}>
          {saving ? (
            <>
              <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />A
              guardar…
            </>
          ) : (
            submitLabel || "Guardar"
          )}
        </Button>
      </Stack>

      <Stack
        spacing={4}
        sx={{
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid
              key={String(field.key)}
              spacing={1}
              size={vertical ? 12 : field.type === "photo" ? 4 : 2}
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
                  value={String(_get(values, field.key) ?? "")}
                  options={field.options}
                  onChange={(value) => handleChange(field.key, value)}
                  error={Boolean(fieldErrors[String(field.key)])}
                  helperText={fieldErrors[String(field.key)]}
                />
              ) : field.type === "checkbox" ? (
                <FormCheckbox
                  name={String(field.key)}
                  checked={Boolean(_get(values, field.key))}
                  onChange={(checked) => handleChange(field.key, checked)}
                  fieldError={fieldErrors[String(field.key)]}
                />
              ) : field.type === "photo" ? (
                <FormPhoto
                  label={field.label}
                  value={String(_get(values, field.key) ?? "")}
                  onChange={(photo) => handleChange(field.key, photo)}
                  fieldError={fieldErrors[String(field.key)]}
                />
              ) : (
                <FormInput
                  name={String(field.key)}
                  type={getFormInputType(field.type)}
                  value={
                    field.type === "date"
                      ? formatDateInputValue(_get(values, field.key))
                      : field.type === "datetime-local"
                        ? formatDateTimeLocalValue(_get(values, field.key))
                        : String(_get(values, field.key) ?? "")
                  }
                  placeholder={field.placeholder}
                  onChange={(value) => handleChange(field.key, value)}
                  error={Boolean(fieldErrors[String(field.key)])}
                  helperText={fieldErrors[String(field.key)]}
                />
              )}
            </Grid>
          ))}
        </Grid>

        {children}
      </Stack>
    </Stack>
  );
}

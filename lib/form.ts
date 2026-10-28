import type {
  FormFieldType,
  FormInputType,
  FormSubmitHandler,
  FormSubmitOutcome,
} from "@/types/form";

export function formatDateTimeLocalValue(value: unknown) {
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

export function formatDateInputValue(value: unknown) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getFormInputType(
  type: FormFieldType | undefined,
): FormInputType {
  return type === "select" || type === "checkbox" || type === "photo"
    ? "text"
    : (type ?? "text");
}

export async function submitForm<T>(
  values: T,
  fields: readonly { key: keyof T }[],
  onSubmit: FormSubmitHandler<T>,
): Promise<FormSubmitOutcome> {
  try {
    const result = await onSubmit(values);
    const response = result?.response;

    if (response instanceof Response && !response.ok) {
      const body = await response.json().catch(() => null);
      const errorBody =
        body && typeof body === "object"
          ? (body as { error?: string; key?: string })
          : {};
      const message = errorBody.error ?? "Não foi possível guardar os dados";

      if (
        errorBody.key &&
        fields.some((field) => String(field.key) === errorBody.key)
      ) {
        return {
          status: "field-error",
          key: errorBody.key,
          message,
        };
      }

      return { status: "error", message };
    }

    await result?.onSuccess?.();
    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível guardar os dados",
    };
  }
}

import type { ReactNode } from "react";

export type FormSubmitResult = {
  response: Response;
  onSuccess?: () => void | Promise<void>;
};

export type FormSubmitHandler<T> = (
  values: T,
) => void | FormSubmitResult | Promise<void | FormSubmitResult>;

export type FormInputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "date"
  | "datetime-local"
  | "color";

export type FormFieldType = FormInputType | "select" | "checkbox" | "photo";

export type FormSubmitOutcome =
  | { status: "success" }
  | { status: "field-error"; key: string; message: string }
  | { status: "error"; message: string };

export type FormField<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
  hint?: string | ((data: T | undefined) => string);
  type?: FormFieldType;
  placeholder?: string;
  options?: { value: number | string; label: string }[];
};

export type FormProps<T extends Record<string, unknown>> = {
  initialValues?: T;
  fields: FormField<T>[];
  onSubmit: FormSubmitHandler<T>;
  children?: ReactNode;
  vertical?: boolean;
};

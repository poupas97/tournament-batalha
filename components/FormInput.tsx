"use client";

import TextField from "@mui/material/TextField";

type FormInputProps = {
  name: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "datetime-local"
    | "color";
  value: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
};

export default function FormInput({
  name,
  type = "text",
  value,
  placeholder,
  error,
  helperText,
  onChange,
}: FormInputProps) {
  return (
    <TextField
      name={name}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      fullWidth
      size="small"
      error={error}
      helperText={helperText}
    />
  );
}

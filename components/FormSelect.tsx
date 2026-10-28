"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

type FormSelectProps = {
  name: string;
  value: string;
  options: { value: number | string; label: string }[];
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
};

export default function FormSelect({
  name,
  value,
  options,
  onChange,
  error,
  helperText,
}: FormSelectProps) {
  return (
    <TextField
      select
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      size="small"
      error={error}
      helperText={helperText}
    >
      <MenuItem value="">Selecione...</MenuItem>

      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

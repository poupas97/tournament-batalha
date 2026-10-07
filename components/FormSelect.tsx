"use client";

import TextField from "@mui/material/TextField";

type FormSelectProps = {
  name: string;
  value: string;
  options: { value: number | string; label: string }[];
  onChange: (value: string) => void;
};

export default function FormSelect({
  name,
  value,
  options,
  onChange,
}: FormSelectProps) {
  return (
    <TextField
      select
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      size="small"
      slotProps={{ select: { native: true } }}
    >
      <option value="">Selecione...</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </TextField>
  );
}

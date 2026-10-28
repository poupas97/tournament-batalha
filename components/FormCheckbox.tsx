"use client";

import { Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

type FormCheckboxProps = {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  fieldError?: string;
};

export default function FormCheckbox({
  name,
  checked,
  onChange,
  fieldError,
}: FormCheckboxProps) {
  return (
    <>
      <Checkbox
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        sx={{ alignSelf: "flex-start", p: 0.5 }}
      />
      {fieldError && (
        <Typography variant="caption" color="error" sx={{ display: "block" }}>
          {fieldError}
        </Typography>
      )}
    </>
  );
}

"use client";

import Checkbox from "@mui/material/Checkbox";

type FormCheckboxProps = {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function FormCheckbox({
  name,
  checked,
  onChange,
}: FormCheckboxProps) {
  return (
    <Checkbox
      name={name}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      sx={{ alignSelf: "flex-start", p: 0.5 }}
    />
  );
}

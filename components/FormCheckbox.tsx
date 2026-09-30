"use client";

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
    <input
      name={name}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-2 size-6 accent-blue-600"
    />
  );
}

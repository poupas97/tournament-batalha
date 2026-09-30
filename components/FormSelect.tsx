"use client";

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
    <select
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    >
      <option value="">Selecione...</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

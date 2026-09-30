"use client";

type FormInputProps = {
  name: string;
  type?: "text" | "number" | "email" | "password" | "datetime-local";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function FormInput({
  name,
  type = "text",
  value,
  placeholder,
  onChange,
}: FormInputProps) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    />
  );
}

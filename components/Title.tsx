"use client";

import { useRouter } from "next/navigation";

type TitleProps = {
  label: string;
  back?: boolean;
};

export default function Title({ label, back }: TitleProps) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      {back && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
        >
          ← Voltar
        </a>
      )}
      <h1>{label}</h1>
    </div>
  );
}

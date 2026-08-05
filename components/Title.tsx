"use client";

import { useRouter } from "next/navigation";

type TitleProps = {
  label: string;
  back?: boolean;
  edit?: string;
};

export default function Title({ label, back, edit }: TitleProps) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
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
          style={{ minWidth: 100 }}
        >
          ← Voltar
        </a>
      )}
      <h1>{label}</h1>
      {edit ? (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            router.push(edit);
          }}
          style={{ minWidth: 100 }}
        >
          Editar
        </a>
      ) : (
        <div style={{ minWidth: 100 }} />
      )}
    </div>
  );
}

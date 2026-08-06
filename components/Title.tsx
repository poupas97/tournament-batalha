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
      {back && <button onClick={() => router.back()}>Voltar</button>}
      <h1>{label}</h1>
      {edit ? (
        <button onClick={() => router.push(edit)}>Editar</button>
      ) : (
        <div style={{ minWidth: "6rem" }} />
      )}
    </div>
  );
}

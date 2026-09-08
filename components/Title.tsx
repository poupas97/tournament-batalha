"use client";

import { useRouter } from "next/navigation";
import { Typography, Button } from "@heroui/react";

type TitleProps = {
  label: string;
  back?: boolean;
  edit?: string;
};

export default function Title({ label, back, edit }: TitleProps) {
  const router = useRouter();

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row justify-between gap-4 items-center">
        {back && <BackButton onClick={() => router.back()} />}

        <Typography type="h1">{label}</Typography>
      </div>

      {edit ? (
        <Button size="sm" onPress={() => router.push(edit)}>
          Editar
        </Button>
      ) : (
        <div className="min-w-[6rem]" />
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="sm"
      onPress={onClick}
      className="flex items-center gap-2"
      aria-label="Voltar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Voltar
    </Button>
  );
}

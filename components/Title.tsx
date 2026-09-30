"use client";

import { useRouter } from "next/navigation";
import { Typography, Button } from "@heroui/react";

type TitleProps = {
  label: string;
  description?: string;
  back?: boolean;
  edit?: string;
};

export default function Title({ label, description, back, edit }: TitleProps) {
  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="flex flex-row items-center gap-4">
        {back && (
          <Button
            size="sm"
            onPress={router.back}
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
          </Button>
        )}

        <div>
          <Typography type="h1">{label}</Typography>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
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

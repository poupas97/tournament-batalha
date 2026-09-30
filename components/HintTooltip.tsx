"use client";

import { Tooltip } from "@heroui/react";

type HintTooltipProps = {
  label: string;
  hint: string;
};

export default function HintTooltip({ label, hint }: HintTooltipProps) {
  return (
    <Tooltip delay={300}>
      <Tooltip.Trigger>
        <button
          type="button"
          aria-label={`Ajuda sobre ${label}`}
          className="inline-flex size-4 items-center justify-center rounded-full border border-slate-400 text-xs font-semibold leading-none text-slate-600 hover:border-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ?
        </button>
      </Tooltip.Trigger>

      <Tooltip.Content className="max-w-64 whitespace-normal break-normal text-sm">
        {hint}
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
  );
}

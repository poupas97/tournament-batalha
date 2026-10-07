"use client";

import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import { IconButton, Tooltip } from "@mui/material";

type HintTooltipProps = {
  label: string;
  hint: string;
};

export default function HintTooltip({ label, hint }: HintTooltipProps) {
  return (
    <Tooltip title={hint} arrow enterDelay={300}>
      <IconButton
        aria-label={`Ajuda sobre ${label}`}
        size="small"
        sx={{ width: 20, height: 20, p: 0 }}
      >
        <HelpOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
}

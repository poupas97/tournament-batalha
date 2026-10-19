"use client";

import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { useId, type ReactNode } from "react";
import CloseIcon from "@mui/icons-material/Close";

type SideModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function SideModal({
  isOpen,
  title,
  onClose,
  children,
}: SideModalProps) {
  const titleId = useId();

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": titleId,
          sx: {
            width: { xs: "100vw", sm: "33vw" },
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography id={titleId} variant="h6">
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
        {children}
      </Box>
    </Drawer>
  );
}

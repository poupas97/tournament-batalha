"use client";

import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { useEffect, useId, type ReactNode } from "react";
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: "33vw" } } }}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          borderBottom: "1px solid",
          borderBottomColor: "divider",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {children}
      </div>
    </Drawer>
  );
}

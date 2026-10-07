"use client";

import { Drawer, IconButton, Typography } from "@mui/material";
import { useEffect, useId, type ReactNode } from "react";
import CloseIcon from "@mui/icons-material/Close";

type SideModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export default function SideModal({
  isOpen,
  title,
  onClose,
  children,
  footer,
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          borderBottom: "0.05rem solid #d0d7de",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {children}
      </div>

      {footer && (
        <footer
          style={{
            padding: "1rem",
            borderTop: "0.05rem solid #d0d7de",
          }}
        >
          {footer}
        </footer>
      )}
    </Drawer>
  );
}

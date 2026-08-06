"use client";

import { useEffect, useId, type CSSProperties, type ReactNode } from "react";

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
    <div
      role="presentation"
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(15, 23, 42, 0.45)",
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "33%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "white",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            borderBottom: "0.05rem solid #d0d7de",
          }}
        >
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
            style={{
              border: "0.05rem solid #cbd5e1",
              borderRadius: "0.5rem",
              background: "white",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </header>

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
      </aside>
    </div>
  );
}

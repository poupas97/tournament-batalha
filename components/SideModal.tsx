"use client";

import { useEffect, useId, type CSSProperties, type ReactNode } from "react";

type SideModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: CSSProperties["width"];
  footer?: ReactNode;
};

export default function SideModal({
  isOpen,
  title,
  onClose,
  children,
  width = "20vw",
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
          width,
          minWidth: "320px",
          maxWidth: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "white",
          boxShadow: "-20px 0 45px rgba(15, 23, 42, 0.22)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            borderBottom: "1px solid #d0d7de",
          }}
        >
          <h2 id={titleId} style={{ margin: 0, fontSize: "1.1rem" }}>
            {title}
          </h2>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
            style={{
              width: "2rem",
              height: "2rem",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              lineHeight: 1,
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
              borderTop: "1px solid #d0d7de",
            }}
          >
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}

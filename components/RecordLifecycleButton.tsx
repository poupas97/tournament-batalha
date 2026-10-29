"use client";

import { Button } from "@mui/material";
import { useState } from "react";

type RecordLifecycleButtonProps = {
  id: unknown;
  deletedAt: unknown;
  entity: string;
};

export default function RecordLifecycleButton({
  id,
  deletedAt,
  entity,
}: RecordLifecycleButtonProps) {
  const [pending, setPending] = useState(false);

  const isDeleted = deletedAt != null;
  const buttonLabel = isDeleted ? "Reativar" : "Apagar";
  const pendingLabel = isDeleted ? "A reativar…" : "A apagar…";

  if (isDeleted && !entity) return null;

  async function changeRecordState() {
    if (!confirm("Aplicar esta ação?")) return;

    setPending(true);

    try {
      const response = isDeleted
        ? await fetch("/api/backoffice/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity, id }),
          })
        : await fetch(`/api/backoffice/${entity}/${id}`, { method: "DELETE" });

      if (!response.ok) {
        alert("Aconteceu um erro");
        return;
      }

      if (entity === "players") {
        window.history.go(-2);

        return;
      }
      window.location.reload();
    } catch {
      alert("Aconteceu um erro");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      color={isDeleted ? "primary" : "error"}
      variant="outlined"
      onClick={changeRecordState}
      disabled={pending}
    >
      {pending ? pendingLabel : buttonLabel}
    </Button>
  );
}

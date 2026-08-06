"use client";

import { GridTableProps } from "@/types/grid-table";
import DataTable from "./DataTable";
import DataGrid from "./DataGrid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function GridTable<T>({
  emptyMessage,
  create,
  data,
  error,
  loading,
  notChangeRoute,
  ...rest
}: GridTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localView, setLocalView] = useState<"table" | "grid">("table");

  const view = notChangeRoute
    ? localView
    : searchParams.get("view") === "table"
      ? "table"
      : "grid";

  const onSetView = (nextView: "table" | "grid") => {
    if (notChangeRoute) {
      setLocalView(nextView);
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("view", nextView);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <div style={{ flex: 1 }}>
          {create && (
            <button onClick={() => router.push(create)}>+ Adicionar</button>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => onSetView("grid")} disabled={view === "grid"}>
            ⬜ Grid
          </button>
          <button
            onClick={() => onSetView("table")}
            disabled={view === "table"}
          >
            📋 Tabela
          </button>
        </div>
      </div>

      {loading && <p>A carregar dados...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!data?.length ? (
        <p>{emptyMessage || "Sem dados para mostrar."}</p>
      ) : view === "grid" ? (
        <DataGrid data={data} {...rest} />
      ) : (
        <DataTable data={data} {...rest} />
      )}
    </>
  );
}

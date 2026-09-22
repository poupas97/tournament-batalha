"use client";

import { GridTableProps } from "@/types/grid-table";
import DataTable from "./DataTable";
import DataGrid from "./DataGrid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@heroui/react";
import get from "lodash/get";

function GridTableContent<T>({
  emptyMessage,
  create,
  data,
  error,
  loading,
  notChangeRoute,
  title,
  ...rest
}: GridTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localView, setLocalView] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredData = data?.filter((item) =>
    rest.columns.some((column) =>
      String(get(item, column.key, ""))
        .toLocaleLowerCase()
        .includes(normalizedSearch),
    ),
  );

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
        <div style={{ flex: 1, alignContent: "center" }}>
          {create && (
            <Button size="sm" onPress={() => router.push(create)}>
              + Adicionar
            </Button>
          )}
          {title && <h3>{title}</h3>}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar..."
            aria-label="Pesquisar"
            style={{
              padding: "0.5rem",
              border: "0.05rem solid #d0d7de",
              borderRadius: "0.375rem",
            }}
          />

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
      {!filteredData?.length ? (
        <p>{emptyMessage || "Sem dados para mostrar."}</p>
      ) : view === "grid" ? (
        <DataGrid data={filteredData} {...rest} />
      ) : (
        <DataTable data={filteredData} {...rest} />
      )}
    </>
  );
}

export default function GridTable<T>(props: GridTableProps<T>) {
  return (
    <Suspense fallback={<p>A carregar...</p>}>
      <GridTableContent {...props} />
    </Suspense>
  );
}

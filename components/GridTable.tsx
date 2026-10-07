"use client";

import { GridTableProps } from "@/types/grid-table";
import DataTable from "./DataTable";
import DataGrid from "./DataGrid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import get from "lodash/get";
import { Box, Button, ButtonGroup, TextField, Typography } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";

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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, alignContent: "center" }}>
          {create && (
            <Button size="small" onClick={() => router.push(create)}>
              + Adicionar
            </Button>
          )}
          {title && <Typography variant="h6">{title}</Typography>}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar..."
            size="small"
          />
          <ButtonGroup aria-label="Selecionar visualização">
            <Button
              variant={view === "grid" ? "contained" : "outlined"}
              onClick={() => onSetView("grid")}
              aria-label="Grid"
            >
              <GridViewIcon />
            </Button>

            <Button
              variant={view === "table" ? "contained" : "outlined"}
              onClick={() => onSetView("table")}
              aria-label="Tabela"
            >
              <TableRowsIcon />
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {loading && <Typography variant="body1">A carregar dados...</Typography>}
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
      {!filteredData?.length ? (
        <Typography variant="body1">
          {emptyMessage || "Sem dados para mostrar"}
        </Typography>
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
    <Suspense fallback={<Typography variant="body1">A carregar...</Typography>}>
      <GridTableContent {...props} />
    </Suspense>
  );
}

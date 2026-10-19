"use client";

import { GridTableProps } from "@/types/grid-table";
import DataTable from "./DataTable";
import DataGrid from "./DataGrid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import _get from "lodash/get";
import { Box, Button, ButtonGroup, TextField, Typography } from "@mui/material";
import Link from "next/link";
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
      String(_get(item, column.key, ""))
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
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: 1, alignContent: "center" }}>
          {create && (
            <Button component={Link} href={create} variant="outlined">
              + Adicionar
            </Button>
          )}
          {title && <Typography variant="h6">{title}</Typography>}
        </Box>

        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "row",
            gap: 2,
            minWidth: 0,
            [theme.breakpoints.down("sm")]: {
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            },
          })}
        >
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar..."
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
          />
          <ButtonGroup
            aria-label="Selecionar visualização"
            sx={{ flexShrink: 0 }}
          >
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

import { formatDateTime } from "@/lib/utils";
import { DataGridProps } from "@/types/grid-table";
import { Grid, Paper, Typography } from "@mui/material";
import get from "lodash/get";

export default function GridView<T>({
  columns,
  data,
  clickableRow,
}: DataGridProps<T>) {
  return (
    <Grid container spacing={2}>
      {data.map((item, index) => (
        <Grid size={4} key={index}>
          <Paper
            elevation={0}
            onClick={() => clickableRow?.(item)}
            sx={{
              p: 2,
              cursor: clickableRow ? "pointer" : "default",
              height: "100%",

              "&:hover": clickableRow
                ? { borderColor: "primary.main", boxShadow: 2 }
                : undefined,
            }}
          >
            <Grid container spacing={2}>
              {columns.map((column) => {
                const value = get(item, column.key, "");

                const displayValue =
                  column.render?.(item) ??
                  (column.format === "date"
                    ? formatDateTime(value as string)
                    : column.format === "boolean"
                      ? value
                        ? "Sim"
                        : "Não"
                      : String(value));

                return (
                  <Grid size={6} key={column.key}>
                    <Typography variant="caption" color="text.secondary">
                      {column.header}
                    </Typography>

                    <Typography variant="body1" noWrap>
                      {displayValue || "-"}
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

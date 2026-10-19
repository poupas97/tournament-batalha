import { formattedValue } from "@/lib/formattedValue";
import { DataGridProps } from "@/types/grid-table";
import { Grid, Paper, Typography } from "@mui/material";
import _get from "lodash/get";
import Link from "next/link";

export default function DataGrid<T>({ columns, data, href }: DataGridProps<T>) {
  return (
    <Grid container spacing={2}>
      {data.map((item, index) => (
        <Grid
          key={index}
          size={{ xs: 12, sm: 4 }}
          {...{
            component: href ? Link : undefined,
            href: href?.(item),
          }}
          sx={{ textDecoration: "auto" }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              cursor: href ? "pointer" : "default",
              height: "100%",

              "&:hover": href
                ? { borderColor: "primary.main", boxShadow: 2 }
                : undefined,
            }}
          >
            <Grid container spacing={2}>
              {columns.map((column) => {
                const value = _get(item, column.key, "");

                const displayValue =
                  column.render?.(item) ?? formattedValue(value, column.format);

                return (
                  <Grid size={6} key={column.key}>
                    <Typography variant="caption" color="text.secondary">
                      {column.header}
                    </Typography>

                    <Typography variant="body1" noWrap>
                      {displayValue}
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

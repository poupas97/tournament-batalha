import { formattedValue } from "@/lib/formattedValue";
import { DataGridProps } from "@/types/grid-table";
import { Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import _get from "lodash/get";
import Link from "next/link";

const DATA_GRID_SKELETON_GAP = 2;
const DATA_GRID_SKELETON_FIELD_GAP = 1;
const DATA_GRID_SKELETON_CARDS = 6;

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

export function DataGridSkeleton<T>({
  columns,
}: Pick<DataGridProps<T>, "columns">) {
  return (
    <Grid container spacing={DATA_GRID_SKELETON_GAP}>
      {Array.from({ length: DATA_GRID_SKELETON_CARDS }, (_, cardIndex) => (
        <Grid key={cardIndex} size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Grid container spacing={DATA_GRID_SKELETON_FIELD_GAP}>
              {columns.map((column) => (
                <Grid size={6} key={column.key}>
                  <Stack spacing={DATA_GRID_SKELETON_FIELD_GAP}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" height={28} />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

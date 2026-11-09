"use client";

import { formattedValue } from "@/lib/formattedValue";
import { DataTableProps } from "@/types/grid-table";
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import _get from "lodash/get";
import { useRouter } from "next/navigation";

const DATA_TABLE_SKELETON_ROWS = 6;

export default function DataTable<T>({
  columns,
  data,
  href,
}: DataTableProps<T>) {
  const router = useRouter();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  borderBottom: "0.05rem solid",
                  borderBottomColor: "divider.",
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              onClick={() => {
                const hasHref = href?.(item);
                if (hasHref) router.push(hasHref);
              }}
              hover={Boolean(href)}
              sx={href ? { cursor: "pointer" } : undefined}
            >
              {columns.map((it) => {
                const value = _get(item, it.key, "");

                return (
                  <TableCell key={it.key} style={{ padding: "0.75rem" }}>
                    {it.render?.(item) ?? formattedValue(value, it.format)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function DataTableSkeleton<T>({
  columns,
}: Pick<DataTableProps<T>, "columns">) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>
                <Skeleton variant="text" width="70%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: DATA_TABLE_SKELETON_ROWS }, (_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  <Skeleton variant="text" width="90%" height={28} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

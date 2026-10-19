"use client";

import { formattedValue } from "@/lib/formattedValue";
import { DataTableProps } from "@/types/grid-table";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import _get from "lodash/get";
import { useRouter } from "next/navigation";

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

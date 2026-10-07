import { formatDateTime } from "@/lib/utils";
import { DataTableProps } from "@/types/grid-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import get from "lodash/get";

export default function DataTable<T>({
  columns,
  data,
  clickableRow,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.key}
              style={{
                textAlign: "left",
                padding: "1rem",
                borderBottom: "0.05rem solid #d0d7de",
              }}
            >
              {column.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index} onClick={() => clickableRow?.(item)}>
            {columns.map((it) => {
              const value = get(item, it.key, "");

              return (
                <TableCell key={it.key} style={{ padding: "0.75rem" }}>
                  {it.render?.(item) ||
                    (it.format === "date"
                      ? formatDateTime(value as string)
                      : it.format === "boolean"
                        ? value
                          ? "Sim"
                          : "Não"
                        : String(value))}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

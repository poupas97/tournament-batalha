import { formatDateTime } from "@/lib/utils";
import { DataTableProps } from "@/types/grid-table";
import get from "lodash/get";

export default function DataTable<T>({
  columns,
  data,
  clickableRow,
}: DataTableProps<T>) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f6f8fa" }}>
          {columns.map((column) => (
            <th
              key={column.key}
              style={{
                textAlign: "left",
                padding: "1rem",
                borderBottom: "0.05rem solid #d0d7de",
              }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            onClick={() => clickableRow?.(item)}
            style={{
              cursor: clickableRow ? "pointer" : "default",
              borderBottom: "0.05rem solid #eaeef2",
            }}
          >
            {columns.map((it) => {
              const value = get(item, it.key, "");

              return (
                <td key={it.key} style={{ padding: "0.75rem" }}>
                  <>
                    {it.render?.(item) ||
                      (it.format === "date"
                        ? formatDateTime(value as string)
                        : it.format === "boolean"
                          ? value
                            ? "Sim"
                            : "Não"
                          : value)}
                  </>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

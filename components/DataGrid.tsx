import { formatDateTime } from "@/lib/utils";
import { DataGridProps } from "@/types/grid-table";
import get from "lodash/get";

export default function GridView<T>({
  columns,
  data,
  clickableRow,
}: DataGridProps<T>) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "1.5rem",
      }}
    >
      {data.map((item, index) => (
        <div
          key={index}
          onClick={() => clickableRow?.(item)}
          className={`flex flex-col rounded-lg border border-slate-300 bg-white p-4 transition-colors ${
            clickableRow
              ? "cursor-pointer hover:bg-slate-50 hover:border-slate-400"
              : ""
          }`}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "1rem",
            }}
          >
            {columns.map((column) => {
              const value = get(item, column.key, "");

              return (
                <div
                  key={column.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {column.header}
                  </span>

                  <span
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column.render?.(item) ??
                      (column.format === "date"
                        ? formatDateTime(value as string)
                        : column.format === "boolean"
                          ? value
                            ? "Sim"
                            : "Não"
                          : String(value))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

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
          style={{
            border: "0.05rem solid #d0d7de",
            borderRadius: "0.5rem",
            background: "#fff",
            padding: "1rem",
            cursor: clickableRow ? "pointer" : "default",
            display: "flex",
            flexDirection: "column",
          }}
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

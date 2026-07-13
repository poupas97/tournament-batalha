import get from "lodash/get";

type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "Sem dados para mostrar.",
}: DataTableProps<T>) {
  if (!data.length) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f6f8fa" }}>
          {columns.map((column) => (
            <th
              key={column.key}
              style={{
                textAlign: "left",
                padding: "0.75rem",
                borderBottom: "1px solid #d0d7de",
              }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} style={{ borderBottom: "1px solid #eaeef2" }}>
            {columns.map((column) => (
              <td key={column.key} style={{ padding: "0.75rem" }}>
                <>
                  {column.render
                    ? column.render(item)
                    : get(item, column.key, "")}
                </>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

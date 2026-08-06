export type GridTableColumn<T> = {
  key: string;
  header: string;
  format?: "date" | "boolean";
  render?: (item: T) => React.ReactNode;
};

type Props<T extends Record<string, unknown>> = {
  columns: GridTableColumn<T>[];
  error: string | undefined;
  loading: boolean;
  data: T[] | undefined;
  emptyMessage?: string;
  clickableRow?: (item: T) => void;
  create?: string;
  notChangeRoute?: boolean;
};

export type GridTableProps<T> = Props<T>;
export type DataGridProps<T> = Omit<
  Props<T>,
  "emptyMessage" | "create" | "error" | "loading" | "data" | "notChangeRoute"
> & { data: T[] };
export type DataTableProps<T> = Omit<
  Props<T>,
  "emptyMessage" | "create" | "error" | "loading" | "data" | "notChangeRoute"
> & { data: T[] };

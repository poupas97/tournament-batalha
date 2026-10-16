import ColorSwatch from "@/components/ColorSwatch";
import { formatDate, formatDateTime } from "@/lib/date";

export function formattedValue<T>(
  value: unknown,
  format?: "date" | "datetime" | "boolean" | "json" | "color",
) {
  switch (format) {
    case "color":
      return typeof value === "string" ? <ColorSwatch color={value} /> : "";

    case "date":
      return formatDate(value as string | undefined);

    case "datetime":
      return formatDateTime(value as string | undefined);

    case "boolean":
      return value ? "Sim" : "Não";

    case "json":
      return JSON.stringify(value, null, 2);

    default:
      return String(value || "-");
  }
}

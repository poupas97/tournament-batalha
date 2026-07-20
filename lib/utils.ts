export function formatDateTime(date: Date | string | undefined) {
  if (!date) return undefined;

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

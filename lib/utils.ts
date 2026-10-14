export function formatDateTime(date: Date | string | undefined) {
  if (!date) return undefined;

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfCalendar(date: Date) {
  const monthStart = startOfMonth(date);
  const day = monthStart.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  const result = new Date(monthStart);
  result.setDate(monthStart.getDate() + diff);

  return result;
}

function endOfCalendar(date: Date) {
  const monthEnd = endOfMonth(date);
  const day = monthEnd.getDay();

  const diff = day === 0 ? 0 : 7 - day;

  const result = new Date(monthEnd);
  result.setDate(monthEnd.getDate() + diff);

  return result;
}

export function getCalendarDays(date: Date) {
  const start = startOfCalendar(date);
  const end = endOfCalendar(date);

  const days: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isSameMonth(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth()
  );
}

export function formatMonth(date: Date) {
  return date.toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

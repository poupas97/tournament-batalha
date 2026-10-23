const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "short",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "short",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
});

const weekDayAndDateFormatter = new Intl.DateTimeFormat("pt-PT", {
  weekday: "short",
  day: "numeric",
});

const dayNumberFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
});

const shortMonthFormatter = new Intl.DateTimeFormat("pt-PT", {
  month: "short",
});

const yearFormatter = new Intl.DateTimeFormat("pt-PT", {
  year: "numeric",
});

export function formatDateTime(date: Date | string | undefined) {
  if (!date) return undefined;

  return dateTimeFormatter.format(new Date(date));
}

export function formatDate(date: Date | string | undefined) {
  if (!date) return undefined;

  return dateFormatter.format(new Date(date));
}

export function getWeekDays(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
}

export function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatWeekRange(first: Date, last: Date) {
  const firstDay = dayNumberFormatter.format(first);
  const lastDay = dayNumberFormatter.format(last);
  const firstMonth = shortMonthFormatter.format(first);
  const lastMonth = shortMonthFormatter.format(last);
  const year = yearFormatter.format(last);
  const firstYear = yearFormatter.format(first);

  if (first.getMonth() === last.getMonth()) {
    return `${firstDay}–${lastDay} ${lastMonth} ${year}`;
  }

  if (firstYear !== year) {
    return `${firstDay} ${firstMonth} ${firstYear} – ${lastDay} ${lastMonth} ${year}`;
  }

  return `${firstDay} ${firstMonth} – ${lastDay} ${lastMonth} ${year}`;
}

export function formatWeekDayAndDate(date: Date) {
  return weekDayAndDateFormatter.format(date);
}

export function formatTime(date: Date | string) {
  return timeFormatter.format(new Date(date));
}

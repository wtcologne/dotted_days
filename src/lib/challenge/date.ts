const monthFormatter = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
});

export type CalendarDay = {
  day: number | null;
  key: string;
};

export type MonthStatus = "past" | "current" | "future";

export const DEFAULT_MONTHS_BACK = 3;
export const DEFAULT_MONTHS_FORWARD = 6;

export function getCurrentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = parseMonthKey(monthKey);
  const date = new Date(year, month - 1, 1);

  return monthFormatter.format(date);
}

export function getDaysInMonth(monthKey: string): number {
  const [year, month] = parseMonthKey(monthKey);

  return new Date(year, month, 0).getDate();
}

export function addMonths(monthKey: string, offset: number): string {
  const [year, month] = parseMonthKey(monthKey);
  const date = new Date(year, month - 1 + offset, 1);

  return getCurrentMonthKey(date);
}

export function getMonthRange(
  monthsBack = DEFAULT_MONTHS_BACK,
  monthsForward = DEFAULT_MONTHS_FORWARD,
): string[] {
  const currentMonth = getCurrentMonthKey();

  return Array.from({ length: monthsBack + monthsForward + 1 }, (_, index) =>
    addMonths(currentMonth, index - monthsBack),
  );
}

export function getMonthStatus(monthKey: string, currentMonth = getCurrentMonthKey()): MonthStatus {
  if (monthKey === currentMonth) {
    return "current";
  }

  return monthKey < currentMonth ? "past" : "future";
}

export function getTodayDay(monthKey: string, date = new Date()): number | null {
  if (getCurrentMonthKey(date) !== monthKey) {
    return null;
  }

  return date.getDate();
}

export function getCalendarDays(monthKey: string): CalendarDay[] {
  const [year, month] = parseMonthKey(monthKey);
  const daysInMonth = getDaysInMonth(monthKey);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const leadingDays = Array.from({ length: mondayOffset }, (_, index) => ({
    day: null,
    key: `empty-${index}`,
  }));
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;

    return {
      day,
      key: `${monthKey}-${day}`,
    };
  });

  return [...leadingDays, ...monthDays];
}

export function normalizeDoneDays(days: number[], monthKey: string): number[] {
  const daysInMonth = getDaysInMonth(monthKey);
  const uniqueDays = new Set(
    days.filter((day) => Number.isInteger(day) && day >= 1 && day <= daysInMonth),
  );

  return Array.from(uniqueDays).sort((left, right) => left - right);
}

export function getStorageKey(monthKey = getCurrentMonthKey()): string {
  return `monthly-challenge:${monthKey}`;
}

function parseMonthKey(monthKey: string): [number, number] {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    const fallback = new Date();

    return [fallback.getFullYear(), fallback.getMonth() + 1];
  }

  return [year, month];
}

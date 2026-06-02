import { getDaysInMonth, getTodayDay } from "./date";

export function calculateCurrentStreak(doneDays: number[], monthKey: string): number {
  const today = getTodayDay(monthKey);

  if (today === null) {
    return 0;
  }

  const daysInMonth = getDaysInMonth(monthKey);
  const done = new Set(doneDays);
  let streak = 0;

  for (let day = Math.min(today, daysInMonth); day >= 1; day -= 1) {
    if (!done.has(day)) {
      break;
    }

    streak += 1;
  }

  return streak;
}

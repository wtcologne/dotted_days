"use client";

import { getCalendarDays, getTodayDay } from "@/lib/challenge/date";
import { ProgressBar } from "./ProgressBar";

const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type MonthCalendarProps = {
  month: string;
  doneDays: number[];
  maxToggleDay: number;
  progressRatio: number;
  onToggleDay(day: number): void;
};

export function MonthCalendar({
  month,
  doneDays,
  maxToggleDay,
  progressRatio,
  onToggleDay,
}: MonthCalendarProps) {
  const calendarDays = getCalendarDays(month);
  const today = getTodayDay(month);
  const done = new Set(doneDays);

  return (
    <section className="rounded-[2rem] border border-white/70 bg-paper/75 p-4 shadow-soft backdrop-blur">
      <div className="grid grid-cols-7 gap-1.5 text-center text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted">
        {weekDays.map((weekDay) => (
          <div key={weekDay}>{weekDay}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {calendarDays.map((calendarDay) =>
          calendarDay.day === null ? (
            <div key={calendarDay.key} aria-hidden="true" />
          ) : (
            <CalendarDayButton
              key={calendarDay.key}
              day={calendarDay.day}
              isDone={done.has(calendarDay.day)}
              isToday={calendarDay.day === today}
              isDisabled={calendarDay.day > maxToggleDay}
              onToggleDay={onToggleDay}
            />
          ),
        )}
      </div>

      <div className="mt-4">
        <ProgressBar value={progressRatio} />
      </div>
    </section>
  );
}

type CalendarDayButtonProps = {
  day: number;
  isDone: boolean;
  isToday: boolean;
  isDisabled: boolean;
  onToggleDay(day: number): void;
};

function CalendarDayButton({
  day,
  isDone,
  isToday,
  isDisabled,
  onToggleDay,
}: CalendarDayButtonProps) {
  const handleClick = () => {
    onToggleDay(day);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-pressed={isDone}
      aria-label={`${day}. Tag ${getDayLabel(isDone, isDisabled)}`}
      className={getDayClassName(isDone, isToday, isDisabled)}
    >
      {day}
    </button>
  );
}

function getDayClassName(isDone: boolean, isToday: boolean, isDisabled: boolean): string {
  const base =
    "aspect-square min-h-10 rounded-2xl text-sm font-semibold transition duration-200 active:scale-95 disabled:active:scale-100";
  const state = isDisabled
    ? "cursor-not-allowed bg-[#F6F0E8] text-muted/35"
    : isDone
    ? "bg-sage text-white shadow-[0_8px_18px_rgba(94,141,106,0.22)]"
    : "bg-[#F2EBE1] text-ink/70 hover:bg-[#ECE2D7]";
  const today = isToday ? "ring-2 ring-sageDeep/45 ring-offset-2 ring-offset-paper" : "";

  return [base, state, today].filter(Boolean).join(" ");
}

function getDayLabel(isDone: boolean, isDisabled: boolean): string {
  if (isDisabled) {
    return "liegt in der Zukunft";
  }

  return isDone ? "erledigt" : "offen";
}

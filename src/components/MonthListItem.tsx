"use client";

import { getMonthLabel, getTodayDay } from "@/lib/challenge/date";
import type { ChallengeOverviewItem } from "@/lib/challenge/use-challenge-overview";

type MonthListItemProps = {
  item: ChallengeOverviewItem;
  onSelectMonth(month: string): void;
};

export function MonthListItem({ item, onSelectMonth }: MonthListItemProps) {
  const { challenge, daysInMonth, progress, progressRatio, status } = item;
  const title = challenge.title.trim() || "Neue Challenge";
  const isCurrent = status === "current";
  const isFuture = status === "future";
  const doneDays = new Set(challenge.doneDays);
  const today = getTodayDay(challenge.month);

  const handleClick = () => {
    onSelectMonth(challenge.month);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "w-full rounded-[1.75rem] border p-4 text-left shadow-[0_14px_36px_rgba(72,55,40,0.06)] transition active:scale-[0.99]",
        isCurrent
          ? "border-sageDeep/35 bg-paper ring-2 ring-sageDeep/15"
          : "border-white/70 bg-paper/70",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold capitalize tracking-[-0.02em] text-ink">
            {getMonthLabel(challenge.month)}
          </p>
          <h2
            className={[
              "mt-1 truncate text-xl font-semibold tracking-[-0.055em]",
              challenge.title.trim() ? "text-ink" : "text-muted",
            ].join(" ")}
          >
            {title}
          </h2>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            getStatusClassName(status),
          ].join(" ")}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>{isFuture ? "Noch nicht gestartet" : `${progress}/${daysInMonth} Tagen`}</span>
        <span>{Math.round(progressRatio * 100)}%</span>
      </div>

      <MonthDayStrip daysInMonth={daysInMonth} doneDays={doneDays} status={status} today={today} />
    </button>
  );
}

type MonthDayStripProps = {
  daysInMonth: number;
  doneDays: Set<number>;
  status: ChallengeOverviewItem["status"];
  today: number | null;
};

function MonthDayStrip({ daysInMonth, doneDays, status, today }: MonthDayStripProps) {
  return (
    <div className="mt-3 flex gap-1" aria-hidden="true">
      {Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;

        return <span key={day} className={getDayMarkerClassName(day, doneDays, status, today)} />;
      })}
    </div>
  );
}

function getStatusLabel(status: ChallengeOverviewItem["status"]): string {
  if (status === "current") {
    return "Aktuell";
  }

  if (status === "future") {
    return "Geplant";
  }

  return "Vergangen";
}

function getStatusClassName(status: ChallengeOverviewItem["status"]): string {
  if (status === "current") {
    return "bg-sageSoft text-sageDeep";
  }

  if (status === "future") {
    return "bg-[#F4EDE4] text-ink/60";
  }

  return "bg-[#EEE4D8] text-muted";
}

function getDayMarkerClassName(
  day: number,
  doneDays: Set<number>,
  status: ChallengeOverviewItem["status"],
  today: number | null,
): string {
  const base = "h-2.5 flex-1 rounded-[0.35rem]";

  if (doneDays.has(day)) {
    return `${base} bg-sage`;
  }

  if (status === "past" || (status === "current" && today !== null && day < today)) {
    return `${base} bg-[#D98B7E]`;
  }

  return `${base} bg-[#E7DDD2]`;
}

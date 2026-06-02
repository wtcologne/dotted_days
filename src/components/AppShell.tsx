"use client";

import type { PointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { ChallengeSuggestions } from "@/components/ChallengeSuggestions";
import { ChallengeTitle } from "@/components/ChallengeTitle";
import { MonthOverview } from "@/components/MonthOverview";
import { MonthCalendar } from "@/components/MonthCalendar";
import { StatsCards } from "@/components/StatsCards";
import { TodayButton } from "@/components/TodayButton";
import { getCurrentMonthKey, getMonthLabel } from "@/lib/challenge/date";
import { createChallengeRepository } from "@/lib/challenge/repository";
import { SupabaseChallengeRepository } from "@/lib/challenge/supabase-repository";
import type { ChallengeRepository } from "@/lib/challenge/types";
import { useChallengeOverview } from "@/lib/challenge/use-challenge-overview";
import { useChallengeMonth } from "@/lib/challenge/use-current-challenge";
import { useSupabaseAuth } from "@/lib/supabase/use-supabase-auth";
import { useTheme } from "@/lib/theme/use-theme";

export function AppShell() {
  const [view, setView] = useState<"overview" | "detail">("overview");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey);
  const [scrollTargetMonth, setScrollTargetMonth] = useState<string | null>(null);
  const auth = useSupabaseAuth();
  const theme = useTheme();
  const repository = useMemo<ChallengeRepository>(() => {
    if (auth.supabase && auth.user) {
      return new SupabaseChallengeRepository(auth.supabase, auth.user.id);
    }

    return createChallengeRepository();
  }, [auth.supabase, auth.user]);
  const overview = useChallengeOverview(repository);

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setScrollTargetMonth(null);
    setView("detail");
  };

  const handleBackToOverview = () => {
    setScrollTargetMonth(selectedMonth);
    setView("overview");
    void overview.refresh();
  };

  if (view === "overview") {
    return (
      <MonthOverview
        items={overview.items}
        isLoading={overview.isLoading}
        scrollTargetMonth={scrollTargetMonth}
        auth={auth}
        theme={theme}
        onSelectMonth={handleSelectMonth}
      />
    );
  }

  return (
    <ChallengeDetail
      month={selectedMonth}
      repository={repository}
      onBack={handleBackToOverview}
    />
  );
}

type ChallengeDetailProps = {
  month: string;
  repository: ChallengeRepository;
  onBack(): void;
};

function ChallengeDetail({ month, repository, onBack }: ChallengeDetailProps) {
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const {
    challenge,
    daysInMonth,
    progress,
    progressRatio,
    streak,
    todayDone,
    maxToggleDay,
    isLoading,
    updateTitle,
    toggleToday,
    toggleDay,
    resetMonth,
    status,
  } = useChallengeMonth(month, repository);

  const handleResetClick = () => {
    const shouldReset = window.confirm("Diesen Monat wirklich zurücksetzen?");

    if (shouldReset) {
      void resetMonth();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || event.clientX > 44) {
      swipeStartRef.current = null;
      return;
    }

    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;

    if (!start) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = Math.abs(event.clientY - start.y);

    if (deltaX > 86 && deltaY < 64) {
      onBack();
    }
  };

  const handlePointerCancel = () => {
    swipeStartRef.current = null;
  };

  const isCurrentMonth = status === "current";
  const isFutureMonth = status === "future";

  if (isLoading || !challenge) {
    return <AppLoading />;
  }

  const hasTitle = challenge.title.trim().length > 0;
  const showChallengeComposer = isFutureMonth || !hasTitle;

  return (
    <main
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="mx-auto flex min-h-svh w-full max-w-md touch-pan-y flex-col px-4 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))] pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))]"
    >
      <div className="flex flex-1 flex-col gap-5">
        <header className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 rounded-full border border-line/80 bg-paper/65 px-4 text-sm font-semibold text-muted shadow-[0_10px_28px_rgba(72,55,40,0.06)] backdrop-blur transition active:scale-95"
          >
            Monate
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold capitalize tracking-[-0.02em] text-ink">
              {getMonthLabel(challenge.month)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted">{getStatusLabel(status)}</p>
          </div>
          <button
            type="button"
            onClick={handleResetClick}
            className="min-h-11 rounded-full border border-line/80 bg-paper/65 px-4 text-sm font-semibold text-muted shadow-[0_10px_28px_rgba(72,55,40,0.06)] backdrop-blur transition active:scale-95"
          >
            Reset
          </button>
        </header>

        {hasTitle ? <ChallengeTitle title={challenge.title} onTitleChange={updateTitle} /> : null}

        {showChallengeComposer ? (
          <ChallengeSuggestions
            title={challenge.title}
            buttonLabel={hasTitle ? "Challenge ändern" : "Neue Challenge"}
            onAcceptTitle={updateTitle}
          />
        ) : null}

        {isFutureMonth ? (
          <PlanningCard hasTitle={hasTitle} />
        ) : (
          <StatsCards progress={progress} daysInMonth={daysInMonth} streak={streak} />
        )}

        {isCurrentMonth ? <TodayButton isDone={todayDone} onToggleToday={toggleToday} /> : null}

        {!isFutureMonth ? (
          <MonthCalendar
            month={challenge.month}
            doneDays={challenge.doneDays}
            maxToggleDay={maxToggleDay}
            progressRatio={progressRatio}
            onToggleDay={toggleDay}
          />
        ) : null}
      </div>
    </main>
  );
}

type PlanningCardProps = {
  hasTitle: boolean;
};

function PlanningCard({ hasTitle }: PlanningCardProps) {
  return (
    <section className="rounded-[1.65rem] border border-white/70 bg-paper/70 p-4 shadow-[0_14px_36px_rgba(72,55,40,0.06)] backdrop-blur">
      <div className="text-3xl font-semibold tracking-[-0.06em] text-ink">
        {hasTitle ? "Geplant" : "Bereit"}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {hasTitle ? "Startet in diesem Monat" : "Wähle deine Challenge"}
      </div>
    </section>
  );
}

function getStatusLabel(status: "past" | "current" | "future"): string {
  if (status === "current") {
    return "Aktueller Monat";
  }

  if (status === "future") {
    return "Geplanter Monat";
  }

  return "Vergangener Monat";
}

function AppLoading() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 text-sm font-medium text-muted">
      Monthly Challenge
    </main>
  );
}

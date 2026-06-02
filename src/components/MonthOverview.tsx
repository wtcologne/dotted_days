"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_MONTHS_FORWARD } from "@/lib/challenge/date";
import type { ChallengeOverviewItem } from "@/lib/challenge/use-challenge-overview";
import type { SupabaseAuthState } from "@/lib/supabase/use-supabase-auth";
import type { ThemeState } from "@/lib/theme/use-theme";
import { AccountMenu } from "./AccountMenu";
import { MonthListItem } from "./MonthListItem";

type MonthOverviewProps = {
  items: ChallengeOverviewItem[];
  isLoading: boolean;
  scrollTargetMonth: string | null;
  auth: SupabaseAuthState;
  theme: ThemeState;
  onSelectMonth(month: string): void;
};

export function MonthOverview({
  items,
  isLoading,
  scrollTargetMonth,
  auth,
  theme,
  onSelectMonth,
}: MonthOverviewProps) {
  const scrollTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || !scrollTargetMonth) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      scrollTargetRef.current?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [isLoading, items, scrollTargetMonth]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 text-sm font-medium text-muted">
        Monatsübersicht
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-md px-4 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))] pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))]">
      <header className="sticky top-0 z-10 -mx-4 bg-cream/90 px-4 pb-4 pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))] backdrop-blur">
        <h1 className="text-[2.7rem] font-semibold leading-none tracking-[-0.08em] text-ink">
          Dotted Days
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          Übersicht
        </p>
        <p className="mt-2 max-w-64 text-sm leading-5 text-muted">
          Plane die nächsten {DEFAULT_MONTHS_FORWARD} Monate und behalte deinen aktuellen Fokus
          im Blick.
        </p>
      </header>

      <div className="mb-3">
        <AccountMenu auth={auth} theme={theme} />
      </div>

      <section className="space-y-3 pb-4" aria-label="Monatsliste">
        {items.map((item) => (
          <div
            key={item.challenge.month}
            ref={item.challenge.month === scrollTargetMonth ? scrollTargetRef : null}
            className="scroll-mt-28"
          >
            <MonthListItem item={item} onSelectMonth={onSelectMonth} />
          </div>
        ))}
      </section>
    </main>
  );
}

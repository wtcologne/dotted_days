"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_MONTHS_FORWARD } from "@/lib/challenge/date";
import type { ChallengeOverviewItem } from "@/lib/challenge/use-challenge-overview";
import type { SupabaseAuthState } from "@/lib/supabase/use-supabase-auth";
import { AccountMenu } from "./AccountMenu";
import { MonthListItem } from "./MonthListItem";

type MonthOverviewProps = {
  items: ChallengeOverviewItem[];
  isLoading: boolean;
  scrollTargetMonth: string | null;
  auth: SupabaseAuthState;
  onSelectMonth(month: string): void;
};

export function MonthOverview({
  items,
  isLoading,
  scrollTargetMonth,
  auth,
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
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="sticky top-0 z-10 -mx-4 bg-cream/85 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
        <p className="text-sm font-semibold text-muted">Monthly Challenge</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-[-0.075em] text-ink">Monate</h1>
        <p className="mt-2 max-w-64 text-sm leading-5 text-muted">
          Plane die nächsten {DEFAULT_MONTHS_FORWARD} Monate und behalte deinen aktuellen Fokus
          im Blick.
        </p>
      </header>

      <div className="mb-3">
        <AccountMenu auth={auth} />
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

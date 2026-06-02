"use client";

import { getMonthLabel } from "@/lib/challenge/date";
import type { SupabaseChallengeRepository } from "@/lib/challenge/supabase-repository";
import { useSharedChallenge } from "@/lib/challenge/use-shared-challenge";
import { MonthCalendar } from "./MonthCalendar";
import { TodayButton } from "./TodayButton";

type SharedChallengeDetailProps = {
  challengeId: string;
  repository: SupabaseChallengeRepository;
  onBack(): void;
};

export function SharedChallengeDetail({
  challengeId,
  repository,
  onBack,
}: SharedChallengeDetailProps) {
  const {
    challenge,
    daysInMonth,
    progress,
    progressRatio,
    todayDone,
    maxToggleDay,
    isLoading,
    toggleToday,
    toggleDay,
  } = useSharedChallenge(challengeId, repository);

  const handleCopyInvite = async () => {
    if (!challenge) {
      return;
    }

    await window.navigator.clipboard.writeText(`${window.location.origin}/join/${challenge.inviteCode}`);
  };

  if (isLoading || !challenge) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-md items-center justify-center px-4 text-sm font-medium text-muted">
        Gemeinsame Challenge
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-4 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))] pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))]">
      <div className="flex flex-1 flex-col gap-5">
        <header className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 rounded-full border border-line/80 bg-paper/65 px-4 text-sm font-semibold text-muted shadow-[0_10px_28px_rgba(72,55,40,0.06)] backdrop-blur transition active:scale-95"
          >
            Zurück
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold capitalize tracking-[-0.02em] text-ink">
              {getMonthLabel(challenge.month)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted">Gemeinsam</p>
          </div>
          <button
            type="button"
            onClick={handleCopyInvite}
            className="min-h-11 rounded-full border border-line/80 bg-paper/65 px-4 text-sm font-semibold text-muted shadow-[0_10px_28px_rgba(72,55,40,0.06)] backdrop-blur transition active:scale-95"
          >
            Teilen
          </button>
        </header>

        <section className="rounded-[1.8rem] border border-white/70 bg-paper/70 p-5 shadow-[0_14px_36px_rgba(72,55,40,0.06)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {challenge.memberCount} dabei · heute {challenge.todayDoneCount}/{challenge.memberCount}
          </p>
          <h1 className="mt-2 text-[2.25rem] font-semibold leading-none tracking-[-0.075em] text-ink">
            {challenge.title}
          </h1>
          <p className="mt-4 text-sm text-muted">
            Dein Fortschritt: {progress}/{daysInMonth} Tage
          </p>
        </section>

        <TodayButton isDone={todayDone} onToggleToday={toggleToday} />

        <MonthCalendar
          month={challenge.month}
          doneDays={challenge.doneDays}
          maxToggleDay={maxToggleDay}
          progressRatio={progressRatio}
          onToggleDay={toggleDay}
        />
      </div>
    </main>
  );
}

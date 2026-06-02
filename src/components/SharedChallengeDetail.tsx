"use client";

import { useMemo, useState } from "react";
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
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);
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
  const inviteLink = useMemo(() => {
    if (!challenge?.inviteCode || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/join/${challenge.inviteCode}`;
  }, [challenge?.inviteCode]);
  const isOwner = challenge?.currentUserRole === "owner";

  const handleCopyInvite = async () => {
    if (!inviteLink) {
      return;
    }

    await window.navigator.clipboard.writeText(inviteLink);
    setCopyMessage("Invite-Link kopiert.");
  };

  const handleShareInvite = async () => {
    if (!inviteLink) {
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: "Dotted Days Challenge",
        text: `Mach bei "${challenge?.title}" mit.`,
        url: inviteLink,
      });
      return;
    }

    await handleCopyInvite();
  };

  const handleRemoveChallenge = async () => {
    if (!challenge) {
      return;
    }

    const confirmMessage = isOwner
      ? "Diese gemeinsame Challenge wirklich für alle löschen?"
      : "Diese gemeinsame Challenge wirklich verlassen?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (isOwner) {
        await repository.deleteSharedChallenge(challenge.id);
      } else {
        await repository.leaveSharedChallenge(challenge.id);
      }

      onBack();
    } catch {
      setRemoveMessage("Die Challenge konnte nicht entfernt werden.");
    }
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

        <section className="rounded-[1.65rem] border border-white/70 bg-paper/70 p-4 shadow-[0_14px_36px_rgba(72,55,40,0.06)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Invite-Link</p>
              <p className="mt-0.5 text-xs text-muted">Kopieren und per WhatsApp verschicken</p>
            </div>
            <button
              type="button"
              onClick={handleShareInvite}
              className="min-h-10 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition active:scale-95"
            >
              Teilen
            </button>
          </div>

          {inviteLink ? (
            <div className="mt-3 flex gap-2">
              <input
                readOnly
                value={inviteLink}
                className="min-h-12 min-w-0 flex-1 rounded-[1.15rem] border border-line/70 bg-input px-3 text-sm font-medium text-muted outline-none"
                aria-label="Invite-Link"
              />
              <button
                type="button"
                onClick={handleCopyInvite}
                className="min-h-12 rounded-[1.15rem] bg-sageDeep px-4 text-sm font-semibold text-white transition active:scale-95"
              >
                Kopieren
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-5 text-muted">
              Für diese Challenge fehlt noch ein Invite-Code. Erstelle sie bitte neu.
            </p>
          )}

          {copyMessage ? <p className="mt-2 text-sm text-muted">{copyMessage}</p> : null}
        </section>

        <TodayButton isDone={todayDone} onToggleToday={toggleToday} />

        <MonthCalendar
          month={challenge.month}
          doneDays={challenge.doneDays}
          maxToggleDay={maxToggleDay}
          progressRatio={progressRatio}
          onToggleDay={toggleDay}
        />

        <section className="rounded-[1.65rem] border border-line/70 bg-paper/55 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Challenge entfernen</p>
              <p className="mt-0.5 text-xs text-muted">
                {isOwner
                  ? "Löscht sie für alle Teilnehmer"
                  : "Du trittst aus dieser Challenge aus"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveChallenge}
              className="min-h-10 rounded-full bg-missed px-4 text-sm font-semibold text-white transition active:scale-95"
            >
              Entfernen
            </button>
          </div>
          {removeMessage ? <p className="mt-2 text-sm text-muted">{removeMessage}</p> : null}
        </section>
      </div>
    </main>
  );
}

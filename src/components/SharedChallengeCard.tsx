"use client";

import type { SharedChallengeSummary } from "@/lib/challenge/types";

type SharedChallengeCardProps = {
  challenge: SharedChallengeSummary;
  onSelectChallenge(challengeId: string): void;
};

export function SharedChallengeCard({
  challenge,
  onSelectChallenge,
}: SharedChallengeCardProps) {
  const handleClick = () => {
    onSelectChallenge(challenge.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-[1.35rem] border border-line/70 bg-paper/70 p-3 text-left transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-[-0.04em] text-ink">
            {challenge.title}
          </p>
          <p className="mt-1 text-xs text-muted">
            {challenge.memberCount} dabei · heute {challenge.todayDoneCount}/
            {challenge.memberCount}
          </p>
        </div>
        <span className="rounded-full bg-sageSoft px-2.5 py-1 text-xs font-semibold text-sageDeep">
          {challenge.doneDays.length}
        </span>
      </div>
    </button>
  );
}

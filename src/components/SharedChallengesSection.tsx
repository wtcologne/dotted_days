"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import type { SupabaseChallengeRepository } from "@/lib/challenge/supabase-repository";
import type { SharedChallengeSummary } from "@/lib/challenge/types";
import { useSharedChallenges } from "@/lib/challenge/use-shared-challenges";
import { SharedChallengeCard } from "./SharedChallengeCard";

type SharedChallengesSectionProps = {
  month: string;
  repository: SupabaseChallengeRepository | null;
  onSelectChallenge(challengeId: string): void;
};

export function SharedChallengesSection({
  month,
  repository,
  onSelectChallenge,
}: SharedChallengesSectionProps) {
  const { sharedChallenges, isLoading, createSharedChallenge } = useSharedChallenges(
    month,
    repository,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");

  const handleToggleCreate = () => {
    setIsCreating((current) => !current);
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();

    if (!nextTitle) {
      return;
    }

    const challenge = await createSharedChallenge(nextTitle);
    setTitle("");
    setIsCreating(false);

    if (challenge) {
      onSelectChallenge(challenge.id);
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-paper/65 p-4 shadow-[0_14px_36px_rgba(72,55,40,0.05)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Gemeinsam</p>
          <p className="mt-0.5 text-xs text-muted">{getSubtitle(repository, sharedChallenges)}</p>
        </div>
        {repository ? (
          <button
            type="button"
            onClick={handleToggleCreate}
            className="min-h-10 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition active:scale-95"
          >
            Teilen
          </button>
        ) : null}
      </div>

      {!repository ? (
        <p className="mt-3 text-sm leading-5 text-muted">
          Melde dich an, um Challenges mit anderen zu teilen.
        </p>
      ) : null}

      {isCreating ? (
        <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
          <label className="block min-w-0 flex-1">
            <span className="sr-only">Gemeinsame Challenge</span>
            <input
              value={title}
              onChange={handleTitleChange}
              maxLength={120}
              placeholder="Gemeinsame Challenge"
              className="min-h-12 w-full rounded-[1.15rem] border border-line/70 bg-input px-4 text-sm font-semibold text-ink outline-none placeholder:text-muted/50 focus:border-sageDeep/40 focus:ring-2 focus:ring-sageDeep/10"
            />
          </label>
          <button
            type="submit"
            disabled={title.trim().length === 0}
            className="min-h-12 rounded-[1.15rem] bg-sageDeep px-4 text-sm font-semibold text-white disabled:bg-muted/35"
          >
            OK
          </button>
        </form>
      ) : null}

      {repository && !isLoading && sharedChallenges.length > 0 ? (
        <div className="mt-3 space-y-2">
          {sharedChallenges.slice(0, 3).map((challenge) => (
            <SharedChallengeCard
              key={challenge.id}
              challenge={challenge}
              onSelectChallenge={onSelectChallenge}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function getSubtitle(
  repository: SupabaseChallengeRepository | null,
  sharedChallenges: SharedChallengeSummary[],
): string {
  if (!repository) {
    return "Nur mit Account verfügbar";
  }

  if (sharedChallenges.length === 0) {
    return "Erstelle eine Challenge zum Einladen";
  }

  return `${sharedChallenges.length} gemeinsame Challenge${sharedChallenges.length === 1 ? "" : "s"}`;
}

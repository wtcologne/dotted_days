"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseChallengeRepository } from "./supabase-repository";
import type { SharedChallengeSummary } from "./types";

type SharedChallengesState = {
  sharedChallenges: SharedChallengeSummary[];
  isLoading: boolean;
  createSharedChallenge(title: string): Promise<SharedChallengeSummary | null>;
  refresh(): Promise<void>;
};

export function useSharedChallenges(
  month: string,
  repository: SupabaseChallengeRepository | null,
): SharedChallengesState {
  const [sharedChallenges, setSharedChallenges] = useState<SharedChallengeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(repository));

  const refresh = useCallback(async () => {
    if (!repository) {
      setSharedChallenges([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const nextSharedChallenges = await repository.listSharedChallenges(month);
    setSharedChallenges(nextSharedChallenges);
    setIsLoading(false);
  }, [month, repository]);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      if (!repository) {
        if (isMounted) {
          setSharedChallenges([]);
          setIsLoading(false);
        }
        return;
      }

      const nextSharedChallenges = await repository.listSharedChallenges(month);

      if (isMounted) {
        setSharedChallenges(nextSharedChallenges);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [month, repository]);

  const createSharedChallenge = useCallback(
    async (title: string) => {
      if (!repository) {
        return null;
      }

      const challenge = await repository.createSharedChallenge(month, title);
      await refresh();

      return challenge;
    },
    [month, refresh, repository],
  );

  return {
    sharedChallenges,
    isLoading,
    createSharedChallenge,
    refresh,
  };
}

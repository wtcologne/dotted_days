"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDaysInMonth,
  getMonthRange,
  getMonthStatus,
  normalizeDoneDays,
} from "./date";
import { createChallengeRepository } from "./repository";
import type { Challenge } from "./types";

export type ChallengeOverviewItem = {
  challenge: Challenge;
  daysInMonth: number;
  progress: number;
  progressRatio: number;
  status: "past" | "current" | "future";
};

type ChallengeOverviewState = {
  items: ChallengeOverviewItem[];
  isLoading: boolean;
  refresh(): Promise<void>;
};

const repository = createChallengeRepository();

export function useChallengeOverview(): ChallengeOverviewState {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const overviewChallenges = await loadOverviewChallenges();
    setChallenges(overviewChallenges);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      const overviewChallenges = await loadOverviewChallenges();

      if (isMounted) {
        setChallenges(overviewChallenges);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(
    () =>
      challenges.map((challenge) => {
        const daysInMonth = getDaysInMonth(challenge.month);
        const doneDays = normalizeDoneDays(challenge.doneDays, challenge.month);
        const progress = doneDays.length;

        return {
          challenge: {
            ...challenge,
            doneDays,
          },
          daysInMonth,
          progress,
          progressRatio: daysInMonth > 0 ? progress / daysInMonth : 0,
          status: getMonthStatus(challenge.month),
        };
      }),
    [challenges],
  );

  return {
    items,
    isLoading,
    refresh,
  };
}

async function loadOverviewChallenges(): Promise<Challenge[]> {
  const storedChallenges = await repository.listChallenges();
  const monthKeys = Array.from(
    new Set([...getMonthRange(), ...storedChallenges.map((challenge) => challenge.month)]),
  ).sort();

  return Promise.all(monthKeys.map((month) => repository.createOrGetChallengeForMonth(month)));
}

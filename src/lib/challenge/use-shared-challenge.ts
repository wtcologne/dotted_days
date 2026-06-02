"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDaysInMonth,
  getMonthStatus,
  getTodayDay,
  normalizeDoneDays,
} from "./date";
import type { SupabaseChallengeRepository } from "./supabase-repository";
import type { SharedChallengeDetail } from "./types";

type SharedChallengeState = {
  challenge: SharedChallengeDetail | null;
  daysInMonth: number;
  progress: number;
  progressRatio: number;
  todayDone: boolean;
  maxToggleDay: number;
  isLoading: boolean;
  toggleToday(): void;
  toggleDay(day: number): void;
};

export function useSharedChallenge(
  challengeId: string,
  repository: SupabaseChallengeRepository,
): SharedChallengeState {
  const [challenge, setChallenge] = useState<SharedChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      setIsLoading(true);
      const nextChallenge = await repository.getSharedChallenge(challengeId);

      if (isMounted) {
        setChallenge(nextChallenge);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [challengeId, repository]);

  const saveAndSetChallenge = useCallback(
    (nextChallenge: SharedChallengeDetail) => {
      setChallenge(nextChallenge);
      void repository.saveSharedChallengeCheckIns(
        nextChallenge.id,
        nextChallenge.month,
        nextChallenge.doneDays,
      );
    },
    [repository],
  );

  const toggleDay = useCallback(
    (day: number) => {
      if (!challenge || !canToggleDay(day, challenge.month)) {
        return;
      }

      const done = new Set(challenge.doneDays);

      if (done.has(day)) {
        done.delete(day);
      } else {
        done.add(day);
      }

      saveAndSetChallenge({
        ...challenge,
        doneDays: normalizeDoneDays(Array.from(done), challenge.month),
      });
    },
    [challenge, saveAndSetChallenge],
  );

  const toggleToday = useCallback(() => {
    if (!challenge) {
      return;
    }

    const today = getTodayDay(challenge.month);

    if (today !== null) {
      toggleDay(today);
    }
  }, [challenge, toggleDay]);

  return useMemo(() => {
    const daysInMonth = challenge ? getDaysInMonth(challenge.month) : 30;
    const progress = challenge?.doneDays.length ?? 0;
    const today = challenge ? getTodayDay(challenge.month) : null;
    const status = challenge ? getMonthStatus(challenge.month) : "current";

    return {
      challenge,
      daysInMonth,
      progress,
      progressRatio: daysInMonth > 0 ? progress / daysInMonth : 0,
      todayDone: today !== null ? Boolean(challenge?.doneDays.includes(today)) : false,
      maxToggleDay: getMaxToggleDay(status, daysInMonth, today),
      isLoading,
      toggleToday,
      toggleDay,
    };
  }, [challenge, isLoading, toggleDay, toggleToday]);
}

function canToggleDay(day: number, month: string): boolean {
  const status = getMonthStatus(month);

  if (status === "future") {
    return false;
  }

  if (status === "past") {
    return true;
  }

  const today = getTodayDay(month);

  return today !== null && day <= today;
}

function getMaxToggleDay(
  status: "past" | "current" | "future",
  daysInMonth: number,
  today: number | null,
): number {
  if (status === "past") {
    return daysInMonth;
  }

  if (status === "current") {
    return today ?? 0;
  }

  return 0;
}

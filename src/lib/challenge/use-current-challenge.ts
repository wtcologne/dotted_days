"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCurrentMonthKey,
  getDaysInMonth,
  getMonthStatus,
  getTodayDay,
  normalizeDoneDays,
} from "./date";
import { createChallengeRepository } from "./repository";
import { calculateCurrentStreak } from "./streak";
import type { Challenge } from "./types";

type CurrentChallengeState = {
  challenge: Challenge | null;
  daysInMonth: number;
  progress: number;
  progressRatio: number;
  streak: number;
  todayDone: boolean;
  maxToggleDay: number;
  status: "past" | "current" | "future";
  isLoading: boolean;
  updateTitle(title: string): void;
  toggleToday(): void;
  toggleDay(day: number): void;
  resetMonth(): Promise<void>;
};

const repository = createChallengeRepository();

export function useCurrentChallenge(): CurrentChallengeState {
  return useChallengeMonth(getCurrentMonthKey());
}

export function useChallengeMonth(monthKey: string): CurrentChallengeState {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadChallenge(): Promise<void> {
      setIsLoading(true);
      const currentChallenge = await repository.getChallengeByMonth(monthKey);

      if (isMounted) {
        setChallenge(currentChallenge);
        setIsLoading(false);
      }
    }

    void loadChallenge();

    return () => {
      isMounted = false;
    };
  }, [monthKey]);

  const saveAndSetChallenge = useCallback((nextChallenge: Challenge) => {
    setChallenge(nextChallenge);
    void repository.saveChallenge(nextChallenge);
  }, []);

  const updateTitle = useCallback(
    (title: string) => {
      if (!challenge) {
        return;
      }

      saveAndSetChallenge({
        ...challenge,
        title,
      });
    },
    [challenge, saveAndSetChallenge],
  );

  const toggleDay = useCallback(
    (day: number) => {
      if (!challenge) {
        return;
      }

      if (!canToggleDay(day, challenge.month)) {
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

  const resetMonth = useCallback(async () => {
    const resetChallenge = await repository.resetChallengeByMonth(monthKey);
    setChallenge(resetChallenge);
  }, [monthKey]);

  return useMemo(() => {
    const daysInMonth = challenge ? getDaysInMonth(challenge.month) : 30;
    const progress = challenge?.doneDays.length ?? 0;
    const today = challenge ? getTodayDay(challenge.month) : null;
    const status = getMonthStatus(challenge?.month ?? monthKey);

    return {
      challenge,
      daysInMonth,
      progress,
      progressRatio: daysInMonth > 0 ? progress / daysInMonth : 0,
      streak: challenge ? calculateCurrentStreak(challenge.doneDays, challenge.month) : 0,
      todayDone: today !== null ? Boolean(challenge?.doneDays.includes(today)) : false,
      maxToggleDay: getMaxToggleDay(status, daysInMonth, today),
      status,
      isLoading,
      updateTitle,
      toggleToday,
      toggleDay,
      resetMonth,
    };
  }, [challenge, isLoading, monthKey, resetMonth, toggleDay, toggleToday, updateTitle]);
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

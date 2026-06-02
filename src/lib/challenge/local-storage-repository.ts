import { getCurrentMonthKey, getStorageKey, normalizeDoneDays } from "./date";
import type { Challenge, ChallengeRepository } from "./types";

const DEFAULT_TITLE = "20 Minuten lesen";
const STORAGE_PREFIX = "monthly-challenge:";

export class LocalStorageChallengeRepository implements ChallengeRepository {
  async getCurrentMonthChallenge(): Promise<Challenge> {
    return this.createOrGetChallengeForMonth(getCurrentMonthKey());
  }

  async getChallengeByMonth(month: string): Promise<Challenge> {
    return this.createOrGetChallengeForMonth(month);
  }

  async createOrGetChallengeForMonth(month: string): Promise<Challenge> {
    const storedChallenge = this.read(month);

    if (storedChallenge) {
      return storedChallenge;
    }

    const challenge = createEmptyChallenge(month);
    this.write(challenge);

    return challenge;
  }

  async listChallenges(): Promise<Challenge[]> {
    const challenges: Challenge[] = [];

    try {
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);

        if (!key?.startsWith(STORAGE_PREFIX)) {
          continue;
        }

        const month = key.slice(STORAGE_PREFIX.length);
        const challenge = this.read(month);

        if (challenge) {
          challenges.push(challenge);
        }
      }
    } catch {
      return [];
    }

    return challenges.sort((left, right) => left.month.localeCompare(right.month));
  }

  async saveChallenge(challenge: Challenge): Promise<void> {
    this.write({
      ...challenge,
      doneDays: normalizeDoneDays(challenge.doneDays, challenge.month),
      updatedAt: new Date().toISOString(),
    });
  }

  async resetCurrentMonthChallenge(): Promise<Challenge> {
    return this.resetChallengeByMonth(getCurrentMonthKey());
  }

  async resetChallengeByMonth(month: string): Promise<Challenge> {
    const challenge = createEmptyChallenge(month);
    this.write(challenge);

    return challenge;
  }

  private read(month: string): Challenge | null {
    try {
      const rawValue = window.localStorage.getItem(getStorageKey(month));

      if (!rawValue) {
        return null;
      }

      const parsedValue: unknown = JSON.parse(rawValue);

      return toChallenge(parsedValue, month);
    } catch {
      return null;
    }
  }

  private write(challenge: Challenge): void {
    try {
      window.localStorage.setItem(getStorageKey(challenge.month), JSON.stringify(challenge));
    } catch {
      // localStorage can be unavailable in private mode. The in-memory UI still keeps working.
    }
  }
}

function createEmptyChallenge(month: string): Challenge {
  const now = new Date().toISOString();

  return {
    id: `local-${month}`,
    title: getDefaultTitle(month),
    month,
    kind: "personal",
    doneDays: [],
    createdAt: now,
    updatedAt: now,
  };
}

function toChallenge(value: unknown, month: string): Challenge | null {
  if (!isRecord(value)) {
    return null;
  }

  const now = new Date().toISOString();
  const rawDoneDays = Array.isArray(value.doneDays) ? value.doneDays : [];
  const doneDays = rawDoneDays.filter((day): day is number => typeof day === "number");

  return {
    id: typeof value.id === "string" ? value.id : `local-${month}`,
    title: typeof value.title === "string" ? value.title : getDefaultTitle(month),
    month,
    kind: "personal",
    doneDays: normalizeDoneDays(doneDays, month),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getDefaultTitle(month: string): string {
  return month === getCurrentMonthKey() ? DEFAULT_TITLE : "";
}

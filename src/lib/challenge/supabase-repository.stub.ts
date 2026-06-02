import type { Challenge, ChallengeRepository } from "./types";

export type SupabaseChallengeRepository = ChallengeRepository & {
  listChallenges(): Promise<Challenge[]>;
  createNextMonthChallenge(): Promise<Challenge>;
};

export class SupabaseChallengeRepositoryStub implements SupabaseChallengeRepository {
  async getCurrentMonthChallenge(): Promise<Challenge> {
    throw new Error("Supabase repository is not active yet.");
  }

  async getChallengeByMonth(month: string): Promise<Challenge> {
    void month;
    throw new Error("Supabase repository is not active yet.");
  }

  async createOrGetChallengeForMonth(month: string): Promise<Challenge> {
    void month;
    throw new Error("Supabase repository is not active yet.");
  }

  async saveChallenge(challenge: Challenge): Promise<void> {
    void challenge;
    throw new Error("Supabase repository is not active yet.");
  }

  async resetCurrentMonthChallenge(): Promise<Challenge> {
    throw new Error("Supabase repository is not active yet.");
  }

  async resetChallengeByMonth(month: string): Promise<Challenge> {
    void month;
    throw new Error("Supabase repository is not active yet.");
  }

  async listChallenges(): Promise<Challenge[]> {
    throw new Error("Supabase repository is not active yet.");
  }

  async createNextMonthChallenge(): Promise<Challenge> {
    throw new Error("Supabase repository is not active yet.");
  }
}

// TODO: Replace this stub with a real Supabase-backed implementation once auth,
// row-level security and persistence rules are decided.

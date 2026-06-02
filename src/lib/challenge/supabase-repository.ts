import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCurrentMonthKey,
  normalizeDoneDays,
} from "./date";
import type { Challenge, ChallengeRepository } from "./types";

type ChallengeRow = {
  id: string;
  title: string;
  month: string;
  created_at: string;
  updated_at: string;
};

type ChallengeWithCheckIns = ChallengeRow & {
  check_ins?: Array<{
    date: string;
  }>;
};

const DEFAULT_TITLE = "20 Minuten lesen";

export class SupabaseChallengeRepository implements ChallengeRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string,
  ) {}

  async getCurrentMonthChallenge(): Promise<Challenge> {
    return this.createOrGetChallengeForMonth(getCurrentMonthKey());
  }

  async getChallengeByMonth(month: string): Promise<Challenge> {
    return this.createOrGetChallengeForMonth(month);
  }

  async createOrGetChallengeForMonth(month: string): Promise<Challenge> {
    const existingChallenge = await this.fetchChallengeByMonth(month);

    if (existingChallenge) {
      return existingChallenge;
    }

    const row = await this.createChallengeRow(month, getDefaultTitle(month));

    return mapChallenge(row, []);
  }

  async listChallenges(): Promise<Challenge[]> {
    const { data, error } = await this.supabase
      .from("challenges")
      .select("id,title,month,created_at,updated_at,check_ins(date)")
      .eq("user_id", this.userId)
      .order("month", { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as ChallengeWithCheckIns[];

    return rows.map((row) => mapChallenge(row, row.check_ins ?? []));
  }

  async saveChallenge(challenge: Challenge): Promise<void> {
    const row = await this.upsertChallengeRow(challenge.month, challenge.title);
    const doneDays = normalizeDoneDays(challenge.doneDays, challenge.month);

    const { error: deleteError } = await this.supabase
      .from("check_ins")
      .delete()
      .eq("challenge_id", row.id)
      .eq("user_id", this.userId);

    if (deleteError) {
      throw deleteError;
    }

    if (doneDays.length === 0) {
      return;
    }

    const { error: insertError } = await this.supabase.from("check_ins").insert(
      doneDays.map((day) => ({
        challenge_id: row.id,
        user_id: this.userId,
        date: toDateString(challenge.month, day),
        status: "done",
      })),
    );

    if (insertError) {
      throw insertError;
    }
  }

  async resetCurrentMonthChallenge(): Promise<Challenge> {
    return this.resetChallengeByMonth(getCurrentMonthKey());
  }

  async resetChallengeByMonth(month: string): Promise<Challenge> {
    const row = await this.upsertChallengeRow(month, getDefaultTitle(month));

    const { error } = await this.supabase
      .from("check_ins")
      .delete()
      .eq("challenge_id", row.id)
      .eq("user_id", this.userId);

    if (error) {
      throw error;
    }

    return mapChallenge(row, []);
  }

  private async fetchChallengeByMonth(month: string): Promise<Challenge | null> {
    const { data, error } = await this.supabase
      .from("challenges")
      .select("id,title,month,created_at,updated_at,check_ins(date)")
      .eq("user_id", this.userId)
      .eq("month", month)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const row = data as ChallengeWithCheckIns;

    return mapChallenge(row, row.check_ins ?? []);
  }

  private async createChallengeRow(month: string, title: string): Promise<ChallengeRow> {
    const { data, error } = await this.supabase
      .from("challenges")
      .insert({
        user_id: this.userId,
        title,
        month,
      })
      .select("id,title,month,created_at,updated_at")
      .single();

    if (error) {
      throw error;
    }

    return data as ChallengeRow;
  }

  private async upsertChallengeRow(month: string, title: string): Promise<ChallengeRow> {
    const { data, error } = await this.supabase
      .from("challenges")
      .upsert(
        {
          user_id: this.userId,
          title,
          month,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,month",
        },
      )
      .select("id,title,month,created_at,updated_at")
      .single();

    if (error) {
      throw error;
    }

    return data as ChallengeRow;
  }
}

function mapChallenge(row: ChallengeRow, checkIns: Array<{ date: string }>): Challenge {
  const doneDays = checkIns
    .map((checkIn) => Number(checkIn.date.slice(-2)))
    .filter((day) => Number.isInteger(day));

  return {
    id: row.id,
    title: row.title,
    month: row.month,
    doneDays: normalizeDoneDays(doneDays, row.month),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDateString(month: string, day: number): string {
  return `${month}-${String(day).padStart(2, "0")}`;
}

function getDefaultTitle(month: string): string {
  return month === getCurrentMonthKey() ? DEFAULT_TITLE : "";
}

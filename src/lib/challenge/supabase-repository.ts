import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCurrentMonthKey,
  getTodayDay,
  normalizeDoneDays,
} from "./date";
import type {
  Challenge,
  ChallengeRepository,
  SharedChallengeDetail,
  SharedChallengeMember,
  SharedChallengeRepository,
  SharedChallengeSummary,
} from "./types";

type ChallengeRow = {
  id: string;
  title: string;
  month: string;
  kind: "personal" | "shared";
  invite_code: string | null;
  created_at: string;
  updated_at: string;
};

type ChallengeWithCheckIns = ChallengeRow & {
  check_ins?: Array<{
    user_id: string;
    date: string;
  }>;
};

type MemberRow = {
  challenge_id: string;
  user_id: string;
  role: "owner" | "member";
};

type CheckInRow = {
  user_id: string;
  date: string;
};

const DEFAULT_TITLE = "20 Minuten lesen";

export class SupabaseChallengeRepository implements ChallengeRepository, SharedChallengeRepository {
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
      .select("id,title,month,kind,invite_code,created_at,updated_at,check_ins(date)")
      .eq("user_id", this.userId)
      .eq("kind", "personal")
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

  async listSharedChallenges(month: string): Promise<SharedChallengeSummary[]> {
    const { data, error } = await this.supabase
      .from("challenge_members")
      .select(
        "challenge_id,challenges!inner(id,title,month,kind,invite_code,created_at,updated_at,check_ins(user_id,date))",
      )
      .eq("user_id", this.userId)
      .eq("challenges.month", month)
      .eq("challenges.kind", "shared");

    if (error) {
      throw error;
    }

    const challengeRows = (data ?? [])
      .map((row) => getNestedChallenge(row))
      .filter((row): row is ChallengeWithCheckIns => Boolean(row));
    const memberCounts = await this.getMemberCounts(challengeRows.map((row) => row.id));

    return challengeRows.map((row) =>
      mapSharedChallenge(row, row.check_ins ?? [], memberCounts, this.userId),
    );
  }

  async getSharedChallenge(challengeId: string): Promise<SharedChallengeDetail> {
    const row = await this.fetchSharedChallengeRow(challengeId);
    const members = await this.getMembers(challengeId);
    const memberCounts = new Map([[challengeId, members.length]]);

    return {
      ...mapSharedChallenge(row, row.check_ins ?? [], memberCounts, this.userId),
      members,
      currentUserRole: members.find((member) => member.userId === this.userId)?.role ?? "member",
    };
  }

  async createSharedChallenge(month: string, title: string): Promise<SharedChallengeDetail> {
    const inviteCode = createInviteCode();
    const { data, error } = await this.supabase
      .from("challenges")
      .insert({
        user_id: this.userId,
        created_by: this.userId,
        title,
        month,
        kind: "shared",
        invite_code: inviteCode,
      })
      .select("id,title,month,kind,invite_code,created_at,updated_at")
      .single();

    if (error) {
      throw error;
    }

    const row = data as ChallengeRow;
    const { error: memberError } = await this.supabase.from("challenge_members").insert({
      challenge_id: row.id,
      user_id: this.userId,
      role: "owner",
    });

    if (memberError) {
      throw memberError;
    }

    return {
      ...mapSharedChallenge(row, [], new Map([[row.id, 1]]), this.userId),
      members: [{ userId: this.userId, role: "owner" }],
      currentUserRole: "owner",
    };
  }

  async joinSharedChallenge(inviteCode: string): Promise<SharedChallengeDetail> {
    const { data, error } = await this.supabase.rpc("join_challenge_by_invite", {
      invite_code_input: inviteCode,
    });

    if (error) {
      throw error;
    }

    return this.getSharedChallenge(String(data));
  }

  async saveSharedChallengeCheckIns(
    challengeId: string,
    month: string,
    doneDays: number[],
  ): Promise<void> {
    const normalizedDoneDays = normalizeDoneDays(doneDays, month);

    const { error: deleteError } = await this.supabase
      .from("check_ins")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", this.userId);

    if (deleteError) {
      throw deleteError;
    }

    if (normalizedDoneDays.length === 0) {
      return;
    }

    const { error: insertError } = await this.supabase.from("check_ins").insert(
      normalizedDoneDays.map((day) => ({
        challenge_id: challengeId,
        user_id: this.userId,
        date: toDateString(month, day),
        status: "done",
      })),
    );

    if (insertError) {
      throw insertError;
    }
  }

  async leaveSharedChallenge(challengeId: string): Promise<void> {
    const { error: checkInError } = await this.supabase
      .from("check_ins")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", this.userId);

    if (checkInError) {
      throw checkInError;
    }

    const { error: memberError } = await this.supabase
      .from("challenge_members")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", this.userId);

    if (memberError) {
      throw memberError;
    }
  }

  async deleteSharedChallenge(challengeId: string): Promise<void> {
    const { error } = await this.supabase
      .from("challenges")
      .delete()
      .eq("id", challengeId)
      .eq("kind", "shared")
      .eq("created_by", this.userId);

    if (error) {
      throw error;
    }
  }

  private async fetchChallengeByMonth(month: string): Promise<Challenge | null> {
    const { data, error } = await this.supabase
      .from("challenges")
      .select("id,title,month,kind,invite_code,created_at,updated_at,check_ins(date)")
      .eq("user_id", this.userId)
      .eq("month", month)
      .eq("kind", "personal")
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
        created_by: this.userId,
        title,
        month,
        kind: "personal",
      })
      .select("id,title,month,kind,invite_code,created_at,updated_at")
      .single();

    if (error) {
      throw error;
    }

    return data as ChallengeRow;
  }

  private async upsertChallengeRow(month: string, title: string): Promise<ChallengeRow> {
    const existingChallenge = await this.fetchPersonalChallengeRow(month);

    if (existingChallenge) {
      const { data, error } = await this.supabase
        .from("challenges")
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingChallenge.id)
        .select("id,title,month,kind,invite_code,created_at,updated_at")
        .single();

      if (error) {
        throw error;
      }

      return data as ChallengeRow;
    }

    return this.createChallengeRow(month, title);
  }

  private async fetchPersonalChallengeRow(month: string): Promise<ChallengeRow | null> {
    const { data, error } = await this.supabase
      .from("challenges")
      .select("id,title,month,kind,invite_code,created_at,updated_at")
      .eq("user_id", this.userId)
      .eq("month", month)
      .eq("kind", "personal")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as ChallengeRow | null;
  }

  private async fetchSharedChallengeRow(challengeId: string): Promise<ChallengeWithCheckIns> {
    const { data, error } = await this.supabase
      .from("challenges")
      .select("id,title,month,kind,invite_code,created_at,updated_at,check_ins(user_id,date)")
      .eq("id", challengeId)
      .eq("kind", "shared")
      .single();

    if (error) {
      throw error;
    }

    return data as ChallengeWithCheckIns;
  }

  private async getMembers(challengeId: string): Promise<SharedChallengeMember[]> {
    const { data, error } = await this.supabase
      .from("challenge_members")
      .select("challenge_id,user_id,role")
      .eq("challenge_id", challengeId);

    if (error) {
      throw error;
    }

    return ((data ?? []) as MemberRow[]).map((member) => ({
      userId: member.user_id,
      role: member.role,
    }));
  }

  private async getMemberCounts(challengeIds: string[]): Promise<Map<string, number>> {
    if (challengeIds.length === 0) {
      return new Map();
    }

    const { data, error } = await this.supabase
      .from("challenge_members")
      .select("challenge_id,user_id")
      .in("challenge_id", challengeIds);

    if (error) {
      throw error;
    }

    return ((data ?? []) as MemberRow[]).reduce((counts, member) => {
      counts.set(member.challenge_id, (counts.get(member.challenge_id) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
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
    kind: row.kind,
    doneDays: normalizeDoneDays(doneDays, row.month),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSharedChallenge(
  row: ChallengeRow,
  checkIns: CheckInRow[],
  memberCounts: Map<string, number>,
  userId: string,
): SharedChallengeSummary {
  const currentUserDoneDays = checkIns.filter((checkIn) => checkIn.user_id === userId);
  const today = getTodayDay(row.month);
  const todayDate = today ? toDateString(row.month, today) : null;
  const todayDoneUserIds = new Set(
    checkIns
      .filter((checkIn) => todayDate !== null && checkIn.date === todayDate)
      .map((checkIn) => checkIn.user_id),
  );

  return {
    id: row.id,
    title: row.title,
    month: row.month,
    inviteCode: row.invite_code ?? "",
    doneDays: normalizeDoneDays(
      currentUserDoneDays.map((checkIn) => Number(checkIn.date.slice(-2))),
      row.month,
    ),
    memberCount: memberCounts.get(row.id) ?? 1,
    todayDoneCount: todayDoneUserIds.size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getNestedChallenge(value: unknown): ChallengeWithCheckIns | null {
  if (!isRecord(value)) {
    return null;
  }

  const challenge = value.challenges;

  if (Array.isArray(challenge)) {
    return (challenge[0] ?? null) as ChallengeWithCheckIns | null;
  }

  return (challenge ?? null) as ChallengeWithCheckIns | null;
}

function toDateString(month: string, day: number): string {
  return `${month}-${String(day).padStart(2, "0")}`;
}

function getDefaultTitle(month: string): string {
  return month === getCurrentMonthKey() ? DEFAULT_TITLE : "";
}

function createInviteCode(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  }

  return Math.random().toString(36).slice(2, 14);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

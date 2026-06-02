export type ChallengeKind = "personal" | "shared";

export type Challenge = {
  id: string;
  title: string;
  month: string;
  kind: ChallengeKind;
  doneDays: number[];
  createdAt: string;
  updatedAt: string;
};

export type SharedChallengeMember = {
  userId: string;
  role: "owner" | "member";
};

export type SharedChallengeSummary = {
  id: string;
  title: string;
  month: string;
  inviteCode: string;
  doneDays: number[];
  memberCount: number;
  todayDoneCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SharedChallengeDetail = SharedChallengeSummary & {
  members: SharedChallengeMember[];
  currentUserRole: "owner" | "member";
};

export type SharedChallengeRepository = {
  listSharedChallenges(month: string): Promise<SharedChallengeSummary[]>;
  getSharedChallenge(challengeId: string): Promise<SharedChallengeDetail>;
  createSharedChallenge(month: string, title: string): Promise<SharedChallengeDetail>;
  joinSharedChallenge(inviteCode: string): Promise<SharedChallengeDetail>;
  saveSharedChallengeCheckIns(challengeId: string, month: string, doneDays: number[]): Promise<void>;
  leaveSharedChallenge(challengeId: string): Promise<void>;
  deleteSharedChallenge(challengeId: string): Promise<void>;
};

export type ChallengeRepository = {
  getCurrentMonthChallenge(): Promise<Challenge>;
  getChallengeByMonth(month: string): Promise<Challenge>;
  createOrGetChallengeForMonth(month: string): Promise<Challenge>;
  listChallenges(): Promise<Challenge[]>;
  saveChallenge(challenge: Challenge): Promise<void>;
  resetCurrentMonthChallenge(): Promise<Challenge>;
  resetChallengeByMonth(month: string): Promise<Challenge>;
};

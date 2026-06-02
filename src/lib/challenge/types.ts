export type Challenge = {
  id: string;
  title: string;
  month: string;
  doneDays: number[];
  createdAt: string;
  updatedAt: string;
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

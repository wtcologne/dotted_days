import type { ChallengeRepository } from "./types";
import { LocalStorageChallengeRepository } from "./local-storage-repository";

export function createChallengeRepository(): ChallengeRepository {
  return new LocalStorageChallengeRepository();
}

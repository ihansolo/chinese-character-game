import type { StorageAdapter } from "./storage/StorageAdapter";

export interface CharacterProgress {
  correctCount: number;
  wrongCount: number;
  lastSeen: number; // epoch ms
}

export type ProgressMap = Record<string, CharacterProgress>;

const STORAGE_KEY = "progress.v1";
const COLLECTED_THRESHOLD = 3;

export async function loadProgress(storage: StorageAdapter): Promise<ProgressMap> {
  return (await storage.get<ProgressMap>(STORAGE_KEY)) ?? {};
}

export async function saveProgress(storage: StorageAdapter, progress: ProgressMap): Promise<void> {
  await storage.set(STORAGE_KEY, progress);
}

export function recordResult(progress: ProgressMap, id: string, correct: boolean): ProgressMap {
  const prev = progress[id] ?? { correctCount: 0, wrongCount: 0, lastSeen: 0 };
  const updated: CharacterProgress = {
    correctCount: prev.correctCount + (correct ? 1 : 0),
    wrongCount: prev.wrongCount + (correct ? 0 : 1),
    lastSeen: Date.now(),
  };
  return { ...progress, [id]: updated };
}

export function isCollected(progress: ProgressMap, id: string): boolean {
  return (progress[id]?.correctCount ?? 0) >= COLLECTED_THRESHOLD;
}

export function accuracyFor(progress: ProgressMap, id: string): number | null {
  const entry = progress[id];
  if (!entry) return null;
  const total = entry.correctCount + entry.wrongCount;
  return total === 0 ? null : entry.correctCount / total;
}

export async function resetProgress(storage: StorageAdapter): Promise<void> {
  await storage.set(STORAGE_KEY, {});
}

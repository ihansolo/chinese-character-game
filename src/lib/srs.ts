import type { ProgressMap } from "./progress";

/**
 * Picks `size` character ids for a round, prioritizing characters that are
 * unseen or weakest first (fewest correct answers, then least recently seen).
 * Repeats ids if the pool is smaller than `size`.
 */
export function selectRoundCharacters(pool: string[], progress: ProgressMap, size: number): string[] {
  const ranked = [...pool].sort((a, b) => {
    const pa = progress[a];
    const pb = progress[b];
    const correctA = pa?.correctCount ?? 0;
    const correctB = pb?.correctCount ?? 0;
    if (correctA !== correctB) return correctA - correctB;
    const seenA = pa?.lastSeen ?? 0;
    const seenB = pb?.lastSeen ?? 0;
    return seenA - seenB;
  });

  const selected: string[] = [];
  for (let i = 0; selected.length < size && ranked.length > 0; i++) {
    selected.push(ranked[i % ranked.length]);
  }
  return selected;
}

const DEFAULT_REQUEUE_OFFSET = 3;

/**
 * Removes the front id from the queue. On a wrong answer, reinserts it a few
 * slots ahead instead of dropping it, so missed characters come back sooner
 * within the same round ("spaced repetition lite").
 */
export function reportRoundResult(
  queueIds: readonly string[],
  correct: boolean,
  requeueOffset = DEFAULT_REQUEUE_OFFSET,
): string[] {
  const [id, ...rest] = queueIds;
  if (id === undefined) return rest;
  if (correct) return rest;
  const insertAt = Math.min(requeueOffset, rest.length);
  return [...rest.slice(0, insertAt), id, ...rest.slice(insertAt)];
}

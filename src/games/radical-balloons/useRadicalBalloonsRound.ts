import { useEffect, useRef, useState } from "react";
import type { RadicalSet } from "../../data/types";

export type BalloonLevel = 1 | 2 | 3;

export interface Balloon {
  uid: number;
  char: string;
  isCorrect: boolean;
  leftPercent: number;
  riseDurationMs: number;
}

interface LevelConfig {
  spawnIntervalMs: number;
  riseDurationMs: number;
}

const LEVEL_CONFIG: Record<BalloonLevel, LevelConfig> = {
  1: { spawnIntervalMs: 2200, riseDurationMs: 10000 },
  2: { spawnIntervalMs: 1800, riseDurationMs: 8000 },
  3: { spawnIntervalMs: 1400, riseDurationMs: 6500 },
};

const TARGET_CORRECT = 6;
const TIME_LIMIT_MS = 60000;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RECENT_HISTORY_SIZE = 3;

/** Picks from `arr`, avoiding characters spawned in the last few balloons when the pool is big enough to allow it. */
function pickVaried(arr: string[], recent: string[]): string {
  const fresh = arr.filter((c) => !recent.includes(c));
  return pickRandom(fresh.length > 0 ? fresh : arr);
}

interface UseRadicalBalloonsRoundResult {
  balloons: Balloon[];
  foundChars: string[];
  starCount: number;
  secondsLeft: number;
  roundDone: boolean;
  registerHit: (balloon: Balloon) => void;
  removeBalloon: (uid: number) => void;
}

export function useRadicalBalloonsRound(set: RadicalSet, level: BalloonLevel): UseRadicalBalloonsRoundResult {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [foundChars, setFoundChars] = useState<string[]>([]);
  const [starCount, setStarCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIME_LIMIT_MS / 1000);
  const [roundDone, setRoundDone] = useState(false);
  const uidCounter = useRef(0);
  const startTime = useRef(Date.now());
  const recentChars = useRef<string[]>([]);

  useEffect(() => {
    if (roundDone) return;
    const config = LEVEL_CONFIG[level];
    const spawnTimer = setInterval(() => {
      const isCorrect = Math.random() < 0.55;
      const char = pickVaried(isCorrect ? set.correct : set.distractors, recentChars.current);
      recentChars.current = [...recentChars.current, char].slice(-RECENT_HISTORY_SIZE);
      uidCounter.current += 1;
      const balloon: Balloon = {
        uid: uidCounter.current,
        char,
        isCorrect,
        leftPercent: 8 + Math.random() * 84,
        riseDurationMs: config.riseDurationMs,
      };
      setBalloons((prev) => [...prev, balloon]);
    }, config.spawnIntervalMs);
    return () => clearInterval(spawnTimer);
  }, [set, level, roundDone]);

  useEffect(() => {
    if (roundDone) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, Math.ceil((TIME_LIMIT_MS - elapsed) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) setRoundDone(true);
    }, 250);
    return () => clearInterval(tick);
  }, [roundDone]);

  function registerHit(balloon: Balloon) {
    if (!balloon.isCorrect) return;
    setStarCount((n) => n + 1);
    setFoundChars((chars) => (chars.includes(balloon.char) ? chars : [...chars, balloon.char]));
  }

  function removeBalloon(uid: number) {
    setBalloons((prev) => prev.filter((b) => b.uid !== uid));
  }

  useEffect(() => {
    if (starCount >= TARGET_CORRECT) setRoundDone(true);
  }, [starCount]);

  return { balloons, foundChars, starCount, secondsLeft, roundDone, registerHit, removeBalloon };
}

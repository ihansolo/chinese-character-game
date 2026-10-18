import { useEffect, useMemo, useRef, useState } from "react";
import { characters } from "../../data/loadContent";
import type { Level, PinyinOption } from "../../data/types";
import { reportRoundResult, selectRoundCharacters } from "../../lib/srs";
import { loadProgress, recordResult, saveProgress, type ProgressMap } from "../../lib/progress";
import { storage } from "../../lib/services";

const ROUND_SIZE = 10;
const MAX_WRONG_TRIES = 2;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface RoundOption extends PinyinOption {
  isCorrect: boolean;
}

export interface RoundResultItem {
  id: string;
  correctOnFirstTry: boolean;
}

type QuestionOutcome = "correct" | "revealed" | null;

interface UseSoundMatchRoundResult {
  currentCharacterId: string | null;
  options: RoundOption[];
  wrongTries: number;
  revealed: boolean;
  roundDone: boolean;
  starCount: number;
  history: RoundResultItem[];
  submitAnswer: (isCorrect: boolean) => void;
  advance: () => void;
}

export function useSoundMatchRound(level: Level): UseSoundMatchRoundResult {
  const [queueIds, setQueueIds] = useState<string[] | null>(null);
  const [wrongTries, setWrongTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [history, setHistory] = useState<RoundResultItem[]>([]);
  const progressRef = useRef<ProgressMap>({});
  const outcomeRef = useRef<QuestionOutcome>(null);

  const pool = useMemo(() => characters.map((c) => c.id), []);
  const currentCharacterId = queueIds && queueIds.length > 0 ? queueIds[0] : null;
  const roundDone = queueIds !== null && queueIds.length === 0;

  const options = useMemo(
    () => (currentCharacterId ? buildOptions(currentCharacterId, level) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentCharacterId, level],
  );

  useEffect(() => {
    let cancelled = false;
    loadProgress(storage).then((progress) => {
      if (cancelled) return;
      progressRef.current = progress;
      setQueueIds(selectRoundCharacters(pool, progress, ROUND_SIZE));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setWrongTries(0);
    setRevealed(false);
    outcomeRef.current = null;
  }, [currentCharacterId]);

  function submitAnswer(isCorrect: boolean) {
    if (outcomeRef.current) return; // already resolved, waiting to advance
    if (isCorrect) {
      outcomeRef.current = "correct";
      setStarCount((n) => n + 1);
    } else {
      const nextTries = wrongTries + 1;
      setWrongTries(nextTries);
      if (nextTries >= MAX_WRONG_TRIES) {
        outcomeRef.current = "revealed";
        setRevealed(true);
      }
    }
  }

  function advance() {
    if (!queueIds || !currentCharacterId || !outcomeRef.current) return;
    const correct = outcomeRef.current === "correct";
    progressRef.current = recordResult(progressRef.current, currentCharacterId, correct);
    void saveProgress(storage, progressRef.current);
    setHistory((h) => [...h, { id: currentCharacterId, correctOnFirstTry: correct }]);
    setQueueIds(reportRoundResult(queueIds, correct));
  }

  return {
    currentCharacterId,
    options,
    wrongTries,
    revealed,
    roundDone,
    starCount,
    history,
    submitAnswer,
    advance,
  };
}

function buildOptions(characterId: string, level: Level): RoundOption[] {
  const entry = characters.find((c) => c.id === characterId);
  if (!entry) return [];
  const distractors = shuffle(entry.distractorsByLevel[level]).slice(0, 2);
  const correct: RoundOption = { pinyin: entry.pinyin, speakerChar: entry.traditional, isCorrect: true };
  const options: RoundOption[] = [correct, ...distractors.map((d) => ({ ...d, isCorrect: false }))];
  return shuffle(options);
}

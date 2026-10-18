export type Script = "traditional" | "simplified";
export type Level = 1 | 2 | 3;

export interface PinyinOption {
  pinyin: string;
  /** Character used only to synthesize audio for this pinyin — never shown as text. */
  speakerChar: string;
}

export interface CharacterEntry {
  id: string;
  traditional: string;
  simplified: string;
  pinyin: string;
  zhuyin: string;
  emoji: string;
  tier: 1 | 2 | 3;
  distractorsByLevel: Record<Level, PinyinOption[]>;
}

export interface RadicalSet {
  radical: string;
  emoji: string;
  hintLabel: string;
  correct: string[];
  distractors: string[];
}

export function glyphFor(entry: CharacterEntry, script: Script): string {
  return script === "traditional" ? entry.traditional : entry.simplified;
}

import { describe, it, expect } from "vitest";
import { validateRadicalSets } from "../src/data/validateRadicalSets";
import { radicalSets } from "../src/data/loadContent";
import type { RadicalSet } from "../src/data/types";

const fixtureRadicals: Record<string, string> = {
  河: "氵", 海: "氵", 湖: "氵", 洗: "氵", 游: "氵",
  冰: "冫", 火: "火", 林: "木", 你: "亻",
  木: "木", 森: "木", 樹: "木", 桌: "木", 椅: "木",
  米: "米", 禾: "禾", 小: "小", 水: "水",
};

function lookup(char: string): string | undefined {
  return fixtureRadicals[char];
}

describe("validateRadicalSets", () => {
  it("passes a correctly-formed set", () => {
    const sets: RadicalSet[] = [
      { radical: "氵", emoji: "💧", hintLabel: "water", correct: ["河", "海", "湖", "洗", "游"], distractors: ["冰", "火", "林", "你"] },
    ];
    expect(validateRadicalSets(sets, lookup)).toEqual([]);
  });

  it("flags a correct char that does not carry the radical", () => {
    const sets: RadicalSet[] = [
      { radical: "木", emoji: "🌳", hintLabel: "tree", correct: ["林", "米"], distractors: ["水"] },
    ];
    const errors = validateRadicalSets(sets, lookup);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/米/);
  });

  it("flags a distractor that does carry the radical", () => {
    const sets: RadicalSet[] = [
      { radical: "木", emoji: "🌳", hintLabel: "tree", correct: ["林"], distractors: ["森"] },
    ];
    const errors = validateRadicalSets(sets, lookup);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/森/);
  });

  it("flags a character missing from the dictionary", () => {
    const sets: RadicalSet[] = [
      { radical: "木", emoji: "🌳", hintLabel: "tree", correct: ["林", "未知"], distractors: [] },
    ];
    const errors = validateRadicalSets(sets, lookup);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/not found in dictionary/);
  });

  it("the bundled radicalSets.json is internally consistent (no char is both correct and a distractor in the same set)", () => {
    for (const set of radicalSets) {
      const overlap = set.correct.filter((c) => set.distractors.includes(c));
      expect(overlap).toEqual([]);
    }
  });
});

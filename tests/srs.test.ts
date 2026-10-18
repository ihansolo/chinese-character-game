import { describe, it, expect } from "vitest";
import { selectRoundCharacters, reportRoundResult } from "../src/lib/srs";
import type { ProgressMap } from "../src/lib/progress";

describe("selectRoundCharacters", () => {
  it("prioritizes never-seen characters over practiced ones", () => {
    const pool = ["a", "b", "c"];
    const progress: ProgressMap = {
      a: { correctCount: 5, wrongCount: 0, lastSeen: 100 },
    };
    const selected = selectRoundCharacters(pool, progress, 2);
    expect(selected).toContain("b");
    expect(selected).toContain("c");
    expect(selected).not.toContain("a");
  });

  it("prioritizes lower correctCount, then least-recently-seen", () => {
    const pool = ["a", "b", "c"];
    const progress: ProgressMap = {
      a: { correctCount: 2, wrongCount: 0, lastSeen: 500 },
      b: { correctCount: 2, wrongCount: 0, lastSeen: 100 },
      c: { correctCount: 3, wrongCount: 0, lastSeen: 0 },
    };
    const selected = selectRoundCharacters(pool, progress, 3);
    expect(selected).toEqual(["b", "a", "c"]);
  });

  it("repeats characters to fill the round when the pool is smaller than the round size", () => {
    const pool = ["a", "b"];
    const selected = selectRoundCharacters(pool, {}, 5);
    expect(selected).toHaveLength(5);
    expect(new Set(selected)).toEqual(new Set(["a", "b"]));
  });

  it("returns an empty round for an empty pool", () => {
    expect(selectRoundCharacters([], {}, 10)).toEqual([]);
  });
});

describe("reportRoundResult", () => {
  it("drops the front id on a correct answer", () => {
    const result = reportRoundResult(["a", "b", "c"], true);
    expect(result).toEqual(["b", "c"]);
  });

  it("reinserts the front id a few slots ahead on a wrong answer", () => {
    const result = reportRoundResult(["a", "b", "c", "d", "e"], false, 2);
    expect(result).toEqual(["b", "c", "a", "d", "e"]);
  });

  it("reinserts at the end when the requeue offset exceeds the remaining queue", () => {
    const result = reportRoundResult(["a", "b"], false, 5);
    expect(result).toEqual(["b", "a"]);
  });

  it("returns an empty queue unchanged", () => {
    expect(reportRoundResult([], true)).toEqual([]);
    expect(reportRoundResult([], false)).toEqual([]);
  });
});

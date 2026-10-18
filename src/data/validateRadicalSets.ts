import type { RadicalSet } from "./types";

/**
 * Validates that every "correct" character in a radical set actually carries
 * that Kangxi radical, and every distractor does not. `radicalOf` is injected
 * so the check can run against a real dictionary (scripts/validateContent.ts)
 * or a small fixture (unit tests) without coupling this module to either.
 */
export function validateRadicalSets(sets: RadicalSet[], radicalOf: (char: string) => string | undefined): string[] {
  const errors: string[] = [];

  for (const set of sets) {
    for (const char of set.correct) {
      const radical = radicalOf(char);
      if (radical === undefined) {
        errors.push(`${set.radical}: correct char ${char} not found in dictionary`);
      } else if (radical !== set.radical) {
        errors.push(`${set.radical}: correct char ${char} has radical ${radical}, expected ${set.radical}`);
      }
    }
    for (const char of set.distractors) {
      const radical = radicalOf(char);
      if (radical === undefined) {
        errors.push(`${set.radical}: distractor ${char} not found in dictionary`);
      } else if (radical === set.radical) {
        errors.push(`${set.radical}: distractor ${char} unexpectedly has radical ${set.radical}`);
      }
    }
  }

  return errors;
}

import charactersRaw from "./characters.json";
import radicalSetsRaw from "./radicalSets.json";
import type { CharacterEntry, RadicalSet, Level } from "./types";

function assertValidCharacters(items: unknown): asserts items is CharacterEntry[] {
  if (!Array.isArray(items)) throw new Error("characters.json: expected an array");
  const seenIds = new Set<string>();
  for (const item of items) {
    const c = item as CharacterEntry;
    if (!c.id || !c.traditional || !c.simplified || !c.pinyin) {
      throw new Error(`characters.json: entry missing required field: ${JSON.stringify(item)}`);
    }
    if (seenIds.has(c.id)) throw new Error(`characters.json: duplicate id ${c.id}`);
    seenIds.add(c.id);
    for (const level of [1, 2, 3] as Level[]) {
      const opts = c.distractorsByLevel[level];
      if (!opts || opts.length < 2) {
        throw new Error(`characters.json: ${c.id} level ${level} needs at least 2 distractors`);
      }
    }
  }
}

function assertValidRadicalSets(items: unknown): asserts items is RadicalSet[] {
  if (!Array.isArray(items)) throw new Error("radicalSets.json: expected an array");
  for (const item of items) {
    const s = item as RadicalSet;
    if (!s.radical || !s.correct?.length || !s.distractors?.length) {
      throw new Error(`radicalSets.json: entry missing required field: ${JSON.stringify(item)}`);
    }
  }
}

assertValidCharacters(charactersRaw);
assertValidRadicalSets(radicalSetsRaw);

export const characters: CharacterEntry[] = charactersRaw;
export const radicalSets: RadicalSet[] = radicalSetsRaw;

export function getCharacterById(id: string): CharacterEntry | undefined {
  return characters.find((c) => c.id === id);
}

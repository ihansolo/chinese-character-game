import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateRadicalSets } from "../src/data/validateRadicalSets";
import type { RadicalSet } from "../src/data/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const radicalSets: RadicalSet[] = JSON.parse(readFileSync(path.join(here, "../src/data/radicalSets.json"), "utf-8"));

interface HanziEntry {
  character: string;
  traditional: string;
  radical: string;
}

const datasetPath = path.join(here, "../../hanzi_dataset_full.json");
let radicalByChar: Map<string, string>;
try {
  const dataset: HanziEntry[] = JSON.parse(readFileSync(datasetPath, "utf-8"));
  radicalByChar = new Map();
  for (const entry of dataset) {
    radicalByChar.set(entry.character, entry.radical);
    radicalByChar.set(entry.traditional, entry.radical);
  }
} catch {
  console.error(`Could not read reference dataset at ${datasetPath}.`);
  console.error("This script expects hanzi_dataset_full.json alongside the chinese-character-game folder.");
  process.exit(1);
}

const errors = validateRadicalSets(radicalSets, (char) => radicalByChar.get(char));

if (errors.length > 0) {
  console.error(`Found ${errors.length} problem(s) in radicalSets.json:`);
  for (const err of errors) console.error(" -", err);
  process.exit(1);
}

console.log(`All ${radicalSets.length} radical sets validated OK against the reference dictionary.`);

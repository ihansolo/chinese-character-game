import { useEffect, useState, type CSSProperties } from "react";
import { getCharacterById } from "../../data/loadContent";
import type { Level } from "../../data/types";
import { useSettings } from "../../context/SettingsContext";
import { glyphFor } from "../../data/types";
import { audio } from "../../lib/services";
import { CharacterCard } from "../../components/CharacterCard";
import { PinyinButton } from "../../components/PinyinButton";
import { StarBurst } from "../../components/StarBurst";
import { RoundSummary } from "../../components/RoundSummary";
import { ScriptToggle } from "../../components/ScriptToggle";
import { useSoundMatchRound } from "./useSoundMatchRound";

const ADVANCE_DELAY_MS = 1200;

export function SoundMatchGame({ onExit }: { onExit: () => void }) {
  const { script } = useSettings();
  const [level, setLevel] = useState<Level>(1);
  const [showHint, setShowHint] = useState(true);
  const [selectedPinyin, setSelectedPinyin] = useState<string | null>(null);
  const [wrongFlashPinyin, setWrongFlashPinyin] = useState<string | null>(null);
  const [starTrigger, setStarTrigger] = useState(0);

  const { currentCharacterId, options, revealed, roundDone, starCount, history, submitAnswer, advance } =
    useSoundMatchRound(level);

  const currentEntry = currentCharacterId ? getCharacterById(currentCharacterId) : undefined;

  useEffect(() => {
    setSelectedPinyin(null);
    setWrongFlashPinyin(null);
  }, [currentCharacterId]);

  function handleTap(pinyinOpt: (typeof options)[number]) {
    if (revealed) return;
    void audio.speak(pinyinOpt.speakerChar);
    if (selectedPinyin === pinyinOpt.pinyin) {
      // second tap = confirm
      confirmAnswer(pinyinOpt);
    } else {
      setSelectedPinyin(pinyinOpt.pinyin);
    }
  }

  function confirmAnswer(pinyinOpt: (typeof options)[number]) {
    submitAnswer(pinyinOpt.isCorrect);
    if (pinyinOpt.isCorrect) {
      setStarTrigger((n) => n + 1);
      if (currentEntry) void audio.speak(glyphFor(currentEntry, script));
      setTimeout(advance, ADVANCE_DELAY_MS);
    } else {
      setWrongFlashPinyin(pinyinOpt.pinyin);
      setTimeout(() => {
        setWrongFlashPinyin(null);
        setSelectedPinyin(null);
      }, 600);
    }
  }

  useEffect(() => {
    if (revealed && currentEntry) {
      void audio.speak(glyphFor(currentEntry, script));
      const t = setTimeout(advance, ADVANCE_DELAY_MS + 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  if (roundDone) {
    const items = history.map((h) => {
      const entry = getCharacterById(h.id);
      return { id: h.id, glyph: entry ? glyphFor(entry, script) : h.id, emoji: entry?.emoji };
    });
    return <RoundSummary items={dedupe(items)} starCount={starCount} onDone={onExit} />;
  }

  if (!currentEntry) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const correctPinyin = currentEntry.pinyin;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: 24, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 480 }}>
        <button onClick={onExit} aria-label="Back" style={navButtonStyle}>
          ←
        </button>
        <LevelPicker level={level} onChange={setLevel} />
        <ScriptToggle />
      </div>

      <button onClick={() => setShowHint((v) => !v)} style={hintButtonStyle} aria-label="Toggle picture hint">
        {showHint ? "🙈" : "💡"}
      </button>

      <div style={{ position: "relative" }}>
        <CharacterCard glyph={glyphFor(currentEntry, script)} emoji={currentEntry.emoji} showHint={showHint} />
        <StarBurst trigger={starTrigger} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {options.map((opt) => {
          let state: "idle" | "selected" | "correct" | "wrong" = "idle";
          if (revealed) {
            state = opt.pinyin === correctPinyin ? "correct" : "idle";
          } else if (wrongFlashPinyin === opt.pinyin) {
            state = "wrong";
          } else if (selectedPinyin === opt.pinyin) {
            state = "selected";
          }
          return (
            <PinyinButton
              key={opt.pinyin + opt.speakerChar}
              pinyin={opt.pinyin}
              state={state}
              disabled={revealed || wrongFlashPinyin !== null}
              onTap={() => handleTap(opt)}
            />
          );
        })}
      </div>

      <button
        disabled={!selectedPinyin || revealed || wrongFlashPinyin !== null}
        onClick={() => {
          const opt = options.find((o) => o.pinyin === selectedPinyin);
          if (opt) confirmAnswer(opt);
        }}
        style={confirmButtonStyle(!selectedPinyin || revealed || wrongFlashPinyin !== null)}
      >
        ✓ Confirm
      </button>
    </div>
  );
}

function LevelPicker({ level, onChange }: { level: Level; onChange: (l: Level) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3].map((l) => (
        <button
          key={l}
          onClick={() => onChange(l as Level)}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: level === l ? "var(--color-primary)" : "var(--color-surface)",
            color: level === l ? "white" : "var(--color-ink)",
            fontWeight: 700,
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function dedupe(items: { id: string; glyph: string; emoji?: string }[]) {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}

const navButtonStyle: CSSProperties = {
  minWidth: "var(--tap-min)",
  minHeight: "var(--tap-min)",
  borderRadius: 20,
  border: "none",
  background: "var(--color-surface)",
  fontSize: 22,
};

const hintButtonStyle: CSSProperties = {
  minWidth: "var(--tap-min)",
  minHeight: "var(--tap-min)",
  borderRadius: "50%",
  border: "none",
  background: "var(--color-surface)",
  fontSize: 28,
};

function confirmButtonStyle(disabled: boolean): CSSProperties {
  return {
    minHeight: "var(--tap-min)",
    padding: "14px 40px",
    fontSize: 22,
    fontWeight: 700,
    borderRadius: 24,
    border: "none",
    background: disabled ? "var(--color-muted)" : "var(--color-success)",
    color: "white",
    opacity: disabled ? 0.6 : 1,
  };
}

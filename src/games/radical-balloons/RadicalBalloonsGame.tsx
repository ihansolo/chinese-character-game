import { useState, type CSSProperties } from "react";
import { radicalSets } from "../../data/loadContent";
import { audio } from "../../lib/services";
import { RoundSummary } from "../../components/RoundSummary";
import { BalloonView } from "./BalloonView";
import { useRadicalBalloonsRound, type Balloon, type BalloonLevel } from "./useRadicalBalloonsRound";

export function RadicalBalloonsGame({ onExit }: { onExit: () => void }) {
  const [setIndex, setSetIndex] = useState(0);
  const [level, setLevel] = useState<BalloonLevel>(1);
  const currentSet = radicalSets[setIndex];

  const { balloons, foundChars, starCount, secondsLeft, roundDone, registerHit, removeBalloon } =
    useRadicalBalloonsRound(currentSet, level);

  function handleTap(balloon: Balloon) {
    void audio.speak(balloon.char);
    registerHit(balloon);
  }

  if (roundDone) {
    const items = foundChars.map((char) => ({ id: char, glyph: char }));
    return <RoundSummary items={items} starCount={starCount} onDone={onExit} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
        <button onClick={onExit} aria-label="Back" style={navButtonStyle}>
          ←
        </button>
        <RadicalPicker
          sets={radicalSets}
          index={setIndex}
          onChange={setSetIndex}
        />
        <LevelPicker level={level} onChange={setLevel} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 56 }}>{currentSet.radical}</div>
        <div style={{ fontSize: 32 }}>{currentSet.emoji}</div>
        <div style={{ fontSize: 16, color: "var(--color-muted)" }}>{currentSet.hintLabel}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 18, padding: "8px 0" }}>
        <span>⭐ {starCount}</span>
        <span>⏱ {secondsLeft}s</span>
      </div>

      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {balloons.map((balloon) => (
          <BalloonView key={balloon.uid} balloon={balloon} onTap={handleTap} onFinished={removeBalloon} />
        ))}
      </div>
    </div>
  );
}

function RadicalPicker({
  sets,
  index,
  onChange,
}: {
  sets: { radical: string; emoji: string }[];
  index: number;
  onChange: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {sets.map((s, i) => (
        <button
          key={s.radical}
          onClick={() => onChange(i)}
          aria-label={`Radical ${s.radical}`}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: index === i ? "var(--color-primary)" : "var(--color-surface)",
            fontSize: 18,
          }}
        >
          {s.emoji}
        </button>
      ))}
    </div>
  );
}

function LevelPicker({ level, onChange }: { level: BalloonLevel; onChange: (l: BalloonLevel) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3].map((l) => (
        <button
          key={l}
          onClick={() => onChange(l as BalloonLevel)}
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

const navButtonStyle: CSSProperties = {
  minWidth: "var(--tap-min)",
  minHeight: "var(--tap-min)",
  borderRadius: 20,
  border: "none",
  background: "var(--color-surface)",
  fontSize: 22,
};

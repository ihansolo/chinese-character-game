import { useState } from "react";
import type { Balloon } from "./useRadicalBalloonsRound";

interface BalloonViewProps {
  balloon: Balloon;
  onTap: (balloon: Balloon) => void;
  onFinished: (uid: number) => void;
}

const BALLOON_COLORS = ["#ff9a56", "#7cc576", "#6fb7e8", "#f2a4a4", "#c9a6e8", "#ffd166"];

export function BalloonView({ balloon, onTap, onFinished }: BalloonViewProps) {
  const [phase, setPhase] = useState<"rising" | "popping">("rising");
  const color = BALLOON_COLORS[balloon.uid % BALLOON_COLORS.length];

  function handleTap() {
    if (phase !== "rising") return;
    setPhase("popping");
    onTap(balloon);
  }

  return (
    <button
      onClick={handleTap}
      aria-label={`Balloon ${balloon.char}`}
      style={{
        position: "absolute",
        left: `${balloon.leftPercent}%`,
        bottom: -100,
        width: 76,
        height: 92,
        border: "none",
        background: "transparent",
        padding: 0,
        animation:
          phase === "rising"
            ? `balloon-rise ${balloon.riseDurationMs}ms linear forwards`
            : balloon.isCorrect
              ? "balloon-pop 0.4s ease-out forwards"
              : "balloon-wobble 0.5s ease-in-out forwards",
      }}
      onAnimationEnd={() => onFinished(balloon.uid)}
    >
      <div
        style={{
          width: 64,
          height: 76,
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: 30,
          color: "white",
          boxShadow: "inset -6px -6px 0 rgba(0,0,0,0.06)",
          margin: "0 auto",
        }}
      >
        {balloon.char}
      </div>
      <div style={{ width: 2, height: 16, background: "#c9b8a8", margin: "0 auto" }} />
    </button>
  );
}

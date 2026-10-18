import { HoldButton } from "../components/HoldButton";
import { ScriptToggle } from "../components/ScriptToggle";
import type { Screen } from "../App";

export function Home({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: 32, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 480 }}>
        <ScriptToggle />
        <HoldButton label="Open parent settings" onActivate={() => onNavigate("parent")} />
      </div>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "16px 0" }}>漢字冒險</h1>

      <BigButton emoji="🔊" label="Which sound?" onClick={() => onNavigate("game1")} color="var(--color-primary)" />
      <BigButton emoji="🎈" label="Find the radical" onClick={() => onNavigate("game2")} color="var(--color-success)" />
      <BigButton emoji="📚" label="My characters" onClick={() => onNavigate("collection")} color="#6fb7e8" />
    </div>
  );
}

function BigButton({
  emoji,
  label,
  onClick,
  color,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        maxWidth: 420,
        minHeight: 88,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 28px",
        borderRadius: 28,
        border: "none",
        background: color,
        color: "white",
        fontSize: 22,
        fontWeight: 700,
        boxShadow: "0 6px 0 rgba(0,0,0,0.1)",
      }}
    >
      <span style={{ fontSize: 36 }}>{emoji}</span>
      {label}
    </button>
  );
}

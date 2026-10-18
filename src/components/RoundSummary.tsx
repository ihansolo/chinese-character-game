import { audio } from "../lib/services";

interface SummaryItem {
  id: string;
  glyph: string;
  emoji?: string;
}

interface RoundSummaryProps {
  items: SummaryItem[];
  starCount: number;
  onDone: () => void;
}

export function RoundSummary({ items, starCount, onDone }: RoundSummaryProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: 24 }}>
      <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 28, margin: 0 }}>
        {"⭐".repeat(Math.min(starCount, 10))} {starCount > 10 ? `x${starCount}` : ""}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
          gap: 12,
          maxWidth: 480,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => void audio.speak(item.glyph)}
            style={{
              minWidth: "var(--tap-min)",
              minHeight: "var(--tap-min)",
              fontFamily: "var(--font-display)",
              fontSize: 36,
              borderRadius: 16,
              border: "none",
              background: "var(--color-surface)",
              boxShadow: "0 4px 0 rgba(0,0,0,0.05)",
            }}
            aria-label={`Play sound for ${item.glyph}`}
          >
            {item.glyph}
          </button>
        ))}
      </div>
      <button
        onClick={onDone}
        style={{
          minHeight: "var(--tap-min)",
          padding: "16px 48px",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 24,
          border: "none",
          background: "var(--color-primary)",
          color: "white",
        }}
      >
        Done
      </button>
    </div>
  );
}

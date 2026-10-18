interface CharacterCardProps {
  glyph: string;
  emoji?: string;
  showHint: boolean;
  size?: number;
}

export function CharacterCard({ glyph, emoji, showHint, size = 160 }: CharacterCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        background: "var(--color-surface)",
        borderRadius: 32,
        padding: "24px 40px",
        boxShadow: "0 6px 0 rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size,
          lineHeight: 1,
          color: "var(--color-ink)",
        }}
      >
        {glyph}
      </div>
      {emoji && (
        <div style={{ fontSize: 40, minHeight: 48, opacity: showHint ? 1 : 0, transition: "opacity 0.2s" }}>
          {emoji}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { characters } from "../data/loadContent";
import { glyphFor } from "../data/types";
import { useSettings } from "../context/SettingsContext";
import { loadProgress, isCollected, type ProgressMap } from "../lib/progress";
import { audio, storage } from "../lib/services";

export function Collection({ onExit }: { onExit: () => void }) {
  const { script } = useSettings();
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    loadProgress(storage).then(setProgress);
  }, []);

  const collectedCount = characters.filter((c) => isCollected(progress, c.id)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 24, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 480 }}>
        <button onClick={onExit} aria-label="Back" style={navButtonStyle}>
          ←
        </button>
        <div style={{ fontSize: 18, alignSelf: "center" }}>
          {collectedCount} / {characters.length} collected
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
          gap: 12,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {characters.map((c) => {
          const collected = isCollected(progress, c.id);
          return (
            <button
              key={c.id}
              onClick={() => collected && void audio.speak(glyphFor(c, script))}
              disabled={!collected}
              style={{
                minWidth: "var(--tap-min)",
                minHeight: "var(--tap-min)",
                fontFamily: "var(--font-display)",
                fontSize: 34,
                borderRadius: 16,
                border: "none",
                background: collected ? "var(--color-surface)" : "#eee3d6",
                color: collected ? "var(--color-ink)" : "var(--color-muted)",
                boxShadow: collected ? "0 4px 0 rgba(0,0,0,0.05)" : "none",
              }}
              aria-label={collected ? `Play sound for ${glyphFor(c, script)}` : "Not yet collected"}
            >
              {collected ? glyphFor(c, script) : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navButtonStyle = {
  minWidth: "var(--tap-min)",
  minHeight: "var(--tap-min)",
  borderRadius: 20,
  border: "none",
  background: "var(--color-surface)",
  fontSize: 22,
} as const;

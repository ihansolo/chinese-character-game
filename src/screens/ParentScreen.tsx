import { useEffect, useState } from "react";
import { characters } from "../data/loadContent";
import { glyphFor } from "../data/types";
import { useSettings } from "../context/SettingsContext";
import { accuracyFor, loadProgress, resetProgress, type ProgressMap } from "../lib/progress";
import { storage } from "../lib/services";

export function ParentScreen({ onExit }: { onExit: () => void }) {
  const { script } = useSettings();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    loadProgress(storage).then(setProgress);
  }, []);

  async function handleReset() {
    await resetProgress(storage);
    setProgress({});
    setConfirmingReset(false);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, flex: 1, maxWidth: 560, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Parent settings</h2>
        <button onClick={onExit} aria-label="Close" style={navButtonStyle}>
          ✕
        </button>
      </div>

      <section>
        <h3>Accuracy per character</h3>
        <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid #eee3d6", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#fff2df" }}>
                <th style={cellStyle}>Char</th>
                <th style={cellStyle}>Pinyin</th>
                <th style={cellStyle}>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((c) => {
                const acc = accuracyFor(progress, c.id);
                return (
                  <tr key={c.id}>
                    <td style={{ ...cellStyle, fontFamily: "var(--font-display)", fontSize: 20 }}>
                      {glyphFor(c, script)}
                    </td>
                    <td style={{ ...cellStyle, fontFamily: "var(--font-ui)" }}>{c.pinyin}</td>
                    <td style={cellStyle}>{acc === null ? "—" : `${Math.round(acc * 100)}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Reset progress</h3>
        {confirmingReset ? (
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleReset} style={dangerButtonStyle}>
              Yes, reset everything
            </button>
            <button onClick={() => setConfirmingReset(false)} style={navButtonStyle}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmingReset(true)} style={dangerButtonStyle}>
            Reset all progress
          </button>
        )}
      </section>
    </div>
  );
}

const cellStyle = { padding: "8px 12px", borderBottom: "1px solid #f2e9dc" } as const;

const navButtonStyle = {
  minWidth: "var(--tap-min)",
  minHeight: "var(--tap-min)",
  borderRadius: 20,
  border: "none",
  background: "var(--color-surface)",
  fontSize: 18,
} as const;

const dangerButtonStyle = {
  minHeight: "var(--tap-min)",
  padding: "12px 24px",
  borderRadius: 16,
  border: "none",
  background: "var(--color-danger-soft)",
  color: "#7a2f2f",
  fontWeight: 600,
} as const;

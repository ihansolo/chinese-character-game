import { useSettings } from "../context/SettingsContext";

export function ScriptToggle() {
  const { script, setScript } = useSettings();
  const isTraditional = script === "traditional";

  return (
    <button
      onClick={() => setScript(isTraditional ? "simplified" : "traditional")}
      style={{
        minHeight: "var(--tap-min)",
        padding: "8px 20px",
        borderRadius: 20,
        border: "2px solid var(--color-muted)",
        background: "var(--color-surface)",
        fontSize: 16,
        fontWeight: 600,
        color: "var(--color-ink)",
      }}
    >
      {isTraditional ? "繁體" : "简体"}
    </button>
  );
}

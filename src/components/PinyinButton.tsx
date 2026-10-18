type ButtonState = "idle" | "selected" | "correct" | "wrong";

interface PinyinButtonProps {
  pinyin: string;
  state: ButtonState;
  onTap: () => void;
  disabled?: boolean;
}

const STATE_STYLES: Record<ButtonState, { bg: string; border: string; color: string }> = {
  idle: { bg: "var(--color-surface)", border: "transparent", color: "var(--color-ink)" },
  selected: { bg: "#fff2df", border: "var(--color-primary)", color: "var(--color-ink)" },
  correct: { bg: "#e6f7e4", border: "var(--color-success-dark)", color: "var(--color-success-dark)" },
  wrong: { bg: "#fbe8e8", border: "var(--color-danger-soft)", color: "#c76a6a" },
};

export function PinyinButton({ pinyin, state, onTap, disabled }: PinyinButtonProps) {
  const style = STATE_STYLES[state];
  return (
    <button
      onClick={onTap}
      disabled={disabled}
      className={state === "wrong" ? "shake" : undefined}
      style={{
        minWidth: "var(--tap-min)",
        minHeight: "var(--tap-min)",
        padding: "16px 28px",
        fontFamily: "var(--font-ui)",
        fontSize: 28,
        fontWeight: 600,
        borderRadius: 20,
        border: `3px solid ${style.border}`,
        background: style.bg,
        color: style.color,
        boxShadow: "0 4px 0 rgba(0,0,0,0.05)",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {pinyin}
    </button>
  );
}

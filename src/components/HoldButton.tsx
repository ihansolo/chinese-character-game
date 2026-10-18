import { useRef, useState } from "react";

interface HoldButtonProps {
  onActivate: () => void;
  holdMs?: number;
  label: string;
}

export function HoldButton({ onActivate, holdMs = 1500, label }: HoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const cancel = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setProgress(0);
  };

  const start = () => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / holdMs);
      setProgress(pct);
      if (pct >= 1) {
        cancel();
        onActivate();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  return (
    <button
      aria-label={label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      style={{
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        background: "var(--color-muted)",
        opacity: 0.35,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--color-primary)",
          transform: `scaleY(${progress})`,
          transformOrigin: "bottom",
          transition: progress === 0 ? "transform 0.15s ease-out" : "none",
        }}
      />
    </button>
  );
}

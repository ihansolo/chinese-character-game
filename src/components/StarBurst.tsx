import { useEffect, useState } from "react";

export function StarBurst({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!show) return null;

  const stars = Array.from({ length: 8 });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {stars.map((_, i) => {
        const angle = (i / stars.length) * 2 * Math.PI;
        const distance = 90;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              fontSize: 28,
              transform: "translate(-50%, -50%)",
              animation: `star-fly-${i} 0.9s ease-out forwards`,
              ["--tx" as string]: `${x}px`,
              ["--ty" as string]: `${y}px`,
            }}
          >
            <StarKeyframes id={i} />⭐
          </span>
        );
      })}
    </div>
  );
}

function StarKeyframes({ id }: { id: number }) {
  return (
    <style>{`
      @keyframes star-fly-${id} {
        0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
        70% { opacity: 1; }
        100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.1); opacity: 0; }
      }
    `}</style>
  );
}

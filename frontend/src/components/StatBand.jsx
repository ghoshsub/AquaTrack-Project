import React from "react";
import useCountUp from "../hooks/useCountUp.js";

export default function StatBand() {
  const households = useCountUp(1240);
  const accuracy = useCountUp(998);
  const cycles = useCountUp(86);

  const stats = [
    { value: households, suffix: "+", label: "households metered" },
    { value: (accuracy / 10).toFixed(1), suffix: "%", label: "billing accuracy" },
    { value: cycles, suffix: "", label: "cycles closed on time" },
  ];

  return (
    <section style={{ background: "var(--at-ink)" }} className="py-10">
      <div
        className="at-container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "0 16px",
              borderLeft: i > 0 ? "1px solid rgba(237,232,222,0.15)" : "none",
            }}
          >
            <div className="at-mono" style={{ color: "var(--at-brass)", fontSize: "30px", fontWeight: 500 }}>
              {s.value}
              {s.suffix}
            </div>
            <div style={{ color: "rgba(237,232,222,0.6)", fontSize: "13px", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

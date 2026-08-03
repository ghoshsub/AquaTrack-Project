import React from "react";
import useCountUp from "../hooks/useCountUp.js";

export default function StatBand() {
  const households = useCountUp(1240);
  const accuracy = useCountUp(998);
  const cycles = useCountUp(86);

  const stats = [
    { value: households, suffix: "+", label: "Households Metered" },
    { value: (accuracy / 10).toFixed(1), suffix: "%", label: "Billing Accuracy" },
    { value: cycles, suffix: "", label: "Cycles Closed On Time" },
  ];

  return (
    <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(17,26,42,0.5)", backdropFilter: "blur(12px)", padding: "36px 0" }}>
      <div
        className="at-container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            <div style={{ fontSize: "36px", fontWeight: 800, background: "linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
              {s.value}{s.suffix}
            </div>
            <div style={{ color: "#64748B", fontSize: "13px", fontWeight: 500, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

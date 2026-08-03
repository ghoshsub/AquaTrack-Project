import React from "react";

const STEPS = [
  {
    n: "01",
    title: "Record Meter Readings",
    body: "Enter individual household readings manually or import batch CSV readings for the entire apartment complex.",
  },
  {
    n: "02",
    title: "Close & Finalize Cycle",
    body: "AquaTrack evaluates consumption against tariff rules, applies base/excess rates, and calculates total dues.",
  },
  {
    n: "03",
    title: "Deliver Digital Invoices",
    body: "Every resident receives an itemized digital breakdown accessible right from their personal resident dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,22,36,0.6)", padding: "80px 0" }}>
      <div className="at-container">
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            From meter log to invoice in 3 simple steps
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px" }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                background: "rgba(17,26,42,0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "32px 24px",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#38BDF8", background: "rgba(56,189,248,0.1)", padding: "4px 10px", borderRadius: "8px", display: "inline-block", marginBottom: "16px" }}>
                {s.n}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#94A3B8", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

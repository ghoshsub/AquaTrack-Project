import React from "react";

const STEPS = [
  {
    n: "01",
    title: "Read the meter",
    body: "Residents or admins log a reading — by hand, or in bulk from a CSV file.",
  },
  {
    n: "02",
    title: "Close the cycle",
    body: "AquaTrack applies your tariff plan and splits shared costs across every flat.",
  },
  {
    n: "03",
    title: "Send the invoice",
    body: "Each household gets an itemized bill, with a plain-language breakdown.",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ background: "var(--at-limestone-deep)" }} className="py-20">
      <div className="at-container" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <h2 className="at-display" style={{ fontSize: "28px", fontWeight: 600, color: "var(--at-ink-deep)", marginBottom: "36px" }}>
          From reading to invoice, in three steps.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="at-mono" style={{ color: "var(--at-brass-deep)", fontSize: "13px", fontWeight: 500 }}>
                {s.n}
              </div>
              <h3 className="at-display" style={{ fontSize: "19px", fontWeight: 600, marginTop: "8px", color: "var(--at-ink-deep)" }}>
                {s.title}
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(20,43,46,0.7)", marginTop: "6px" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

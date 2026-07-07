import React from "react";

export default function AboutPage() {
  return (
    <section className="at-container" style={{ maxWidth: "720px", paddingTop: "80px", paddingBottom: "80px" }}>
      <h1 className="at-display" style={{ fontSize: "32px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
        About AquaTrack
      </h1>
      <p style={{ marginTop: "16px", fontSize: "15px", lineHeight: 1.75, color: "rgba(20,43,46,0.75)" }}>
        AquaTrack helps residential communities go from a raw water meter reading to a clear,
        itemized bill — without spreadsheets or manual arithmetic. Admins configure tariff plans
        once; the platform applies them consistently to every household, every cycle.
      </p>
      <p style={{ marginTop: "14px", fontSize: "15px", lineHeight: 1.75, color: "rgba(20,43,46,0.75)" }}>
        Built on Spring Boot, MySQL, and a React dashboard, AquaTrack tracks usage, flags
        anomalies, and keeps a full history of every billing cycle for every flat in the building.
      </p>
    </section>
  );
}

import React from "react";
import { Gauge, ShieldCheck, BellRing } from "lucide-react";

const ITEMS = [
  {
    icon: Gauge,
    title: "Tiered billing",
    body: "Base and excess rates apply automatically, per apartment, no spreadsheets.",
  },
  {
    icon: ShieldCheck,
    title: "Duplicate-safe logging",
    body: "Manual entries and bulk CSV imports are checked against each other, always.",
  },
  {
    icon: BellRing,
    title: "Leak alerts",
    body: "Unusual consumption is flagged before it becomes an unpleasant invoice.",
  },
];

export default function Features() {
  return (
    <section className="at-container" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <h2 className="at-display" style={{ fontSize: "28px", fontWeight: 600, color: "var(--at-ink-deep)", marginBottom: "36px" }}>
        Built around one meter reading at a time.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {ITEMS.map(({ icon: Icon, title, body }, i) => (
          <div key={i} className="at-card" style={{ padding: "24px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "var(--at-limestone)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={19} color="var(--at-verdigris-deep)" />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: "16px", marginTop: "16px", color: "var(--at-ink-deep)" }}>{title}</h3>
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(20,43,46,0.7)", marginTop: "6px" }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

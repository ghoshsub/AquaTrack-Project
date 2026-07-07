import React from "react";
import { Gauge } from "lucide-react";

export default function DashboardPage({ auth }) {
  return (
    <section className="at-container" style={{ maxWidth: "900px", paddingTop: "80px", paddingBottom: "80px" }}>
      <p className="at-mono" style={{ color: "var(--at-verdigris-deep)", fontSize: "12px", letterSpacing: "0.1em" }}>
        {auth?.role || "USER"} DASHBOARD
      </p>
      <h1 className="at-display" style={{ fontSize: "30px", fontWeight: 600, color: "var(--at-ink-deep)", marginTop: "6px" }}>
        Welcome, {auth?.username || "there"}.
      </h1>
      <p style={{ marginTop: "10px", fontSize: "14px", color: "rgba(20,43,46,0.7)" }}>
        This is a placeholder — the real dashboard (usage charts, billing cycles, invoices) gets
        built in Phase 2.
      </p>
      <div className="at-card at-flex at-items-center at-gap-4" style={{ padding: "32px", marginTop: "32px" }}>
        <Gauge size={28} color="var(--at-verdigris-deep)" />
        <div>
          <div style={{ fontWeight: 600, fontSize: "15px" }}>You're logged in successfully.</div>
          <div style={{ fontSize: "13px", color: "rgba(20,43,46,0.6)", marginTop: "2px" }}>
            Token stored in memory for this session.
          </div>
        </div>
      </div>
    </section>
  );
}

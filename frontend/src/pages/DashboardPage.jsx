import React from "react";
import { Gauge, Building2, Home, ArrowRight } from "lucide-react";

function QuickLinkCard({ icon: Icon, title, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className="at-card at-focus"
      style={{
        padding: "22px",
        textAlign: "left",
        cursor: "pointer",
        border: "1px solid rgba(20,43,46,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "9px",
          background: "var(--at-limestone)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color="var(--at-verdigris-deep)" />
      </div>
      <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--at-ink-deep)" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "rgba(20,43,46,0.65)", lineHeight: 1.5 }}>{body}</div>
      <div className="at-flex at-items-center at-gap-1" style={{ fontSize: "13px", fontWeight: 600, color: "var(--at-verdigris-deep)", marginTop: "4px" }}>
        Open <ArrowRight size={14} />
      </div>
    </button>
  );
}

export default function DashboardPage({ auth, setPage }) {
  const isAdmin = auth?.role === "ADMIN";

  return (
    <section className="at-container" style={{ maxWidth: "900px", paddingTop: "80px", paddingBottom: "80px" }}>
      <p className="at-mono" style={{ color: "var(--at-verdigris-deep)", fontSize: "12px", letterSpacing: "0.1em" }}>
        {auth?.role || "USER"} DASHBOARD
      </p>
      <h1 className="at-display" style={{ fontSize: "30px", fontWeight: 600, color: "var(--at-ink-deep)", marginTop: "6px" }}>
        Welcome, {auth?.username || "there"}.
      </h1>
      <p style={{ marginTop: "10px", fontSize: "14px", color: "rgba(20,43,46,0.7)" }}>
        This is a basic dashboard — the full version (usage charts, billing cycles, invoices)
        gets built in Phase 2.
      </p>

      <div className="at-card at-flex at-items-center at-gap-4" style={{ padding: "28px", marginTop: "28px" }}>
        <Gauge size={26} color="var(--at-verdigris-deep)" />
        <div>
          <div style={{ fontWeight: 600, fontSize: "15px" }}>You're logged in successfully.</div>
          <div style={{ fontSize: "13px", color: "rgba(20,43,46,0.6)", marginTop: "2px" }}>
            Token stored in memory for this session.
          </div>
        </div>
      </div>

      {isAdmin && (
        <>
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginTop: "36px", marginBottom: "14px", color: "var(--at-ink-deep)" }}>
            Admin tools
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <QuickLinkCard
              icon={Building2}
              title="Apartments"
              body="Onboard a new building or review existing ones."
              onClick={() => setPage("admin-apartments")}
            />
            <QuickLinkCard
              icon={Home}
              title="Households"
              body="Add flats to an apartment and manage occupancy."
              onClick={() => setPage("admin-households")}
            />
          </div>
        </>
      )}
    </section>
  );
}

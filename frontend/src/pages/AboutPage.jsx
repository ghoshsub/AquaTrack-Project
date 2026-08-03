import React from "react";
import { Droplets, Shield, Zap, Cpu } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";

export default function AboutPage({ setPage }) {
  const cardStyle = { background: "rgba(17,26,42,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(16px)" };

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "30px", minWidth: "800px", paddingBottom: "168px" }}>
      <div>
        {setPage && <BackToDashboard setPage={setPage} />}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Droplets size={22} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>About AquaTrack</h1>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>Automated, transparent water billing for modern residential communities</p>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: "70px 34px", display: "flex", flexDirection: "column", gap: "20px", }}>
        <p style={{ fontSize: "15px", lineHeight: 1.75, color: "#94A3B8", margin: 0 }}>
          AquaTrack helps residential communities transition seamlessly from raw meter logs to crystal-clear itemized bills — eliminating messy spreadsheets, manual math errors, and resident disputes.
        </p>

        <p style={{ fontSize: "15px", lineHeight: 1.75, color: "#94A3B8", margin: 0 }}>
          Admins configure building-level tariff rate tiers once; AquaTrack then automatically computes base and excess consumption charges for every flat when closing billing cycles.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "12px" }}>
          {[
            { icon: Zap, title: "Tiered Pricing", desc: "Automated base and excess consumption tier calculation", color: "#38BDF8" },
            { icon: Shield, title: "Duplicate Safe", desc: "Prevents accidental duplicate readings on the same date", color: "#10B981" },
            { icon: Cpu, title: "Modern Tech", desc: "Powered by Spring Boot 3, MySQL 8, and React 18", color: "#818CF8" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px" }}>
              <Icon size={20} color={color} style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{title}</div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

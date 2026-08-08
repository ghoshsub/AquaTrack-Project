import React from "react";
import { useTranslation } from "react-i18next";
import { Gauge, ShieldCheck, BellRing } from "lucide-react";

export default function Features() {
  const { t } = useTranslation();

  const ITEMS = [
    {
      icon: Gauge,
      title: t("features.f2Title"),
      body: t("features.f2Desc"),
      color: "#38BDF8",
    },
    {
      icon: ShieldCheck,
      title: t("features.f1Title"),
      body: t("features.f1Desc"),
      color: "#10B981",
    },
    {
      icon: BellRing,
      title: t("features.f4Title"),
      body: t("features.f4Desc"),
      color: "#F43F5E",
    },
  ];

  return (
    <section className="at-container" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
          {t("features.heading")}
        </h2>
        <p style={{ fontSize: "15px", color: "#64748B", marginTop: "10px", lineHeight: 1.6 }}>
          {t("features.subheading")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
        {ITEMS.map(({ icon: Icon, title, body, color }, i) => (
          <div
            key={i}
            style={{
              background: "rgba(17,26,42,0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "28px",
              backdropFilter: "blur(16px)",
              transition: "transform 0.18s ease, border-color 0.18s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={color} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "17px", marginTop: "20px", color: "#FFFFFF" }}>{title}</h3>
            <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#94A3B8", marginTop: "8px" }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

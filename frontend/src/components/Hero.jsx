import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Droplets, Sparkles } from "lucide-react";

export default function Hero({ setPage }) {
  const { t } = useTranslation();

  return (
    <section
      style={{
        paddingTop: "64px",
        paddingBottom: "80px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "20px",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#38BDF8",
              marginBottom: "20px",
            }}
          >
            <Sparkles size={14} />
            <span>{t("hero.badge")}</span>
          </div>

          <h1
            style={{
              fontSize: "48px",
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--admin-text-white)",
              margin: 0,
            }}
          >
            {t("hero.heading1")}{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("hero.heading2")}
            </span>{" "}
            {t("hero.heading3")}
          </h1>

          <p
            style={{
              marginTop: "20px",
              fontSize: "16px",
              lineHeight: 1.65,
              color: "var(--admin-text-muted)",
              maxWidth: "480px",
            }}
          >
            {t("hero.subtext")}
          </p>

          <div style={{ display: "flex", gap: "14px", marginTop: "32px", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("register")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                border: "none",
                color: "#0F172A",
                fontWeight: 700,
                fontSize: "15px",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(56, 189, 248, 0.35)",
                fontFamily: "inherit",
                transition: "transform 0.18s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              {t("hero.cta1")} <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setPage("about")}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "15px",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; e.currentTarget.style.background = "rgba(56,189,248,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              {t("hero.cta2")}
            </button>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div
          style={{
            background: "rgba(17, 26, 42, 0.85)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            padding: "32px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(56,189,248,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Droplets size={20} color="#38BDF8" />
              </div>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>{t("dashboard.recentActivity")}</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#34D399", background: "rgba(16,185,129,0.15)", padding: "3px 10px", borderRadius: "20px" }}>{t("hero.stat1Label")}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { flat: "A-101", usage: "340.5 L", status: "Normal", color: "#38BDF8" },
              { flat: "A-102", usage: "890.0 L", status: "High Usage", color: "#FBBF24" },
              { flat: "B-201", usage: "1,240.2 L", status: "Leak Suspected", color: "#F87171" },
            ].map(item => (
              <div key={item.flat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF" }}>Flat {item.flat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{item.usage}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: item.color, background: `${item.color}15`, padding: "2px 8px", borderRadius: "6px" }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

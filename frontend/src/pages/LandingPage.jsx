import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TypeAnimation } from "react-type-animation";
import {
  Droplets, ArrowRight, ShieldCheck, Zap, Gauge, BellRing, Building2,
  CheckCircle2, Sparkles, Activity, Layers, Database, ChevronRight, BarChart3, Lock
} from "lucide-react";
import Water3DCanvas from "../components/Water3DCanvas.jsx";

export default function LandingPage({ setPage }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("telemetry");

  const cardGlassStyle = {
    background: "rgba(17, 26, 42, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 50px -20px rgba(56, 189, 248, 0.1)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B1120", color: "#FFFFFF", fontFamily: "Inter, sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* Background Ambient Glowing Orbs */}
      <div style={{ position: "absolute", top: "-100px", left: "15%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "600px", right: "5%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0, 0, 0, 0) 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "1600px", left: "10%", width: "650px", height: "650px", background: "radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(0, 0, 0, 0) 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Main Container */}
      <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 16px" }}>

        {/* HERO SECTION */}
        <section style={{ paddingTop: "50px", paddingBottom: "80px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px", alignItems: "center" }}>

            {/* Left Hero Content */}
            <div>
              {/* Pill Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: "20px",
                  padding: "6px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#38BDF8",
                  marginBottom: "24px",
                }}
              >
                <Sparkles size={14} />
                <span>{t("hero.badge")}</span>
              </div>

              <h1 className="font-extrabold leading-tight tracking-tight">
                <span className="text-white/85 text-3xl md:text-4xl lg:text-5xl">
                  {t("hero.mainHeading")}
                </span>

                <br />

                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent text-3xl md:text-4xl lg:text-5xl">
                  <TypeAnimation
                    sequence={[
                      t("hero.animation1"), 1300,
                      t("hero.animation2"), 1300,
                      t("hero.animation3"), 1300,
                      t("hero.animation4"), 1300,
                      t("hero.animation5"), 1300,
                    ]}
                    wrapper="span"
                    speed={55}
                    repeat={Infinity}
                    cursor={true}
                  />
                </span>
              </h1>
              <p
                style={{
                  marginTop: "20px",
                  fontSize: "17px",
                  lineHeight: 1.65,
                  color: "#94A3B8",
                  maxWidth: "500px",
                }}
              >
                {t("hero.subtext")}
              </p>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "14px", marginTop: "36px", flexWrap: "wrap" }}>
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
                    padding: "14px 28px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(56, 189, 248, 0.4)",
                    fontFamily: "inherit",
                    transition: "all 0.18s ease",
                  }}
                >
                  {t("hero.cta1")} <ArrowRight size={16} />
                </button>


              </div>

              {/* Trust Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B" }}>
                  <ShieldCheck size={16} color="#34D399" />
                  <span>{t("features.f6Title")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B" }}>
                  <Zap size={16} color="#38BDF8" />
                  <span>{t("hero.stat2Label")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B" }}>
                  <Database size={16} color="#818CF8" />
                  <span>{t("features.f5Title")}</span>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Canvas Scene */}
            <div style={{ position: "relative" }}>
              <div style={{ ...cardGlassStyle, overflow: "hidden", position: "relative" }}>
                <Water3DCanvas />

                {/* Floating Telemetry Pill Badges */}
                <div style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "12px", padding: "8px 14px", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#FFFFFF" }}>{t("hero.stat1Label")}: 94.2%</span>
                </div>

                <div style={{ position: "absolute", bottom: "20px", right: "20px", background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "12px", padding: "8px 14px", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={14} color="#38BDF8" />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#38BDF8" }}>{t("dashboard.consumption")}: 4.8 L/s</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* STATISTICS GRID */}
        <section style={{ marginBottom: "100px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {[
              { val: t("hero.stat1Value"), label: t("hero.stat1Label"), sub: "Billing accuracy", color: "#38BDF8" },
              { val: t("hero.stat2Value"), label: t("hero.stat2Label"), sub: "Real-time uptime", color: "#34D399" },
              { val: t("hero.stat3Value"), label: t("hero.stat3Label"), sub: "Processed volume", color: "#818CF8" },
              { val: t("hero.stat4Value"), label: t("hero.stat4Label"), sub: "Average savings", color: "#FBBF24" },
            ].map((st, idx) => (
              <div key={idx} style={{ ...cardGlassStyle, padding: "28px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", fontWeight: 800, color: st.color, letterSpacing: "-0.02em" }}>{st.val}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginTop: "6px" }}>{st.label}</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>{st.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES GRID */}
        <section style={{ marginBottom: "120px" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 56px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              {t("features.heading")}
            </h2>
            <p style={{ fontSize: "16px", color: "#94A3B8", marginTop: "12px", lineHeight: 1.6 }}>
              {t("features.subheading")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {[
              { icon: Gauge, title: t("features.f1Title"), desc: t("features.f1Desc"), color: "#38BDF8" },
              { icon: ShieldCheck, title: t("features.f2Title"), desc: t("features.f2Desc"), color: "#34D399" },
              { icon: BellRing, title: t("features.f3Title"), desc: t("features.f3Desc"), color: "#F43F5E" },
              { icon: Building2, title: t("features.f4Title"), desc: t("features.f4Desc"), color: "#818CF8" },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  ...cardGlassStyle,
                  padding: "32px 24px",
                  transition: "transform 0.18s ease, border-color 0.18s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${f.color}50`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${f.color}15`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 10px" }}>{f.title}</h3>
                <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE DASHBOARD PREVIEW SECTION */}
        <section style={{ marginBottom: "120px" }}>
          <div style={{ ...cardGlassStyle, padding: "36px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{t("sidebar.adminConsole")}</h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0" }}>{t("adminHeader.dashboardSub")}</p>
              </div>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px" }}>
                {[["telemetry", t("sidebar.dashboard")], ["breakdown", t("sidebar.invoices")], ["history", t("sidebar.waterUsage")]].map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{ background: activeTab === tab ? "rgba(56,189,248,0.15)" : "transparent", border: activeTab === tab ? "1px solid rgba(56,189,248,0.3)" : "1px solid transparent", color: activeTab === tab ? "#38BDF8" : "#64748B", fontSize: "13px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Content Mock */}
            <div style={{ background: "rgba(11, 17, 32, 0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>{t("apartments.title")}</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>12 {t("apartments.title")}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>{t("dashboard.totalConsumption")}</span>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#38BDF8", marginTop: "4px" }}>156,800 L</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>{t("billing.status")}</span>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#34D399", background: "rgba(16,185,129,0.15)", padding: "4px 10px", borderRadius: "20px", display: "inline-block", marginTop: "8px" }}>
                    {t("billing.open")}
                  </div>
                </div>
              </div>

              {/* Mock Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#64748B", fontSize: "11px", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px" }}>{t("apartments.name")}</th>
                      <th style={{ padding: "12px" }}>{t("households.title")}</th>
                      <th style={{ padding: "12px" }}>{t("waterUsage.reading")}</th>
                      <th style={{ padding: "12px" }}>{t("invoices.total")}</th>
                      <th style={{ padding: "12px" }}>{t("common.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Green Meadows", flats: 48, usage: "125,600 L", amount: "₹1,25,600", status: t("billing.open"), color: "#34D399" },
                      { name: "Sunrise Residency", flats: 36, usage: "98,400 L", amount: "₹98,400", status: t("billing.open"), color: "#34D399" },
                      { name: "Lake View Heights", flats: 52, usage: "156,800 L", amount: "₹1,56,800", status: t("billing.finalized"), color: "#F87171" },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
                        <td style={{ padding: "14px 12px", fontWeight: 600, color: "#FFFFFF" }}>{row.name}</td>
                        <td style={{ padding: "14px 12px", color: "#94A3B8" }}>{row.flats} {t("households.title")}</td>
                        <td style={{ padding: "14px 12px", color: "#38BDF8", fontWeight: 600 }}>{row.usage}</td>
                        <td style={{ padding: "14px 12px", color: "#FFFFFF", fontWeight: 600 }}>{row.amount}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "12px", background: `${row.color}15`, color: row.color }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{ marginBottom: "100px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)",
              border: "1px solid rgba(56,189,248,0.3)",
              borderRadius: "24px",
              padding: "56px 32px",
              textAlign: "center",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 80px -20px rgba(56, 189, 248, 0.25)",
            }}
          >
            <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", margin: 0 }}>
              {t("cta.heading")}
            </h2>
            <p style={{ fontSize: "16px", color: "#94A3B8", marginTop: "14px", maxWidth: "520px", margin: "14px auto 0", lineHeight: 1.6 }}>
              {t("cta.subheading")}
            </p>
            <button
              onClick={() => setPage("register")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                border: "none",
                color: "#0F172A",
                fontWeight: 700,
                fontSize: "16px",
                padding: "14px 32px",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(56, 189, 248, 0.4)",
                fontFamily: "inherit",
                marginTop: "32px",
              }}
            >
              {t("cta.button")} <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { Droplets, Shield, Zap, Cpu } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";

export default function AboutPage({ setPage }) {
  const { t } = useTranslation();
  const cardStyle = {
    background: "var(--admin-card-bg)",
    border: "1px solid var(--admin-card-border)",
    borderRadius: "16px",
    backdropFilter: "blur(16px)",
    boxShadow: "var(--admin-card-shadow)",
  };

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "30px", minWidth: "800px", paddingBottom: "168px" }}>
      <div>
        {setPage && <BackToDashboard setPage={setPage} />}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Droplets size={22} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("about.title")}</h1>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>{t("about.subtitle")}</p>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: "70px 34px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--admin-text-muted)", margin: 0 }}>
          {t("about.missionText")}
        </p>

        <p style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--admin-text-muted)", margin: 0 }}>
          {t("hero.subtext")}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "12px" }}>
          {[
            { icon: Zap, title: t("features.f2Title"), desc: t("features.f2Desc"), color: "#38BDF8" },
            { icon: Shield, title: t("features.f1Title"), desc: t("features.f1Desc"), color: "#10B981" },
            { icon: Cpu, title: t("about.tech"), desc: "Spring Boot, MySQL, React & i18next", color: "#818CF8" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-subcard-border)", borderRadius: "12px", padding: "16px" }}>
              <Icon size={20} color={color} style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-white)" }}>{title}</div>
              <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

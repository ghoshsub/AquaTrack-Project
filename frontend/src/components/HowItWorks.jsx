import React from "react";
import { useTranslation } from "react-i18next";

export default function HowItWorks() {
  const { t } = useTranslation();

  const STEPS = [
    {
      n: "01",
      title: t("howItWorks.step1Title"),
      body: t("howItWorks.step1Desc"),
    },
    {
      n: "02",
      title: t("howItWorks.step2Title"),
      body: t("howItWorks.step2Desc"),
    },
    {
      n: "03",
      title: t("howItWorks.step3Title"),
      body: t("howItWorks.step3Desc"),
    },
  ];

  return (
    <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,22,36,0.6)", padding: "80px 0" }}>
      <div className="at-container">
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            {t("howItWorks.heading")}
          </h2>
          <p style={{ fontSize: "15px", color: "#64748B", marginTop: "10px", lineHeight: 1.6 }}>
            {t("howItWorks.subheading")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px" }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                background: "rgba(17,26,42,0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "32px 24px",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#38BDF8", background: "rgba(56,189,248,0.1)", padding: "4px 10px", borderRadius: "8px", display: "inline-block", marginBottom: "16px" }}>
                {s.n}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#94A3B8", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

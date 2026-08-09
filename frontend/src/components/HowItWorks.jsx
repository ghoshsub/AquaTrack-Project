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
    <section style={{ borderTop: "1px solid var(--admin-card-border)", background: "var(--admin-subcard-bg)", padding: "80px 0" }}>
      <div className="at-container">
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "var(--admin-text-white)", letterSpacing: "-0.02em" }}>
            {t("howItWorks.heading")}
          </h2>
          <p style={{ fontSize: "15px", color: "var(--admin-text-muted)", marginTop: "10px", lineHeight: 1.6 }}>
            {t("howItWorks.subheading")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px" }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                background: "var(--admin-card-bg)",
                border: "1px solid var(--admin-card-border)",
                boxShadow: "var(--admin-card-shadow)",
                borderRadius: "16px",
                padding: "32px 24px",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0284C7", background: "rgba(56,189,248,0.12)", padding: "4px 10px", borderRadius: "8px", display: "inline-block", marginBottom: "16px" }}>
                {s.n}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--admin-text-white)", margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--admin-text-muted)", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

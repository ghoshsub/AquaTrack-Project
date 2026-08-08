import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

export default function CTA({ setPage }) {
  const { t } = useTranslation();

  return (
    <section style={{ padding: "80px 0" }}>
      <div className="at-container" style={{ maxWidth: "800px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(99,102,241,0.15) 100%)",
            border: "1px solid rgba(56,189,248,0.3)",
            borderRadius: "24px",
            padding: "48px 32px",
            textAlign: "center",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 80px -20px rgba(56,189,248,0.2)",
          }}
        >
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", margin: 0 }}>
            {t("cta.heading")}
          </h2>
          <p style={{ fontSize: "16px", color: "#94A3B8", marginTop: "12px", maxWidth: "500px", margin: "12px auto 0", lineHeight: 1.6 }}>
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
              fontSize: "15px",
              padding: "13px 28px",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(56,189,248,0.35)",
              fontFamily: "inherit",
              marginTop: "28px",
            }}
          >
            {t("cta.button")} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

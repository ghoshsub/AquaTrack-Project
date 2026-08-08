import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard({ setPage }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => setPage("dashboard")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e3e3e3",
        padding: "12px 18px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.18s ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = "#38BDF8"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "var(--admin-text-muted)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
    >
      <ArrowLeft size={14} />
      {t("common.back")}
    </button>
  );
}

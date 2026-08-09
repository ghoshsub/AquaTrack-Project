import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)" };
const inputBase = {
  width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

export default function ContactPage({ setPage }) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
    setFeedback("");
    setName("");
  }

  const cardStyle = { background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "16px", backdropFilter: "blur(16px)", boxShadow: "var(--admin-card-shadow)" };

  return (
    <div style={{ maxWidth: "550px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", padding: "40px" }}>
      <div>
        {setPage && <BackToDashboard setPage={setPage} />}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(16,185,129,0.2) 100%)", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={22} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("contact.title")}</h1>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>{t("contact.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Direct Contact Card */}
      <div style={{ ...cardStyle, padding: "18px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={18} color="#38BDF8" />
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{t("contact.email")}</span>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-white)", margin: "2px 0 0" }}>support@aquatrack.com</p>
        </div>
      </div>

      {/* Feedback Form Card */}
      <div style={{ ...cardStyle, padding: "28px" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle2 size={44} color="#34D399" style={{ display: "block", margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>{t("contact.success")}</h3>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", marginTop: "6px" }}>{t("contact.subtitle")}</p>
            <button onClick={() => setSent(false)} style={{ background: "none", border: "none", color: "var(--admin-accent)", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit", marginTop: "16px" }}>
              {t("contact.send")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t("contact.name")}</label>
              <input style={inputBase} value={name} onChange={e => setName(e.target.value)} placeholder={t("contact.namePlaceholder")}
                onFocus={e => { e.target.style.borderColor = "var(--admin-accent)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--admin-input-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t("contact.message")} *</label>
              <textarea style={{ ...inputBase, minHeight: "120px", resize: "vertical", lineHeight: 1.5 }} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder={t("contact.messagePlaceholder")} required
                onFocus={e => { e.target.style.borderColor = "var(--admin-accent)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--admin-input-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <button type="submit" disabled={sending || !feedback.trim()}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 700, fontSize: "14px", padding: "12px", borderRadius: "10px", cursor: sending || !feedback.trim() ? "not-allowed" : "pointer", opacity: sending || !feedback.trim() ? 0.6 : 1, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(56,189,248,0.3)" }}>
              {sending ? t("contact.sending") : <><Send size={15} /> {t("contact.send")}</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

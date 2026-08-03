import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" };
const inputBase = {
  width: "100%", background: "rgba(13,22,36,0.9)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#FFFFFF", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

export default function ContactPage({ setPage }) {
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

  const cardStyle = { background: "rgba(17,26,42,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(16px)" };

  return (
    <div style={{ maxWidth: "550px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", padding: "40px" }}>
      <div>
        {setPage && <BackToDashboard setPage={setPage} />}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(16,185,129,0.2) 100%)", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={22} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>Contact & Feedback</h1>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>Reach out for building onboarding assistance or share feature suggestions</p>
          </div>
        </div>
      </div>

      {/* Direct Contact Card */}
      <div style={{ ...cardStyle, padding: "18px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={18} color="#38BDF8" />
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Support Email</span>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", margin: "2px 0 0" }}>support@aquatrack.com</p>
        </div>
      </div>

      {/* Feedback Form Card */}
      <div style={{ ...cardStyle, padding: "28px" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle2 size={44} color="#34D399" style={{ display: "block", margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Thank you for your feedback!</h3>
            <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "6px" }}>Our team will review your message promptly.</p>
            <button onClick={() => setSent(false)} style={{ background: "none", border: "none", color: "#38BDF8", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit", marginTop: "16px" }}>
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Your Name (Optional)</label>
              <input style={inputBase} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar"
                onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Message *</label>
              <textarea style={{ ...inputBase, minHeight: "120px", resize: "vertical", lineHeight: 1.5 }} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Share your questions or feature requests…" required
                onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <button type="submit" disabled={sending || !feedback.trim()}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 700, fontSize: "14px", padding: "12px", borderRadius: "10px", cursor: sending || !feedback.trim() ? "not-allowed" : "pointer", opacity: sending || !feedback.trim() ? 0.6 : 1, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(56,189,248,0.3)" }}>
              {sending ? "Sending…" : <><Send size={15} /> Send Feedback</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

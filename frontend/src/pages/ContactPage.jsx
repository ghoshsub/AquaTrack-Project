import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [feedback, setFeedback] = useState("");
  const [name, setName]         = useState("");
  const [sent, setSent]         = useState(false);
  const [sending, setSending]   = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSending(true);
    // Simulate a send – replace with a real API call when ready
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    setFeedback("");
    setName("");
  }

  return (
    <section
      className="at-container"
      style={{ maxWidth: "520px", paddingTop: "80px", paddingBottom: "80px" }}
    >
      <h1
        className="at-display"
        style={{ fontSize: "30px", fontWeight: 600, color: "var(--at-ink-deep)" }}
      >
        Contact &amp; Feedback
      </h1>
      <p style={{ marginTop: "10px", fontSize: "14px", color: "rgba(20,43,46,0.7)" }}>
        Questions about onboarding your building, or just want to share thoughts? Reach out below.
      </p>

      {/* Email card */}
      <div className="at-card" style={{ padding: "20px 24px", marginTop: "32px" }}>
        <div className="at-flex at-items-center at-gap-3">
          <Mail size={16} color="var(--at-verdigris-deep)" />
          <span style={{ fontSize: "14px" }}>support@aquatrack.example</span>
        </div>
      </div>

      {/* Feedback form */}
      <div className="at-card" style={{ padding: "28px 24px", marginTop: "20px" }}>
        <div className="at-flex at-items-center at-gap-2" style={{ marginBottom: "20px" }}>
          <MessageSquare size={16} color="var(--at-verdigris-deep)" />
          <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
            Send us feedback
          </span>
        </div>

        {sent ? (
          <div
            className="at-flex at-flex-col at-items-center"
            style={{ padding: "24px 0", gap: "12px", textAlign: "center" }}
          >
            <CheckCircle size={36} color="var(--at-verdigris-deep)" />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
              Thanks for your feedback!
            </p>
            <p style={{ fontSize: "13px", color: "rgba(20,43,46,0.65)" }}>
              We'll get back to you as soon as we can.
            </p>
            <button
              className="at-link-btn at-focus"
              style={{ marginTop: "8px", fontSize: "13px" }}
              onClick={() => setSent(false)}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="at-flex-col at-gap-4">
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Your name (optional)</label>
              <input
                className="at-input at-focus"
                style={{ marginTop: "5px" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ravi Kumar"
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Message</label>
              <textarea
                className="at-input at-focus"
                style={{
                  marginTop: "5px",
                  resize: "vertical",
                  minHeight: "120px",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: "1.55",
                }}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, questions or suggestions…"
                required
              />
            </div>
            <button
              type="submit"
              disabled={sending || !feedback.trim()}
              className="at-btn-brass at-focus"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {sending ? (
                "Sending…"
              ) : (
                <>
                  <Send size={15} />
                  Send feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

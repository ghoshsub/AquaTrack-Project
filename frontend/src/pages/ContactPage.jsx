import React from "react";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <section className="at-container" style={{ maxWidth: "420px", paddingTop: "80px", paddingBottom: "80px" }}>
      <h1 className="at-display" style={{ fontSize: "30px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
        Contact
      </h1>
      <p style={{ marginTop: "10px", fontSize: "14px", color: "rgba(20,43,46,0.7)" }}>
        Questions about onboarding your building? Reach out.
      </p>
      <div className="at-card" style={{ padding: "24px", marginTop: "32px" }}>
        <div className="at-flex at-items-center at-gap-3">
          <Mail size={16} color="var(--at-verdigris-deep)" />
          <span style={{ fontSize: "14px" }}>support@aquatrack.example</span>
        </div>
      </div>
    </section>
  );
}

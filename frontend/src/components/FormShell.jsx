import React from "react";

export default function FormShell({ title, subtitle, children }) {
  return (
    <section className="at-container" style={{ maxWidth: "420px", paddingTop: "80px", paddingBottom: "80px" }}>
      <h1 className="at-display" style={{ fontSize: "30px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
        {title}
      </h1>
      <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.65)", marginTop: "6px" }}>{subtitle}</p>
      <div style={{ marginTop: "32px" }}>{children}</div>
    </section>
  );
}

import React from "react";
import { ArrowRight } from "lucide-react";
import GaugeDial from "./GaugeDial.jsx";

export default function Hero({ setPage }) {
  return (
    <section
      className="at-container"
      style={{
        paddingTop: "64px",
        paddingBottom: "80px",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "48px",
        alignItems: "center",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .at-hero-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      <div className="at-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px", alignItems: "center" }}>
        <div>
          <p
            className="at-mono"
            style={{ color: "var(--at-verdigris-deep)", fontSize: "12.5px", letterSpacing: "0.12em", fontWeight: 500 }}
          >
            WATER BILLING, MADE LEGIBLE
          </p>
          <h1
            className="at-display"
            style={{ fontSize: "44px", lineHeight: 1.12, fontWeight: 600, marginTop: "14px", color: "var(--at-ink-deep)" }}
          >
            Every drop,
            <br />
            accounted for.
          </h1>
          <p style={{ marginTop: "18px", fontSize: "16px", lineHeight: 1.65, color: "rgba(20,43,46,0.75)", maxWidth: "440px" }}>
            AquaTrack reads every meter, applies your tariff rules automatically, and shows each
            household exactly what they used and why they're billed for it.
          </p>
          <div className="at-flex at-gap-3" style={{ marginTop: "32px" }}>
            <button
              onClick={() => setPage("register")}
              className="at-btn-brass at-focus at-flex at-items-center at-gap-2"
            >
              Get started <ArrowRight size={16} />
            </button>
            <button onClick={() => setPage("about")} className="at-btn-outline at-focus">
              See how it works
            </button>
          </div>
        </div>
        <div className="at-flex" style={{ justifyContent: "center" }}>
          <GaugeDial />
        </div>
      </div>
    </section>
  );
}

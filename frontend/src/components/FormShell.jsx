import React from "react";
import { Droplets, ShieldCheck, Lock } from "lucide-react";

export default function FormShell({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(56, 189, 248, 0.4)",
            }}
          >
            <Droplets size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "var(--admin-logo-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AquaTrack
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--admin-card-bg)",
            border: "1px solid var(--admin-card-border)",
            borderRadius: "20px",
            padding: "36px 32px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "var(--admin-card-shadow)",
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: "28px", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--admin-text-white)",
                letterSpacing: "-0.02em",
                margin: "0 0 8px 0",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--admin-text-muted)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Security badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "20px",
            fontSize: "12px",
            color: "var(--admin-text-muted)",
          }}
        >
          <Lock size={12} />
          <span>Secured with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}

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
              background: "linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)",
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
            background: "rgba(17, 26, 42, 0.85)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "36px 32px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 60px -20px rgba(56,189,248,0.1)",
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: "28px", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: "0 0 8px 0",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#94A3B8",
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
            color: "#64748B",
          }}
        >
          <Lock size={12} />
          <span>Secured with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}

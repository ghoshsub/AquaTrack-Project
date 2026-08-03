import React, { useState } from "react";
import { login } from "../api/authApi.js";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";
import {
  User, Lock, Eye, EyeOff, AlertCircle, ArrowRight,
  Droplets, ShieldCheck, Gauge, BellRing, Sparkles, Activity, CheckCircle2
} from "lucide-react";

const inputStyle = {
  width: "100%",
  background: "rgba(13, 22, 36, 0.85)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  color: "#FFFFFF",
  padding: "12px 14px 12px 44px",
  borderRadius: "12px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
};

export default function LoginPage({ setPage, onAuthed }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      onAuthed(data);
      setPage("dashboard");
    } catch (err) {
      setError(err.message || "Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 50px",
        position: "relative",
        zIndex: 1,
        background: "#0B1120",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Background Glowing Radial Orbs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main 2-Column Responsive Glass Card Container */}
      <div
        className="auth-two-column-container"
        style={{
          width: "100%",
          maxWidth: "1050px",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 50px -15px rgba(56, 189, 248, 0.15)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          position: "relative",
          zIndex: 2,

        }}
      >
        {/* LEFT COLUMN: Attractive Branding & Feature Section */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(17, 26, 46, 0.9) 100%)",
            padding: "40px 37px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            position: "relative",
          }}
        >
          {/* Top Brand Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(56, 189, 248, 0.45)",
                }}
              >
                <Droplets size={24} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "block",
                  }}
                >
                  AquaTrack
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#38BDF8", letterSpacing: "0.08em" }}>
                  WATER TELEMETRY PLATFORM
                </span>
              </div>
            </div>

            {/* Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#38BDF8",
                marginBottom: "20px",
              }}
            >
              <Sparkles size={14} />
              <span>SECURED CONSOLE ACCESS</span>
            </div>

            <h2
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: "0 0 16px 0",
              }}
            >
              Smart water intelligence for modern complexes.
            </h2>

            <p style={{ fontSize: "15px", color: "#94A3B8", lineHeight: 1.65, margin: "0 0 32px 0" }}>
              Automate meter readings, enforce tiered tariff rules, and track consumption anomalies with sub-second accuracy.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: Gauge, title: "Tiered Tariff Engine", desc: "Automated rate calculation per building tier", color: "#38BDF8" },
                { icon: BellRing, title: "AI Leak Alerts", desc: "Instant notifications for abnormal spikes", color: "#34D399" },
                { icon: ShieldCheck, title: "Role Isolation", desc: "Separate access for Admins & Residents", color: "#818CF8" },
              ].map(({ icon: Icon, title, desc, color }, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{title}</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Trust Stat Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "24px",
              marginTop: "32px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#34D399" }}>
              <CheckCircle2 size={16} />
              <span>99.8% Billing Accuracy</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B" }}>
              <Activity size={14} color="#38BDF8" />
              <span>256-Bit SSL</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Glassmorphism Login Form Card */}
        <div
          style={{
            background: "rgba(11, 17, 32, 0.9)",
            padding: "40px 39px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: "0 0 8px 0",
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: "14px", color: "#94A3B8", margin: 0, lineHeight: 1.5 }}>
              Sign in to your AquaTrack account to manage billing and view telemetry.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Username Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#94A3B8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Username
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                />
                <input
                  type="text"
                  style={inputStyle}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "#38BDF8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(56, 189, 248, 0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.14)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#94A3B8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "#38BDF8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(56, 189, 248, 0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.14)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748B",
                    cursor: "pointer",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  color: "#F87171",
                  fontSize: "13.5px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading
                  ? "rgba(56, 189, 248, 0.5)"
                  : "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                border: "none",
                color: "#0F172A",
                fontWeight: 700,
                fontSize: "15px",
                padding: "14px",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: loading ? "none" : "0 6px 20px rgba(56, 189, 248, 0.4)",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(56, 189, 248, 0.55)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(56, 189, 248, 0.4)";
                }
              }}
            >
              {loading ? (
                "Signing in…"
              ) : (
                <>
                  Sign In <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "22px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton
            onAuthed={(data) => {
              onAuthed(data);
              setPage("dashboard");
            }}
            onError={(msg) => setError(msg)}
          />

          {/* Create Account Link */}
          <p style={{ fontSize: "14px", textAlign: "center", color: "#94A3B8", marginTop: "24px", margin: "24px 0 0 0" }}>
            No account yet?{" "}
            <button
              onClick={() => setPage("register")}
              style={{
                background: "none",
                border: "none",
                color: "#38BDF8",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Create one for free
            </button>
          </p>
        </div>
      </div>

      {/* Responsive Breakpoint Rules */}
      <style>{`
        @media (max-width: 900px) {
          .auth-two-column-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

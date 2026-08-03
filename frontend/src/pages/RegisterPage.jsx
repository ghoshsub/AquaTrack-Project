import React, { useState } from "react";
import { register } from "../api/authApi.js";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";
import {
  User, Lock, Mail, ShieldCheck, Eye, EyeOff, AlertCircle, ArrowRight,
  Droplets, Sparkles, CheckCircle2, Zap
} from "lucide-react";

const inputStyle = {
  width: "100%",
  background: "rgba(13, 22, 36, 0.85)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  color: "#FFFFFF",
  padding: "9px 12px 9px 40px",
  borderRadius: "10px",
  fontSize: "13.5px",
  fontFamily: "inherit",
  outline: "none",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
};

const roleCards = [
  {
    value: "ADMIN",
    label: "Administrator",
    desc: "Manage apartments, billing & plans",
    icon: ShieldCheck,
    color: "#38BDF8",
    glow: "rgba(56,189,248,0.15)",
  },
  {
    value: "RESIDENT",
    label: "Resident",
    desc: "Track usage, pay bills & view alerts",
    icon: User,
    color: "#10B981",
    glow: "rgba(16,185,129,0.15)",
  },
];

export default function RegisterPage({ setPage, onAuthed }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { username, email, password, role };
      const data = await register(payload);
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
        padding: "30px 20px 40px",
        position: "relative",
        zIndex: 1,
        background: "#0B1120",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Ambient Radial Glowing Orbs */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "10%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "10%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main 2-Column Container Optimized for Desktop Single-Screen Fit */}
      <div
        className="auth-two-column-container"
        style={{
          width: "100%",
          maxWidth: "1020px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderRadius: "22px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 50px -15px rgba(0, 0, 0, 0.7), 0 0 40px -15px rgba(56, 189, 248, 0.15)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* LEFT COLUMN: AquaTrack Branding & Information Section */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(17, 26, 46, 0.9) 100%)",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(56, 189, 248, 0.4)",
                }}
              >
                <Droplets size={22} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "22px",
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
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#38BDF8", letterSpacing: "0.08em" }}>
                  FREE ACCOUNT REGISTRATION
                </span>
              </div>
            </div>

            {/* Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "16px",
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#38BDF8",
                marginBottom: "16px",
              }}
            >
              <Sparkles size={13} />
              <span>ONBOARD YOUR APARTMENT IN 60 SECONDS</span>
            </div>

            <h2
              style={{
                fontSize: "25px",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                margin: "0 0 12px 0",
              }}
            >
              Join hundreds of smart residential communities.
            </h2>

            <p style={{ fontSize: "13.5px", color: "#94A3B8", lineHeight: 1.6, margin: "0 0 22px 0" }}>
              Get instant access to real-time water telemetry, automated monthly invoice generation, and tier-based billing rules.
            </p>

            {/* Benefit Checkmarks */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Zero setup or hardware integration fees",
                "Instant tier-based billing calculation",
                "Automated CSV consumption data import",
                "Role-based access for Admins and Residents",
              ].map((benefit, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#E2E8F0" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={13} color="#34D399" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Security Note */}
          <div
            style={{
              paddingTop: "16px",
              marginTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#64748B",
            }}
          >
            <Zap size={14} color="#38BDF8" />
            <span>Instant activation • No credit card required</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Compact Glass Signup Form Card */}
        <div
          style={{
            background: "rgba(11, 17, 32, 0.9)",
            padding: "32px 34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h1
              style={{
                fontSize: "23px",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: "0 0 4px 0",
              }}
            >
              Create account
            </h1>
            <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>
              Set up your AquaTrack credentials to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Role Selection */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Account Type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {roleCards.map(({ value, label, desc, icon: Icon, color, glow }) => {
                  const selected = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      style={{
                        background: selected ? glow : "rgba(255,255,255,0.03)",
                        border: `1px solid ${selected ? color : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "10px",
                        padding: "9px 10px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.18s ease",
                        boxShadow: selected ? `0 0 16px -4px ${color}40` : "none",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <Icon size={14} color={selected ? color : "#64748B"} />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: selected ? "#FFF" : "#94A3B8" }}>{label}</span>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748B", lineHeight: 1.3 }}>{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Username
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "13px",
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
                  placeholder="Choose a username"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "#38BDF8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.14)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                />
                <input
                  type="email"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "#38BDF8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.14)";
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
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  style={{ ...inputStyle, paddingRight: "40px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "#38BDF8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.14)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(244,63,94,0.12)",
                  border: "1px solid rgba(244,63,94,0.3)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#F87171",
                  fontSize: "12.5px",
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
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
                  ? "rgba(56,189,248,0.5)"
                  : "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                border: "none",
                color: "#0F172A",
                fontWeight: 700,
                fontSize: "14px",
                padding: "12px",
                borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: loading ? "none" : "0 4px 16px rgba(56,189,248,0.35)",
                transition: "all 0.18s ease",
                fontFamily: "inherit",
                marginTop: "2px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(56,189,248,0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(56,189,248,0.35)";
                }
              }}
            >
              {loading ? (
                "Creating account…"
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              or sign up with
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton
            onAuthed={(data) => {
              onAuthed(data);
              setPage("dashboard");
            }}
            onError={(msg) => setError(msg)}
          />

          {/* Already have account link */}
          <p style={{ fontSize: "13px", textAlign: "center", color: "#94A3B8", margin: "14px 0 0 0" }}>
            Already have an account?{" "}
            <button
              onClick={() => setPage("login")}
              style={{
                background: "none",
                border: "none",
                color: "#38BDF8",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Sign in instead
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

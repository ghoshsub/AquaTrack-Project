import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { login } from "../api/authApi.js";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";
import {
  Mail, User, Lock, Eye, EyeOff, AlertCircle, ArrowRight,
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ setPage, onAuthed }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return t("auth.emailRequired");
    if (trimmed.includes("@") && !EMAIL_REGEX.test(trimmed)) return t("auth.emailInvalid");
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return t("auth.passwordRequired");
    return "";
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touchedEmail) {
      setEmailError(validateEmail(val));
    }
  };

  const handleEmailBlur = () => {
    setTouchedEmail(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touchedPassword) {
      setPasswordError(validatePassword(val));
    }
  };

  const handlePasswordBlur = () => {
    setTouchedPassword(true);
    setPasswordError(validatePassword(password));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr);
    setPasswordError(pErr);
    setTouchedEmail(true);
    setTouchedPassword(true);

    if (eErr || pErr) {
      return;
    }

    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      onAuthed(data);
      setPage("dashboard");
    } catch (err) {
      const errMsg = err.message || t("auth.loginError");
      setError(errMsg);
      if (
        errMsg.toLowerCase().includes("email") ||
        errMsg.toLowerCase().includes("account") ||
        errMsg.toLowerCase().includes("no account found")
      ) {
        setEmailError(errMsg);
      } else if (
        errMsg.toLowerCase().includes("password") ||
        errMsg.toLowerCase().includes("credential") ||
        errMsg.toLowerCase().includes("invalid password")
      ) {
        setPasswordError(errMsg);
      }
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
        {/* LEFT COLUMN: Branding & Feature Section */}
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
              <span>{t("auth.loginSubtitle")}</span>
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
              {t("hero.loginHeading")}
            </h2>

            <p style={{ fontSize: "15px", color: "#94A3B8", lineHeight: 1.65, margin: "0 0 32px 0" }}>
              {t("hero.subtext")}
            </p>

            {/* Feature Highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: Gauge, title: t("features.f2Title"), desc: t("features.f2Desc"), color: "#38BDF8" },
                { icon: BellRing, title: t("features.f4Title"), desc: t("features.f4Desc"), color: "#34D399" },
                { icon: ShieldCheck, title: t("features.f5Title"), desc: t("features.f5Desc"), color: "#818CF8" },
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
              {t("auth.loginTitle")}
            </h1>
            <p style={{ fontSize: "14px", color: "#94A3B8", margin: 0, lineHeight: 1.5 }}>
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email or Username Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: emailError ? "#F87171" : "#94A3B8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t("auth.emailOrUsername")}
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: emailError ? "#F87171" : "#64748B",
                  }}
                />
                <input
                  type="text"
                  style={{
                    ...inputStyle,
                    borderColor: emailError ? "#F87171" : "rgba(255, 255, 255, 0.14)",
                    boxShadow: emailError ? "0 0 0 3px rgba(248, 113, 113, 0.2)" : "none",
                  }}
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder={t("auth.emailOrUsernamePlaceholder")}
                  onFocus={(e) => {
                    e.target.style.borderColor = emailError ? "#F87171" : "#38BDF8";
                    e.target.style.boxShadow = emailError
                      ? "0 0 0 3px rgba(248, 113, 113, 0.25)"
                      : "0 0 0 3px rgba(56, 189, 248, 0.18)";
                  }}
                />
              </div>
              {emailError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "6px",
                    color: "#F87171",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: passwordError ? "#F87171" : "#94A3B8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t("auth.password")}
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: passwordError ? "#F87171" : "#64748B",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  style={{
                    ...inputStyle,
                    paddingRight: "44px",
                    borderColor: passwordError ? "#F87171" : "rgba(255, 255, 255, 0.14)",
                    boxShadow: passwordError ? "0 0 0 3px rgba(248, 113, 113, 0.2)" : "none",
                  }}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder={t("auth.passwordPlaceholder")}
                  onFocus={(e) => {
                    e.target.style.borderColor = passwordError ? "#F87171" : "#38BDF8";
                    e.target.style.boxShadow = passwordError
                      ? "0 0 0 3px rgba(248, 113, 113, 0.25)"
                      : "0 0 0 3px rgba(56, 189, 248, 0.18)";
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
              {passwordError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "6px",
                    color: "#F87171",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>{passwordError}</span>
                </div>
              )}
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
                t("auth.loggingIn")
              ) : (
                <>
                  {t("auth.loginBtn")} <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "22px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("auth.orGoogle")}
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
            {t("auth.noAccount")}{" "}
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
              {t("auth.signUpLink")}
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

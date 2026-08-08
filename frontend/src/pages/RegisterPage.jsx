import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage({ setPage, onAuthed }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touchedUsername, setTouchedUsername] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateUsername = (val) => {
    if (!val.trim()) return t("auth.usernameRequired");
    return "";
  };

  const validateEmail = (val) => {
    if (!val.trim()) return t("auth.emailRequired");
    if (!EMAIL_REGEX.test(val.trim())) return t("auth.emailInvalid");
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return t("auth.passwordRequired");
    return "";
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    if (touchedUsername) {
      setUsernameError(validateUsername(val));
    }
  };

  const handleUsernameBlur = () => {
    setTouchedUsername(true);
    setUsernameError(validateUsername(username));
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

  const roleCards = [
    {
      value: "ADMIN",
      label: t("auth.roleAdmin"),
      desc: t("auth.roleAdmin"),
      icon: ShieldCheck,
      color: "#38BDF8",
      glow: "rgba(56,189,248,0.15)",
    },
    {
      value: "RESIDENT",
      label: t("auth.roleResident"),
      desc: t("auth.roleResident"),
      icon: User,
      color: "#10B981",
      glow: "rgba(16,185,129,0.15)",
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const uErr = validateUsername(username);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setUsernameError(uErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setTouchedUsername(true);
    setTouchedEmail(true);
    setTouchedPassword(true);

    if (uErr || eErr || pErr) {
      return;
    }

    setLoading(true);
    try {
      const payload = { username: username.trim(), email: email.trim(), password, role };
      const data = await register(payload);
      onAuthed(data);
      setPage("dashboard");
    } catch (err) {
      const errMsg = err.message || t("auth.registerError");
      setError(errMsg);
      if (
        errMsg.toLowerCase().includes("email") ||
        errMsg.toLowerCase().includes("email already registered") ||
        errMsg.toLowerCase().includes("email already taken")
      ) {
        setEmailError(errMsg);
      } else if (errMsg.toLowerCase().includes("username")) {
        setUsernameError(errMsg);
      } else if (errMsg.toLowerCase().includes("password")) {
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
                  {t("auth.registerTitle").toUpperCase()}
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
              <span>{t("hero.badge")}</span>
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
              {t("hero.subheading")}
            </h2>

            <p style={{ fontSize: "13.5px", color: "#94A3B8", lineHeight: 1.6, margin: "0 0 22px 0" }}>
              {t("hero.subtext")}
            </p>

            {/* Benefit Checkmarks */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                t("features.f1Desc"),
                t("features.f2Desc"),
                t("features.f3Desc"),
                t("features.f4Desc"),
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
            <span>{t("features.f6Title")}</span>
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
              {t("auth.registerTitle")}
            </h1>
            <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>
              {t("auth.registerSubtitle")}
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
                {t("auth.role")}
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
                  color: usernameError ? "#F87171" : "#94A3B8",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t("auth.username")}
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: usernameError ? "#F87171" : "#64748B",
                  }}
                />
                <input
                  type="text"
                  style={{
                    ...inputStyle,
                    borderColor: usernameError ? "#F87171" : "rgba(255, 255, 255, 0.14)",
                    boxShadow: usernameError ? "0 0 0 3px rgba(248, 113, 113, 0.2)" : "none",
                  }}
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  placeholder={t("auth.usernamePlaceholder")}
                  onFocus={(e) => {
                    e.target.style.borderColor = usernameError ? "#F87171" : "#38BDF8";
                    e.target.style.boxShadow = usernameError
                      ? "0 0 0 3px rgba(248, 113, 113, 0.25)"
                      : "0 0 0 3px rgba(56, 189, 248, 0.18)";
                  }}
                />
              </div>
              {usernameError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "5px",
                    color: "#F87171",
                    fontSize: "11.5px",
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  <span>{usernameError}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: emailError ? "#F87171" : "#94A3B8",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t("auth.email")}
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: emailError ? "#F87171" : "#64748B",
                  }}
                />
                <input
                  type="email"
                  style={{
                    ...inputStyle,
                    borderColor: emailError ? "#F87171" : "rgba(255, 255, 255, 0.14)",
                    boxShadow: emailError ? "0 0 0 3px rgba(248, 113, 113, 0.2)" : "none",
                  }}
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder={t("auth.emailPlaceholder")}
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
                    marginTop: "5px",
                    color: "#F87171",
                    fontSize: "11.5px",
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: passwordError ? "#F87171" : "#94A3B8",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t("auth.password")}
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: passwordError ? "#F87171" : "#64748B",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  style={{
                    ...inputStyle,
                    paddingRight: "40px",
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
              {passwordError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "5px",
                    color: "#F87171",
                    fontSize: "11.5px",
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
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
                  gap: "8px",
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#F87171",
                  fontSize: "13px",
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
                  ? "rgba(56, 189, 248, 0.5)"
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
                boxShadow: loading ? "none" : "0 4px 16px rgba(56, 189, 248, 0.4)",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(56, 189, 248, 0.55)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(56, 189, 248, 0.4)";
                }
              }}
            >
              {loading ? (
                t("auth.registering")
              ) : (
                <>
                  {t("auth.registerBtn")} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
            <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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

          {/* Login Link */}
          <p style={{ fontSize: "13px", textAlign: "center", color: "#94A3B8", marginTop: "16px", margin: "16px 0 0 0" }}>
            {t("auth.hasAccount")}{" "}
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
              {t("auth.signInLink")}
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

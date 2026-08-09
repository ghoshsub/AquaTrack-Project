import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Shield, Building, CheckCircle2, AlertCircle } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { getProfile, updateProfile } from "../api/authApi.js";

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)" };
const inputBase = {
  width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

function SaasInput({ type = "text", ...props }) {
  return (
    <input type={type} style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "var(--admin-accent)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--admin-input-border)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

export default function ProfilePage({ auth, onAuthed, setPage }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true); setError("");
      try {
        const data = await getProfile(auth.token);
        setProfile(data);
        setUsername(data.username || "");
        setEmail(data.email || "");
        setDisplayName(data.displayName || "");
      } catch (err) {
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    }
    if (auth?.token) loadProfile();
  }, [auth, t]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const response = await updateProfile(auth.token, {
        username, email, displayName, password: password || undefined,
      });

      onAuthed({
        token: response.token,
        username: response.username,
        role: response.role,
      });

      setProfile(response.profile);
      setUsername(response.profile.username || "");
      setEmail(response.profile.email || "");
      setDisplayName(response.profile.displayName || "");
      setPassword("");
      setSuccess(t("profile.updateSuccess"));
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  const cardStyle = { background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "16px", backdropFilter: "blur(16px)", boxShadow: "var(--admin-card-shadow)" };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "5px", paddingBottom: "15px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={22} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("profile.title")}</h1>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>{t("profile.accountDetails")}</p>
          </div>
        </div>
      </div>

      {loading && <div style={{ ...cardStyle, padding: "40px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "14px" }}>{t("common.loading")}</div>}
      {error && (
        <div style={{ background: "var(--admin-error-bg)", border: "1px solid var(--admin-error-border)", borderRadius: "12px", padding: "12px 16px", color: "var(--admin-error-text)", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)", borderRadius: "12px", padding: "12px 16px", color: "var(--admin-success-text)", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={16} /> <span>{success}</span>
        </div>
      )}

      {!loading && profile && (
        <div style={{ ...cardStyle, padding: "28px" }}>
          {/* Avatar Banner */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", borderBottom: "1px solid var(--admin-border-muted)", paddingBottom: "24px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(56,189,248,0.3)" }}>
              <User size={28} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--admin-text-white)" }}>{profile.displayName || profile.username}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--admin-accent)", marginTop: "4px" }}>
                <Shield size={13} />
                <span style={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
                  {profile.role === "ADMIN" ? t("profile.admin") : t("profile.resident")}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>User ID</label>
                <input style={{ ...inputBase, background: "var(--admin-subcard-bg)", color: "var(--admin-text-muted)", cursor: "not-allowed" }} value={`#${profile.id}`} disabled />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>{t("profile.username")} *</label>
                <SaasInput value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Display Name</label>
              <SaasInput value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="John Doe" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t("profile.email")}</label>
              <SaasInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t("profile.newPassword")}</label>
              <SaasInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep unchanged" />
            </div>

            {profile.role === "RESIDENT" && profile.apartmentName && (
              <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "12px", padding: "16px", marginTop: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "13px", color: "var(--admin-accent)", marginBottom: "10px" }}>
                  <Building size={14} /> Linked Household (Read-Only)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase" }}>{t("apartments.title")}</span>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-white)", margin: "2px 0 0" }}>{profile.apartmentName}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase" }}>{t("households.flatNumber")}</span>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-white)", margin: "2px 0 0" }}>{profile.flatNumber}</p>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting}
              style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 700, fontSize: "14px", padding: "11px 24px", borderRadius: "10px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "inherit", alignSelf: "flex-start", marginTop: "6px", boxShadow: "0 4px 14px rgba(56,189,248,0.3)" }}>
              {submitting ? t("common.loading") : t("profile.saveChanges")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

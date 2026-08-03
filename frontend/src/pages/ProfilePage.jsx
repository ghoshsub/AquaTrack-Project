import React, { useEffect, useState } from "react";
import { User, Shield, Lock, Mail, Building, CheckCircle2, AlertCircle } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { getProfile, updateProfile } from "../api/authApi.js";

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" };
const inputBase = {
  width: "100%", background: "rgba(13,22,36,0.9)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#FFFFFF", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

function SaasInput({ type = "text", ...props }) {
  return (
    <input type={type} style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.12)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

export default function ProfilePage({ auth, onAuthed, setPage }) {
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
        setError(err.message || "Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }
    if (auth?.token) loadProfile();
  }, [auth]);

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
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  const cardStyle = { background: "rgba(17,26,42,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(16px)" };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "5px", paddingBottom: "15px" }}>
      {/* Header */}
      <div>
        {/* <BackToDashboard setPage={setPage} /> */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={22} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>My Profile</h1>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>Update your personal details and account credentials</p>
          </div>
        </div>
      </div>

      {loading && <div style={{ ...cardStyle, padding: "40px", textAlign: "center", color: "#64748B", fontSize: "14px" }}>Loading profile…</div>}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#F87171", fontSize: "13px" }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#34D399", fontSize: "13px" }}>
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {!loading && profile && (
        <div style={{ ...cardStyle, padding: "28px" }}>
          {/* Avatar Banner */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "24px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(56,189,248,0.3)" }}>
              <User size={28} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "#FFFFFF" }}>{profile.displayName || profile.username}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#38BDF8", marginTop: "4px" }}>
                <Shield size={13} />
                <span style={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>{profile.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>User ID</label>
                <input style={{ ...inputBase, background: "rgba(255,255,255,0.03)", color: "#64748B", cursor: "not-allowed" }} value={`#${profile.id}`} disabled />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Username *</label>
                <SaasInput value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Display Name</label>
              <SaasInput value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="John Doe" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Email Address</label>
              <SaasInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>New Password</label>
              <SaasInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep unchanged" />
            </div>

            {profile.role === "RESIDENT" && profile.apartmentName && (
              <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "12px", padding: "16px", marginTop: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "13px", color: "#38BDF8", marginBottom: "10px" }}>
                  <Building size={14} /> Linked Household (Read-Only)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase" }}>Apartment</span>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", margin: "2px 0 0" }}>{profile.apartmentName}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase" }}>Flat Number</span>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", margin: "2px 0 0" }}>{profile.flatNumber}</p>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting}
              style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 700, fontSize: "14px", padding: "11px 24px", borderRadius: "10px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "inherit", alignSelf: "flex-start", marginTop: "6px", boxShadow: "0 4px 14px rgba(56,189,248,0.3)" }}>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

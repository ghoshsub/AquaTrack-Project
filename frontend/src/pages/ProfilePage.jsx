import React, { useEffect, useState } from "react";
import { User, Shield, Key, Mail, Edit3, Building } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { getProfile, updateProfile } from "../api/authApi.js";

export default function ProfilePage({ auth, onAuthed, setPage }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editable Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");
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
    if (auth?.token) {
      loadProfile();
    }
  }, [auth]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const response = await updateProfile(auth.token, {
        username,
        email,
        displayName,
        password: password || undefined,
      });

      // Update auth session in App
      onAuthed({
        token: response.token,
        username: response.username,
        role: response.role,
      });

      // Update local profile representation
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

  return (
    <section className="at-container" style={{ maxWidth: "600px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3" style={{ marginBottom: "24px" }}>
        <User size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)", margin: 0 }}>
          My Profile
        </h1>
      </div>

      {loading && <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>Loading profile details...</p>}
      {error && <p className="at-error" style={{ marginBottom: "16px" }}>{error}</p>}
      {success && <p style={{ color: "var(--at-verdigris-deep)", fontSize: "14px", fontWeight: 500, marginBottom: "16px" }}>{success}</p>}

      {!loading && profile && (
        <div className="at-card" style={{ padding: "32px" }}>
          {/* Avatar and basic metadata */}
          <div className="at-flex at-items-center at-gap-4" style={{ marginBottom: "28px", borderBottom: "1px solid rgba(20,43,46,0.08)", paddingBottom: "20px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--at-limestone-deep)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={28} color="var(--at-verdigris-deep)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "17px", color: "var(--at-ink-deep)" }}>
                {profile.displayName || profile.username}
              </div>
              <div className="at-flex at-items-center at-gap-1" style={{ fontSize: "12px", color: "rgba(20,43,46,0.6)", marginTop: "2px" }}>
                <Shield size={12} />
                <span style={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Read-only ID */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>User ID (Primary Key)</label>
              <input
                className="at-input"
                value={`#${profile.id}`}
                disabled
                style={{ background: "rgba(20,43,46,0.04)", cursor: "not-allowed", color: "rgba(20,43,46,0.5)" }}
              />
            </div>

            {/* Editable Username */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Username</label>
              <div style={{ position: "relative" }}>
                <input
                  className="at-input at-focus"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            {/* Editable Display Name */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Display Name</label>
              <input
                className="at-input at-focus"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            {/* Editable Email */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Email Address</label>
              <input
                type="email"
                className="at-input at-focus"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Editable Password */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>New Password</label>
              <input
                type="password"
                className="at-input at-focus"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>

            {/* Household Info for Resident (Read-only) */}
            {profile.role === "RESIDENT" && profile.apartmentName && (
              <div style={{ background: "var(--at-limestone)", borderRadius: "8px", padding: "16px", marginTop: "8px", border: "1px solid rgba(20,43,46,0.08)" }}>
                <div className="at-flex at-items-center at-gap-2" style={{ fontWeight: 600, fontSize: "13px", marginBottom: "10px", color: "var(--at-verdigris-deep)" }}>
                  <Building size={14} />
                  Linked Household Details (Read-Only)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "rgba(20,43,46,0.5)", display: "block", textTransform: "uppercase" }}>Apartment</span>
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>{profile.apartmentName}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "rgba(20,43,46,0.5)", display: "block", textTransform: "uppercase" }}>Flat Number</span>
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>{profile.flatNumber}</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting} className="at-btn-brass at-focus" style={{ marginTop: "10px", alignSelf: "flex-start" }}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

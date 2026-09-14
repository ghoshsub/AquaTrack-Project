import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Edit2, Trash2, Shield, Search, UserCheck, AlertCircle, CheckCircle2, X } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listAdminUsers, updateAdminUser, deleteAdminUser } from "../api/authApi.js";

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)" };
const inputBase = {
  width: "100%",
  background: "var(--admin-input-bg)",
  border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
};

function SaasInput({ type = "text", ...props }) {
  return (
    <input type={type} style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "var(--admin-accent)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--admin-input-border)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

function SaasSelect({ children, ...props }) {
  return (
    <select style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "var(--admin-accent)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--admin-input-border)"; e.target.style.boxShadow = "none"; }}
    >
      {children}
    </select>
  );
}

export default function AdminUsersPage({ auth, onAuthed, setPage }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editRole, setEditRole] = useState("RESIDENT");
  const [editPassword, setEditPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [auth]);

  async function loadUsers(tokenOverride) {
    const tkn = tokenOverride || auth?.token;
    if (!tkn) return;
    setLoading(true); setError("");
    try {
      const data = await listAdminUsers(tkn);
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  function handleStartEdit(u) {
    setEditingUser(u);
    setEditUsername(u.username || "");
    setEditEmail(u.email || "");
    setEditDisplayName(u.displayName || "");
    setEditRole(u.role || "RESIDENT");
    setEditPassword("");
    setError(""); setSuccess("");
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const res = await updateAdminUser(auth.token, editingUser.id, {
        username: editUsername,
        email: editEmail,
        displayName: editDisplayName,
        role: editRole,
        password: editPassword || undefined,
      });

      setSuccess(`User ${editUsername} updated successfully!`);
      setEditingUser(null);

      // Check if the edited user was the currently logged-in admin
      const isSelf = (editingUser.username === auth.username || editingUser.id === auth.id);
      let activeToken = auth.token;

      if (isSelf) {
        if (res && res.token) {
          activeToken = res.token;
        }
        if (onAuthed) {
          onAuthed({
            token: activeToken,
            username: res?.username || editUsername,
            role: res?.role || editRole,
          });
        }
      }

      await loadUsers(activeToken);
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(u) {
    if (u.username === auth.username) {
      setError("You cannot delete your own active logged-in admin account!");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user ${u.username}?`)) return;
    setError(""); setSuccess("");
    try {
      await deleteAdminUser(auth.token, u.id);
      setSuccess(`User ${u.username} deleted.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  }

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const cardStyle = { background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "16px", backdropFilter: "blur(16px)", boxShadow: "var(--admin-card-shadow)", padding: "24px" };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "5px", paddingBottom: "30px" }}>
      <BackToDashboard onBack={() => setPage("dashboard")} />

      {/* Title Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={22} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>User Management</h1>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>Manage, edit, and inspect all community users and roles</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputBase, paddingLeft: "36px" }}
          />
        </div>
      </div>

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

      {/* Edit User Modal Drawer */}
      {editingUser && (
        <div style={{ ...cardStyle, border: "1px solid var(--admin-accent)", background: "var(--admin-subcard-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>
              Edit User: #{editingUser.id} ({editingUser.username})
            </h3>
            <button onClick={() => setEditingUser(null)} style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          {editingUser.username === auth.username && (
            <div style={{ marginBottom: "16px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "12.5px", color: "#38BDF8", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={16} style={{ flexShrink: 0 }} />
              <span>You are editing your active logged-in account. Saving changes to username or password will automatically renew your session, sidebar, and the login page defaults.</span>
            </div>
          )}

          <form onSubmit={handleSaveEdit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Username *</label>
              <SaasInput value={editUsername} onChange={e => setEditUsername(e.target.value)} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <SaasInput type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Display Name</label>
              <SaasInput value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Role</label>
              <SaasSelect value={editRole} onChange={e => setEditRole(e.target.value)}>
                <option value="RESIDENT">RESIDENT</option>
                <option value="ADMIN">ADMIN</option>
              </SaasSelect>
            </div>
            <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Reset Password (leave empty to keep current password)</label>
              <SaasInput type="password" placeholder="Enter new password (e.g. admin123, newpass456)" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", marginTop: "6px" }}>
              <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 700, padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                {submitting ? "Saving..." : "Save User Details"}
              </button>
              <button type="button" onClick={() => setEditingUser(null)} style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", color: "var(--admin-text-white)", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)" }}>Loading users...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "var(--admin-subcard-bg)", borderBottom: "1px solid var(--admin-card-border)" }}>
                  <th style={{ padding: "14px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>ID</th>
                  <th style={{ padding: "14px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>User</th>
                  <th style={{ padding: "14px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Email</th>
                  <th style={{ padding: "14px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Role</th>
                  <th style={{ padding: "14px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Password</th>
                  <th style={{ padding: "14px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Assigned Flat</th>
                  <th style={{ padding: "14px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "var(--admin-text-muted)" }}>No users found matching your search.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--admin-card-border)", background: u.username === auth.username ? "rgba(56, 189, 248, 0.04)" : "transparent" }}>
                      <td style={{ padding: "14px 18px", fontWeight: 600, color: "var(--admin-text-muted)" }}>#{u.id}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 700, color: "var(--admin-text-white)" }}>{u.displayName || u.username}</span>
                          {u.username === auth.username && (
                            <span style={{ fontSize: "10px", background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", padding: "1px 6px", borderRadius: "6px", fontWeight: 700 }}>YOU</span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>@{u.username}</div>
                      </td>
                      <td style={{ padding: "14px 18px", color: "var(--admin-text-white)" }}>{u.email || "—"}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                          background: u.role === "ADMIN" ? "rgba(99,102,241,0.15)" : "rgba(56,189,248,0.15)",
                          color: u.role === "ADMIN" ? "#818CF8" : "#38BDF8",
                          border: `1px solid ${u.role === "ADMIN" ? "rgba(99,102,241,0.3)" : "rgba(56,189,248,0.3)"}`
                        }}>
                          <Shield size={12} /> {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <code style={{ fontSize: "12px", background: "var(--admin-subcard-bg)", padding: "3px 8px", borderRadius: "6px", border: "1px solid var(--admin-card-border)", color: "#38BDF8", fontFamily: "monospace" }}>
                          {u.passwordHint || (u.role === "ADMIN" ? "admin123" : "resident123")}
                        </code>
                      </td>
                      <td style={{ padding: "14px 18px", color: "var(--admin-text-white)" }}>
                        {u.flatNumber ? `${u.apartmentName || "Apartment"} - Flat ${u.flatNumber}` : "—"}
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button onClick={() => handleStartEdit(u)} style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", color: "#38BDF8", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600 }}>
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={u.username === auth.username}
                            title={u.username === auth.username ? "Cannot delete active logged-in account" : "Delete user"}
                            style={{
                              background: u.username === auth.username ? "rgba(255,255,255,0.04)" : "rgba(244,63,94,0.1)",
                              border: `1px solid ${u.username === auth.username ? "rgba(255,255,255,0.1)" : "rgba(244,63,94,0.25)"}`,
                              color: u.username === auth.username ? "var(--admin-text-muted)" : "#F87171",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              cursor: u.username === auth.username ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px"
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

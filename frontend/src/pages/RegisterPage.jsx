import React, { useState } from "react";
import FormShell from "../components/FormShell.jsx";
import { register } from "../api/authApi.js";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";

export default function RegisterPage({ setPage, onAuthed }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("ADMIN");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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
    <FormShell title="Create an account" subtitle="Set up admin or resident access to AquaTrack.">
      <form onSubmit={handleSubmit} className="at-flex-col at-gap-4">
        <div>
          <label style={{ fontSize: "13px", fontWeight: 500 }}>Username</label>
          <input
            className="at-input at-focus"
            style={{ marginTop: "5px" }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: "13px", fontWeight: 500 }}>Email</label>
          <input
            type="email"
            className="at-input at-focus"
            style={{ marginTop: "5px" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label style={{ fontSize: "13px", fontWeight: 500 }}>Password</label>
          <input
            type="password"
            className="at-input at-focus"
            style={{ marginTop: "5px" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: "13px", fontWeight: 500 }}>Role</label>
          <select
            className="at-input at-focus"
            style={{ marginTop: "5px" }}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ADMIN">Admin</option>
            <option value="RESIDENT">Resident</option>
          </select>
        </div>
        {error && <p className="at-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="at-btn-brass at-focus"
          style={{ marginTop: "6px", width: "100%" }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div style={{ margin: "20px 0", textAlign: "center", fontSize: "13px", color: "rgba(20,43,46,0.5)" }}>
        or
      </div>
      <GoogleSignInButton
        onAuthed={(data) => {
          onAuthed(data);
          setPage("dashboard");
        }}
        onError={(msg) => setError(msg)}
      />
      <p style={{ fontSize: "13px", marginTop: "18px", color: "rgba(20,43,46,0.65)" }}>
        Already have an account?{" "}
        <button onClick={() => setPage("login")} className="at-link-btn at-focus">
          Log in
        </button>
      </p>
    </FormShell>
  );
}

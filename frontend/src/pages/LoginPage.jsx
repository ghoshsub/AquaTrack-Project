import React, { useState } from "react";
import FormShell from "../components/FormShell.jsx";
import { login } from "../api/authApi.js";

export default function LoginPage({ setPage, onAuthed }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <FormShell title="Welcome back" subtitle="Log in with your AquaTrack account.">
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
        {error && <p className="at-error">{error}</p>}
        <button type="submit" disabled={loading} className="at-btn-brass at-focus" style={{ marginTop: "6px", width: "100%" }}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p style={{ fontSize: "13px", marginTop: "18px", color: "rgba(20,43,46,0.65)" }}>
        No account yet?{" "}
        <button onClick={() => setPage("register")} className="at-link-btn at-focus">
          Register here
        </button>
      </p>
    </FormShell>
  );
}

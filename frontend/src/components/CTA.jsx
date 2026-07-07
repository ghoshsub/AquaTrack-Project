import React from "react";

export default function CTA({ setPage }) {
  return (
    <section style={{ background: "var(--at-verdigris)" }} className="py-16">
      <div className="at-container" style={{ maxWidth: "720px", textAlign: "center", paddingTop: "64px", paddingBottom: "64px" }}>
        <h2 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          Set up your building in an afternoon.
        </h2>
        <button
          onClick={() => setPage("register")}
          className="at-btn-brass at-focus"
          style={{ marginTop: "20px" }}
        >
          Create an account
        </button>
      </div>
    </section>
  );
}

import React from "react";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard({ setPage }) {
  return (
    <button onClick={() => setPage("dashboard")} className="at-back-link at-focus">
      <ArrowLeft size={14} />
      Back to dashboard
    </button>
  );
}

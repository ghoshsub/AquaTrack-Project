import React from "react";
import { Droplets } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "var(--at-ink-deep)" }} className="mt-auto">
      <div
        className="at-container at-flex at-items-center at-justify-between at-gap-4"
        style={{ paddingTop: "40px", paddingBottom: "40px", flexWrap: "wrap" }}
      >
        <div className="at-flex at-items-center at-gap-2">
          <Droplets size={18} color="var(--at-brass)" />
          <span className="at-display" style={{ color: "var(--at-limestone)", fontSize: "16px", fontWeight: 600 }}>
            AquaTrack
          </span>
        </div>
        <p className="at-mono" style={{ color: "rgba(237,232,222,0.55)", fontSize: "12.5px", margin: 0 }}>
          Metering, billing, and transparency for residential water systems.
        </p>
      </div>
    </footer>
  );
}

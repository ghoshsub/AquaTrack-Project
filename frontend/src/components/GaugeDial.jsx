import React from "react";

export default function GaugeDial() {
  return (
    <svg viewBox="0 0 200 140" width="280" height="196" aria-hidden="true">
      <circle cx="100" cy="100" r="88" fill="var(--at-white)" stroke="var(--at-ink)" strokeWidth="2" />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="var(--at-brass)"
        strokeWidth="6"
        strokeDasharray="8 6"
        opacity="0.55"
      />
      {Array.from({ length: 11 }).map((_, i) => {
        const angle = -125 + i * 25;
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + 68 * Math.cos(rad);
        const y1 = 100 + 68 * Math.sin(rad);
        const x2 = 100 + 78 * Math.cos(rad);
        const y2 = 100 + 78 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--at-ink)"
            strokeWidth={i % 5 === 0 ? 2.5 : 1.25}
          />
        );
      })}
      <text x="100" y="128" textAnchor="middle" className="at-mono" fontSize="9" fill="var(--at-ink)" opacity="0.6">
        kL / MONTH
      </text>
      <g className="at-needle">
        <line x1="100" y1="100" x2="100" y2="38" stroke="var(--at-verdigris-deep)" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="100" r="7" fill="var(--at-brass)" stroke="var(--at-ink-deep)" strokeWidth="1.5" />
    </svg>
  );
}

import React from 'react';

export default function Logo({ size = 32, showWordmark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Goutte SVG en contour */}
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 3C16 3 6 13.5 6 20a10 10 0 0 0 20 0C26 13.5 16 3 16 3Z"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showWordmark && (
        <span style={{ fontFamily: 'Archivo Black, Inter, sans-serif', fontSize: 20, letterSpacing: '-0.02em', lineHeight: 1 }}>
          <span style={{ color: '#F1F5F9' }}>Sirop</span>
          <span style={{ color: '#22C55E' }}>Hub</span>
        </span>
      )}
    </div>
  );
}

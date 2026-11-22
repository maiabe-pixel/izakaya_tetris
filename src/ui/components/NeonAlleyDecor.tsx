/** CSS/SVG-only alley décor for title / playstyle screens. */
export function NeonAlleyDecor() {
  return (
    <div className="alley-decor" aria-hidden="true">
      <svg className="string-lights" viewBox="0 0 320 28" preserveAspectRatio="none">
        <path
          d="M0 8 Q40 22 80 8 T160 8 T240 8 T320 8"
          fill="none"
          stroke="rgba(244,231,210,0.28)"
          strokeWidth="1.2"
        />
        {[20, 60, 100, 140, 180, 220, 260, 300].map((x, i) => (
          <g key={x}>
            <line
              x1={x}
              y1={i % 2 === 0 ? 10 : 14}
              x2={x}
              y2={i % 2 === 0 ? 16 : 20}
              stroke="rgba(244,231,210,0.35)"
              strokeWidth="1"
            />
            <circle
              cx={x}
              cy={i % 2 === 0 ? 19 : 23}
              r="3.2"
              fill={i % 3 === 0 ? '#FF6B9B' : i % 3 === 1 ? '#5DE4E8' : '#F5C96B'}
              opacity="0.85"
            />
          </g>
        ))}
      </svg>

      <svg className="lantern left" viewBox="0 0 28 42">
        <line x1="14" y1="0" x2="14" y2="6" stroke="#F4E7D2" strokeWidth="1.2" />
        <rect x="5" y="6" width="18" height="26" rx="4" fill="#FF6B9B" opacity="0.85" />
        <rect x="7" y="10" width="14" height="18" rx="2" fill="#F5C96B" opacity="0.35" />
        <ellipse cx="14" cy="34" rx="3" ry="4" fill="#F5C96B" opacity="0.7" />
      </svg>

      <svg className="lantern right" viewBox="0 0 28 42">
        <line x1="14" y1="0" x2="14" y2="6" stroke="#F4E7D2" strokeWidth="1.2" />
        <rect x="5" y="6" width="18" height="26" rx="4" fill="#5DE4E8" opacity="0.8" />
        <rect x="7" y="10" width="14" height="18" rx="2" fill="#F4E7D2" opacity="0.25" />
        <ellipse cx="14" cy="34" rx="3" ry="4" fill="#FF6B9B" opacity="0.65" />
      </svg>

      <div className="noren" />
    </div>
  );
}

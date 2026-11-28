import { useEffect, useMemo } from 'react';

type Props = {
  onDone: () => void;
};

const FANFARE_MS = 2800;
const REDUCED_MS = 900;

function preferReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function ConcentrationRays() {
  const rays = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * 360;
        return { i, a };
      }),
    [],
  );

  return (
    <svg
      className="geri-fanfare-rays"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="geri-ray-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffc34d" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#ff1684" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#210b1b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#geri-ray-fade)" opacity="0.55" />
      {rays.map((r) => (
        <line
          key={r.i}
          x1="50"
          y1="50"
          x2={50 + Math.cos((r.a * Math.PI) / 180) * 52}
          y2={50 + Math.sin((r.a * Math.PI) / 180) * 52}
          className="geri-ray-line"
          style={{ animationDelay: `${0.08 + (r.i % 6) * 0.02}s` }}
        />
      ))}
    </svg>
  );
}

function BeerMugs() {
  return (
    <div className="geri-fanfare-mugs" aria-hidden="true">
      <svg className="geri-mug geri-mug--left" viewBox="0 0 64 72">
        <path
          d="M12 18h28v36c0 6-5 10-12 10h-4c-7 0-12-4-12-10V18z"
          fill="#ffc34d"
          stroke="#fff3e0"
          strokeWidth="2"
        />
        <path d="M14 20h24v8H14z" fill="#fff8e8" opacity="0.95" />
        <path
          d="M40 24h8c4 0 7 3 7 7v8c0 4-3 7-7 7h-8"
          fill="none"
          stroke="#fff3e0"
          strokeWidth="2.4"
        />
        <circle className="geri-spark" cx="20" cy="14" r="2.2" fill="#fff" />
        <circle className="geri-spark" cx="30" cy="10" r="1.6" fill="#ffc34d" />
      </svg>
      <svg className="geri-mug geri-mug--right" viewBox="0 0 64 72">
        <path
          d="M12 18h28v36c0 6-5 10-12 10h-4c-7 0-12-4-12-10V18z"
          fill="#ff941f"
          stroke="#fff3e0"
          strokeWidth="2"
        />
        <path d="M14 20h24v8H14z" fill="#fff8e8" opacity="0.95" />
        <path
          d="M40 24h8c4 0 7 3 7 7v8c0 4-3 7-7 7h-8"
          fill="none"
          stroke="#fff3e0"
          strokeWidth="2.4"
        />
        <circle className="geri-spark" cx="44" cy="12" r="2" fill="#fff" />
        <circle className="geri-spark" cx="36" cy="8" r="1.5" fill="#28e7ff" />
      </svg>
      <div className="geri-toast-burst" />
    </div>
  );
}

/**
 * Post–GAME OVER celebration before izakaya (~2.8s).
 * Visual-only; cleans up via unmount + timer clear.
 */
export function IzakayaEntryFanfare({ onDone }: Props) {
  useEffect(() => {
    const ms = preferReducedMotion() ? REDUCED_MS : FANFARE_MS;
    const t = window.setTimeout(() => onDone(), ms);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="geri-fanfare"
      role="dialog"
      aria-modal="true"
      aria-label="レッツゲリィ～！ 居酒屋モードへ"
    >
      <div className="geri-fanfare-bg" aria-hidden="true" />
      <ConcentrationRays />
      <div className="geri-fanfare-stage">
        <p className="geri-fanfare-mode">IZAKAYA MODE</p>
        <BeerMugs />
        <h2 className="geri-fanfare-title">レッツゲリィ～！</h2>
        <p className="geri-fanfare-sub">
          <span>飲んで食べてブロックを消そう！</span>
        </p>
      </div>
    </div>
  );
}

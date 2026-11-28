import {
  DEFAULT_TIME_LIMIT,
  GAME_EYEBROW,
  GAME_SUBTITLE,
  GAME_TITLE,
  TIME_LIMIT_OPTIONS,
  type TimeLimitSeconds,
} from '../../game/constants';

type Props = {
  value: TimeLimitSeconds;
  onChange: (v: TimeLimitSeconds) => void;
  onBack: () => void;
  onConfirm: () => void;
};

type DrinkMeta = {
  catchphrase: string;
  drink: string;
  label: string;
  labelKind: 'hard' | 'challenge' | 'recommend' | 'relax' | 'survive';
};

const DRINKS: Record<TimeLimitSeconds, DrinkMeta> = {
  3: {
    catchphrase: '己の限界に挑む！',
    drink: 'テキーラ',
    label: '激ムズ！',
    labelKind: 'hard',
  },
  5: {
    catchphrase: 'あえて攻める！',
    drink: 'シャンパン',
    label: 'チャレンジ！',
    labelKind: 'challenge',
  },
  7: {
    catchphrase: '安定のいつもの一杯！',
    drink: 'ハイボール',
    label: 'おすすめ',
    labelKind: 'recommend',
  },
  10: {
    catchphrase: '余裕を持って楽しむ！',
    drink: 'コーン茶ハイ',
    label: 'ゆったり♪',
    labelKind: 'relax',
  },
  15: {
    catchphrase: 'とにかく生き延びる！',
    drink: 'アイソカル',
    label: '生存重視！',
    labelKind: 'survive',
  },
};

function BeerMugIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M8 12h18v18c0 3.5-2.8 6-7 6h-4c-4.2 0-7-2.5-7-6V12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M26 15h5.5c2.4 0 4.5 2 4.5 4.5v5c0 2.5-2.1 4.5-4.5 4.5H26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M10 12c1.2-3 3.5-5 6-5s4.5 1.5 6 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DrinkSvg({ seconds }: { seconds: TimeLimitSeconds }) {
  if (seconds === 3) {
    return (
      <svg className="drink-ico" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M18 8h12l-2 28c0 3-2.5 5-6 5h0c-3.5 0-6-2-6-5L18 8z" fill="#5a2a12" stroke="#fff3e0" strokeWidth="1.6" />
        <path d="M19 8h10l-.6 6H19.6z" fill="#fff8e0" opacity="0.9" />
        <circle cx="34" cy="14" r="5" fill="#c8e86a" stroke="#fff3e0" strokeWidth="1.2" />
        <path d="M30 14c1.2-2 3-3.2 5-3" fill="none" stroke="#7a9a30" strokeWidth="1" />
      </svg>
    );
  }
  if (seconds === 5) {
    return (
      <svg className="drink-ico" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M12 8h8l-3 14h-2L12 8z" fill="#ffe9a8" stroke="#fff3e0" strokeWidth="1.4" />
        <path d="M28 8h8l-3 14h-2L28 8z" fill="#ffe9a8" stroke="#fff3e0" strokeWidth="1.4" />
        <line x1="16" y1="22" x2="16" y2="36" stroke="#fff3e0" strokeWidth="1.6" />
        <line x1="32" y1="22" x2="32" y2="36" stroke="#fff3e0" strokeWidth="1.6" />
        <ellipse cx="16" cy="38" rx="4" ry="1.6" fill="#ffc34d" />
        <ellipse cx="32" cy="38" rx="4" ry="1.6" fill="#ffc34d" />
        <path d="M14 10c1-.8 2.5-.8 4 0M30 10c1-.8 2.5-.8 4 0" fill="none" stroke="#28e7ff" strokeWidth="1.2" />
      </svg>
    );
  }
  if (seconds === 7) {
    return (
      <svg className="drink-ico" viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M14 10h16v24c0 4-3 7-8 7h0c-5 0-8-3-8-7V10z"
          fill="#c9e8ff"
          stroke="#fff3e0"
          strokeWidth="1.6"
          opacity="0.92"
        />
        <path d="M15 11h14v5H15z" fill="#fff" opacity="0.35" />
        <rect x="17" y="18" width="4" height="4" rx="0.8" fill="#e8f6ff" />
        <rect x="24" y="20" width="4" height="4" rx="0.8" fill="#e8f6ff" />
        <rect x="20" y="26" width="4" height="4" rx="0.8" fill="#e8f6ff" />
        <path d="M30 14h6c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4h-6" fill="none" stroke="#fff3e0" strokeWidth="1.6" />
      </svg>
    );
  }
  if (seconds === 10) {
    return (
      <svg className="drink-ico" viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M16 8h12l-1.5 28c0 3.5-2.5 6-6 6h0c-3.5 0-6-2.5-6-6L16 8z"
          fill="#f0c56a"
          stroke="#fff3e0"
          strokeWidth="1.6"
        />
        <path d="M17 9h10l-.5 5H17.5z" fill="#fff8e0" opacity="0.85" />
        <rect x="19" y="18" width="3.5" height="3.5" rx="0.6" fill="#ffe9b0" />
        <rect x="24" y="22" width="3.5" height="3.5" rx="0.6" fill="#ffe9b0" />
        <path d="M30 10c4 4 5 10 2 14" fill="none" stroke="#ff1684" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="drink-ico" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="14" y="8" width="16" height="28" rx="2" fill="#4aa3ff" stroke="#fff3e0" strokeWidth="1.6" />
      <rect x="16" y="12" width="12" height="10" rx="1" fill="#e8f4ff" opacity="0.9" />
      <text
        x="24"
        y="19.5"
        textAnchor="middle"
        fontSize="4.2"
        fill="#1a4a8a"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        ISO
      </text>
      <path d="M30 10c5 3 7 9 4 14" fill="none" stroke="#ffc34d" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="22" cy="38" rx="7" ry="2" fill="#2a6fcc" opacity="0.7" />
    </svg>
  );
}

/** Lucide-style line icons: flame / zap / crown / music / shield-plus */
function DifficultyIcon({ kind }: { kind: DrinkMeta['labelKind'] }) {
  const common = {
    className: 'drink-diff-ico',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  if (kind === 'hard') {
    return (
      <svg {...common}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    );
  }
  if (kind === 'challenge') {
    return (
      <svg {...common}>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    );
  }
  if (kind === 'recommend') {
    return (
      <svg {...common}>
        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
        <path d="M5 21h14" />
      </svg>
    );
  }
  if (kind === 'relax') {
    return (
      <svg {...common}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  );
}

export function TimeLimitScreen({
  value = DEFAULT_TIME_LIMIT,
  onChange,
  onBack,
  onConfirm,
}: Props) {
  return (
    <section className="screen drink-menu-screen playstyle-screen">
      <div className="drink-menu-ambient" aria-hidden="true">
        <div className="drink-menu-ambient-glow" />
        <div className="drink-menu-ambient-sakura" />
        <div className="drink-menu-ambient-lantern" />
      </div>

      <header className="drink-menu-header">
        <div className="drink-menu-eyebrow">{GAME_EYEBROW}</div>
        <h1 className="drink-menu-brand">{GAME_TITLE}</h1>
        <p className="drink-menu-tagline">{GAME_SUBTITLE}</p>
      </header>

      <div className="drink-menu-board">
        <div className="drink-menu-board-title">
          <BeerMugIcon className="drink-menu-mug" />
          <h2>本日の一杯</h2>
          <BeerMugIcon className="drink-menu-mug" />
        </div>
        <p className="drink-menu-lead">今夜はどの一杯で挑む？</p>
        <p className="drink-menu-hint">
          居酒屋モードの制限時間を選んでください（初期は
          {DEFAULT_TIME_LIMIT}秒）
        </p>

        <div className="drink-menu-list" role="listbox" aria-label="制限時間">
          {TIME_LIMIT_OPTIONS.map((s) => {
            const meta = DRINKS[s];
            const selected = value === s;
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={selected}
                className={`drink-row${selected ? ' is-selected' : ''}`}
                onClick={() => onChange(s)}
              >
                <span className="drink-row-sec">
                  <span className="drink-row-sec-num">{s}</span>
                  <span className="drink-row-sec-unit">秒</span>
                </span>
                <span className="drink-row-ico">
                  <DrinkSvg seconds={s} />
                </span>
                <span className="drink-row-copy">
                  <span className="drink-row-catch">{meta.catchphrase}</span>
                  <span className="drink-row-name">{meta.drink}</span>
                </span>
                <span className={`drink-row-label is-${meta.labelKind}`}>
                  <DifficultyIcon kind={meta.labelKind} />
                  <span className="drink-row-label-text">{meta.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="drink-menu-actions">
          <button type="button" className="btn drink-btn-back" onClick={onBack}>
            戻る
          </button>
          <button
            type="button"
            className="btn drink-btn-go"
            onClick={onConfirm}
          >
            これでいく！
          </button>
        </div>
      </div>
    </section>
  );
}

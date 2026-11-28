type Props = {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoft: () => void;
  onHard: () => void;
};

function RotateIcon() {
  return (
    <svg className="pad-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19.2 12a7.2 7.2 0 1 1-2.1-5.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19.5 4.8v4.4h-4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FallingControls({
  onLeft,
  onRight,
  onRotate,
  onSoft,
  onHard,
}: Props) {
  return (
    <div className="arcade-pad fall-pad" aria-label="落下操作">
      <div className="arcade-pad-row">
        <button
          type="button"
          className="btn pad-btn fall-pad-btn is-cyan"
          onClick={onLeft}
        >
          ←
        </button>
        <button
          type="button"
          className="btn pad-btn fall-pad-btn is-pink"
          onClick={onRotate}
        >
          <RotateIcon />
          <span>回転</span>
        </button>
        <button
          type="button"
          className="btn pad-btn fall-pad-btn is-cyan"
          onClick={onRight}
        >
          →
        </button>
      </div>
      <div className="arcade-pad-row">
        <button
          type="button"
          className="btn pad-btn fall-pad-btn is-gold"
          onClick={onSoft}
        >
          <span aria-hidden="true">↓</span>
          <span>ソフト</span>
        </button>
        <button
          type="button"
          className="btn pad-btn fall-pad-btn pad-hard is-hard"
          onClick={onHard}
        >
          <span aria-hidden="true">▼▼</span>
          <span>ハードドロップ</span>
        </button>
      </div>
    </div>
  );
}

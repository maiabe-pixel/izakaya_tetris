type Props = {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoft: () => void;
  onHard: () => void;
};

export function FallingControls({
  onLeft,
  onRight,
  onRotate,
  onSoft,
  onHard,
}: Props) {
  return (
    <div className="arcade-pad" aria-label="落下操作">
      <div className="arcade-pad-row">
        <button type="button" className="btn pad-btn" onClick={onLeft}>
          ←
        </button>
        <button type="button" className="btn pad-btn" onClick={onRotate}>
          回転
        </button>
        <button type="button" className="btn pad-btn" onClick={onRight}>
          →
        </button>
      </div>
      <div className="arcade-pad-row">
        <button type="button" className="btn pad-btn" onClick={onSoft}>
          ↓ ソフト
        </button>
        <button
          type="button"
          className="btn btn-primary pad-hard"
          onClick={onHard}
        >
          ▼ ハードドロップ
        </button>
      </div>
    </div>
  );
}

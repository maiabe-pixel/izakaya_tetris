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
    <div className="controls-grid" aria-label="落下操作">
      <button type="button" className="btn" onClick={onLeft}>
        ←
      </button>
      <button type="button" className="btn" onClick={onRotate}>
        回転
      </button>
      <button type="button" className="btn" onClick={onRight}>
        →
      </button>
      <button type="button" className="btn" onClick={onSoft}>
        ↓
      </button>
      <button type="button" className="btn btn-primary" style={{ gridColumn: 'span 2' }} onClick={onHard}>
        ハードドロップ
      </button>
    </div>
  );
}

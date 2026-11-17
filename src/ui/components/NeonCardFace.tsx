import { MINO_COLORS } from '../../game/constants';
import { getMinoCells } from '../../game/falling/minos';
import type { Card, MinoType } from '../../game/types';

function MinoGlyph({ type }: { type: MinoType }) {
  const cells = getMinoCells(type, 0, 0, 0);
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const size = 12;
  return (
    <svg width={w * size} height={h * size} viewBox={`0 0 ${w * size} ${h * size}`}>
      {cells.map((c, i) => (
        <rect
          key={i}
          x={(c.x - minX) * size + 1}
          y={(c.y - minY) * size + 1}
          width={size - 2}
          height={size - 2}
          rx={2}
          fill={MINO_COLORS[type]}
        />
      ))}
    </svg>
  );
}

/** Ace = shape-pick; Joker = empty/skip. */
export function NeonCardFace({ card }: { card: Card }) {
  if (card.kind === 'mino') {
    return (
      <div className="neon-card">
        <MinoGlyph type={card.mino} />
        <div className="card-label">{card.mino}</div>
      </div>
    );
  }
  if (card.kind === 'shapePick') {
    return (
      <div className="neon-card ace" data-card="ace">
        <div style={{ fontSize: '1.6rem', color: '#ff4fd8' }}>A</div>
        <div className="card-label">エース</div>
      </div>
    );
  }
  return (
    <div className="neon-card joker" data-card="joker">
      <div style={{ fontSize: '1.6rem', color: '#ff9a3c' }}>★</div>
      <div className="card-label">ジョーカー</div>
    </div>
  );
}

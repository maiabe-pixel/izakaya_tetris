import { MINO_COLORS } from '../../game/constants';
import { getMinoCells } from '../../game/falling/minos';
import type { MinoType } from '../../game/types';

export function NextPreview({ type }: { type: MinoType }) {
  const cells = getMinoCells(type, 0, 0, 0);
  const size = 14;
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="hint">NEXT</div>
      <svg width={w * size + 8} height={h * size + 8}>
        {cells.map((c, i) => (
          <rect
            key={i}
            x={(c.x - minX) * size + 4}
            y={(c.y - minY) * size + 4}
            width={size - 2}
            height={size - 2}
            rx={2}
            fill={MINO_COLORS[type]}
          />
        ))}
      </svg>
    </div>
  );
}

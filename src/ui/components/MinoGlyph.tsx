import { MINO_COLORS } from '../../game/constants';
import { getMinoCells } from '../../game/falling/minos';
import type { MinoType } from '../../game/types';

/** Compact SVG silhouette for exclude / shape-pick cards. */
export function MinoGlyph({
  type,
  size = 11,
}: {
  type: MinoType;
  size?: number;
}) {
  const cells = getMinoCells(type, 0, 0, 0);
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  return (
    <svg
      width={w * size + 4}
      height={h * size + 4}
      aria-hidden="true"
      className="mino-glyph"
    >
      {cells.map((c, i) => (
        <rect
          key={i}
          x={(c.x - minX) * size + 2}
          y={(c.y - minY) * size + 2}
          width={size - 1.5}
          height={size - 1.5}
          rx={1.5}
          fill={MINO_COLORS[type]}
        />
      ))}
    </svg>
  );
}

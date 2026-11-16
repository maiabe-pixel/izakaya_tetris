import { BOARD_W } from '../constants';
import { collides } from '../falling/board';
import { getMinoCells } from '../falling/minos';
import type { Board, Landing, MinoType, Point } from '../types';

/**
 * For each legal origin X of the current rotation, drop from above until
 * resting on floor/blocks. One landing per unique cell set.
 */
export function computeLandings(
  board: Board,
  type: MinoType,
  rotation: number,
): Landing[] {
  const h = board.length;
  const landings: Landing[] = [];
  const seen = new Set<string>();

  for (let ox = -3; ox <= BOARD_W + 2; ox++) {
    let resting: Point[] | null = null;
    for (let y = -4; y <= h; y++) {
      const cells = getMinoCells(type, rotation, ox, y);
      // Horizontal OOB → this origin is invalid
      if (cells.some((c) => c.x < 0 || c.x >= BOARD_W)) {
        resting = null;
        break;
      }
      // Below floor or overlaps → stop; keep previous resting
      if (cells.some((c) => c.y >= h) || collides(board, cells)) {
        break;
      }
      resting = cells;
    }
    if (!resting) continue;
    // All cells must be on the board to lock
    if (resting.some((c) => c.y < 0)) continue;

    const key = resting
      .map((c) => `${c.x},${c.y}`)
      .sort()
      .join('|');
    if (seen.has(key)) continue;
    seen.add(key);

    const avgX = resting.reduce((s, c) => s + c.x, 0) / resting.length;
    const avgY = resting.reduce((s, c) => s + c.y, 0) / resting.length;
    const col = Math.min(...resting.map((c) => c.x));
    landings.push({ cells: resting, avgX, avgY, col });
  }

  landings.sort((a, b) => a.avgX - b.avgX || a.avgY - b.avgY || a.col - b.col);
  return landings;
}

function cellKey(cells: Point[]): string {
  return cells
    .map((c) => `${c.x},${c.y}`)
    .sort()
    .join('|');
}

/** Board center is between columns 4 and 5 (0-indexed), i.e. 4.5. */
export const BOARD_CENTER_X = 4.5;

export function nearestToCenter(landings: Landing[]): Landing | null {
  if (landings.length === 0) return null;
  return [...landings].sort((a, b) => {
    const da = Math.abs(a.avgX - BOARD_CENTER_X);
    const db = Math.abs(b.avgX - BOARD_CENTER_X);
    if (da !== db) return da - db;
    if (a.avgY !== b.avgY) return b.avgY - a.avgY; // lower first
    return a.avgX - b.avgX; // left first
  })[0]!;
}

export function nearestToAim(
  landings: Landing[],
  aim: Landing | null,
): Landing | null {
  if (landings.length === 0) return null;
  if (!aim) return nearestToCenter(landings);
  return [...landings].sort((a, b) => {
    const da = Math.abs(a.avgX - aim.avgX);
    const db = Math.abs(b.avgX - aim.avgX);
    if (da !== db) return da - db;
    const dya = Math.abs(a.avgY - aim.avgY);
    const dyb = Math.abs(b.avgY - aim.avgY);
    if (dya !== dyb) return dya - dyb;
    return a.avgX - b.avgX;
  })[0]!;
}

export function landingContainingCell(
  landings: Landing[],
  x: number,
  y: number,
): Landing | null {
  return (
    landings.find((l) => l.cells.some((c) => c.x === x && c.y === y)) ?? null
  );
}

export function landingInColumn(
  landings: Landing[],
  col: number,
): Landing | null {
  const hits = landings.filter((l) => l.cells.some((c) => c.x === col));
  if (hits.length === 0) return null;
  return [...hits].sort((a, b) => b.avgY - a.avgY || a.avgX - b.avgX)[0]!;
}

export function resolveTap(
  landings: Landing[],
  x: number,
  y: number,
): Landing | null {
  return (
    landingContainingCell(landings, x, y) ?? landingInColumn(landings, x)
  );
}

export function sameLanding(a: Landing | null, b: Landing | null): boolean {
  if (!a || !b) return false;
  return cellKey(a.cells) === cellKey(b.cells);
}

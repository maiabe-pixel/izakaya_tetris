import { ALL_MINOS } from '../falling/minos';
import type { Card, MinoType } from '../types';

/** Full 10-card pool: 7 minos + 2 shapePick + 1 empty. Never depletes. */
export function buildCardPool(): Card[] {
  const minos: Card[] = ALL_MINOS.map((m) => ({ kind: 'mino', mino: m }));
  return [...minos, { kind: 'shapePick' }, { kind: 'shapePick' }, { kind: 'empty' }];
}

export function drawCost(excluded: MinoType[]): number {
  return 1 + excluded.length;
}

export function filterPool(excluded: MinoType[]): Card[] {
  const set = new Set(excluded);
  return buildCardPool().filter((c) => {
    if (c.kind === 'mino') return !set.has(c.mino);
    return true; // shapePick + empty cannot be excluded
  });
}

export function drawCard(
  excluded: MinoType[] = [],
  rand: () => number = Math.random,
  forced?: Card,
): Card {
  if (forced) return forced;
  const pool = filterPool(excluded);
  const i = Math.floor(rand() * pool.length);
  return pool[i]!;
}

/** Player-facing names: Ace = shape-pick, Joker = empty/skip. */
export function cardLabel(card: Card): string {
  if (card.kind === 'mino') return card.mino;
  if (card.kind === 'shapePick') return 'エース';
  return 'ジョーカー';
}

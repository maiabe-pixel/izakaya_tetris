import { BOARD_W, FALLING_H, IZAKAYA_EXTRA_ROWS, IZAKAYA_H } from '../constants';
import type { Board, Cell, MinoType, Point } from '../types';

export function createEmptyBoard(height: number, width = BOARD_W): Board {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null as Cell),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function inBounds(x: number, y: number, h: number, w = BOARD_W): boolean {
  return x >= 0 && x < w && y >= 0 && y < h;
}

/** Collision: cells above the board (y < 0) are allowed (spawn). */
export function collides(
  board: Board,
  cells: Point[],
): boolean {
  const h = board.length;
  const w = board[0]?.length ?? BOARD_W;
  for (const { x, y } of cells) {
    if (x < 0 || x >= w) return true;
    if (y >= h) return true;
    if (y >= 0 && board[y][x] != null) return true;
  }
  return false;
}

export function lockCells(board: Board, cells: Point[], type: MinoType): Board {
  const next = cloneBoard(board);
  for (const { x, y } of cells) {
    if (y >= 0 && y < next.length && x >= 0 && x < next[0].length) {
      next[y][x] = type;
    }
  }
  return next;
}

export function clearFullLines(board: Board): { board: Board; cleared: number; rows: number[] } {
  const h = board.length;
  const w = board[0]?.length ?? BOARD_W;
  const kept: Board = [];
  const clearedRows: number[] = [];
  for (let y = 0; y < h; y++) {
    if (board[y].every((c) => c != null)) {
      clearedRows.push(y);
    } else {
      kept.push(board[y].slice());
    }
  }
  const cleared = clearedRows.length;
  while (kept.length < h) {
    kept.unshift(Array.from({ length: w }, () => null as Cell));
  }
  return { board: kept, cleared, rows: clearedRows };
}

export function isRowFull(board: Board, row: number): boolean {
  if (row < 0 || row >= board.length) return false;
  return board[row].every((c) => c != null);
}

/** Bottom-most row (highest index) is completely filled. */
export function isBottomRowFull(board: Board): boolean {
  if (board.length === 0) return false;
  return isRowFull(board, board.length - 1);
}

export function hasEmptyColumn(board: Board): boolean {
  const h = board.length;
  const w = board[0]?.length ?? BOARD_W;
  for (let x = 0; x < w; x++) {
    let empty = true;
    for (let y = 0; y < h; y++) {
      if (board[y][x] != null) {
        empty = false;
        break;
      }
    }
    if (empty) return true;
  }
  return false;
}

export function expandBoardForIzakaya(fallingBoard: Board): Board {
  const top = createEmptyBoard(IZAKAYA_EXTRA_ROWS);
  const body = fallingBoard.slice(0, FALLING_H).map((r) => r.slice());
  while (body.length < FALLING_H) {
    body.push(Array.from({ length: BOARD_W }, () => null as Cell));
  }
  const out = [...top, ...body];
  while (out.length < IZAKAYA_H) {
    out.push(Array.from({ length: BOARD_W }, () => null as Cell));
  }
  return out.slice(0, IZAKAYA_H);
}

export function boardOccupiedTopTwo(board: Board): boolean {
  // Top row or second row has any block → game over after lock (before clear).
  for (const y of [0, 1]) {
    if (y < board.length && board[y].some((c) => c != null)) return true;
  }
  return false;
}

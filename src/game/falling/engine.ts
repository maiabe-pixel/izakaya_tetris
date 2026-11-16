import {
  BOARD_W,
  FALLING_H,
  GRAVITY_MS,
  LINE_SCORE,
  LINES_PER_LEVEL,
} from '../constants';
import type { Board, MinoType, Point } from '../types';
import { SevenBag } from './bag';
import {
  boardOccupiedTopTwo,
  clearFullLines,
  cloneBoard,
  collides,
  createEmptyBoard,
  lockCells,
} from './board';
import { getMinoCells, spawnOriginX } from './minos';

export type FallingPiece = {
  type: MinoType;
  rotation: number;
  x: number;
  y: number;
};

export type FallingState = {
  board: Board;
  active: FallingPiece | null;
  next: MinoType;
  bag: SevenBag;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  dropMs: number;
};

const KICKS: Point[] = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -2, y: 0 },
  { x: 2, y: 0 },
];

export function createFallingState(rand?: () => number): FallingState {
  const bag = new SevenBag(rand);
  const first = bag.next();
  const next = bag.next();
  const state: FallingState = {
    board: createEmptyBoard(FALLING_H),
    active: null,
    next,
    bag,
    score: 0,
    lines: 0,
    level: 0,
    gameOver: false,
    dropMs: GRAVITY_MS[0],
  };
  return spawn(state, first);
}

function gravityForLevel(level: number): number {
  const i = Math.min(level, GRAVITY_MS.length - 1);
  return GRAVITY_MS[i];
}

function spawn(state: FallingState, type: MinoType): FallingState {
  const piece: FallingPiece = {
    type,
    rotation: 0,
    x: spawnOriginX(),
    y: 0,
  };
  const cells = getMinoCells(type, 0, piece.x, piece.y);
  if (collides(state.board, cells)) {
    return { ...state, active: piece, gameOver: true };
  }
  return { ...state, active: piece };
}

export function activeCells(piece: FallingPiece): Point[] {
  return getMinoCells(piece.type, piece.rotation, piece.x, piece.y);
}

export function ghostY(board: Board, piece: FallingPiece): number {
  let y = piece.y;
  while (true) {
    const next = { ...piece, y: y + 1 };
    if (collides(board, activeCells(next))) break;
    y++;
  }
  return y;
}

function tryMove(
  state: FallingState,
  dx: number,
  dy: number,
): FallingState | null {
  if (!state.active || state.gameOver) return null;
  const next = {
    ...state.active,
    x: state.active.x + dx,
    y: state.active.y + dy,
  };
  if (collides(state.board, activeCells(next))) return null;
  return { ...state, active: next };
}

export function moveLeft(state: FallingState): FallingState {
  return tryMove(state, -1, 0) ?? state;
}

export function moveRight(state: FallingState): FallingState {
  return tryMove(state, 1, 0) ?? state;
}

export function softDrop(state: FallingState): FallingState {
  const moved = tryMove(state, 0, 1);
  if (!moved) return lockPiece(state);
  return { ...moved, score: state.score + 1 };
}

export function hardDrop(state: FallingState): FallingState {
  if (!state.active || state.gameOver) return state;
  const y = ghostY(state.board, state.active);
  return lockPiece({ ...state, active: { ...state.active, y } });
}

export function rotateCw(state: FallingState): FallingState {
  if (!state.active || state.gameOver) return state;
  const nextRot = (state.active.rotation + 1) % 4;
  for (const k of KICKS) {
    const candidate = {
      ...state.active,
      rotation: nextRot,
      x: state.active.x + k.x,
      y: state.active.y + k.y,
    };
    if (!collides(state.board, activeCells(candidate))) {
      return { ...state, active: candidate };
    }
  }
  return state;
}

export function tickGravity(state: FallingState): FallingState {
  if (!state.active || state.gameOver) return state;
  const moved = tryMove(state, 0, 1);
  if (!moved) return lockPiece(state);
  return moved;
}

function lockPiece(state: FallingState): FallingState {
  if (!state.active) return state;
  const cells = activeCells(state.active);
  let board = lockCells(state.board, cells, state.active.type);

  // Game over if top two rows occupied after lock — no clear, no next spawn.
  if (boardOccupiedTopTwo(board)) {
    return {
      ...state,
      board,
      active: null,
      gameOver: true,
    };
  }

  const cleared = clearFullLines(board);
  board = cleared.board;
  let lines = state.lines + cleared.cleared;
  let level = Math.floor(lines / LINES_PER_LEVEL);
  let score = state.score;
  if (cleared.cleared > 0) {
    const mult = level + 1;
    score += (LINE_SCORE[cleared.cleared] ?? 0) * mult;
  }

  const nextType = state.next;
  const following = state.bag.next();
  const afterSpawn = spawn(
    {
      ...state,
      board,
      score,
      lines,
      level,
      dropMs: gravityForLevel(level),
      next: following,
      active: null,
    },
    nextType,
  );
  return afterSpawn;
}

export function fallingBoardSnapshot(state: FallingState): Board {
  return cloneBoard(state.board);
}

export { BOARD_W, FALLING_H };

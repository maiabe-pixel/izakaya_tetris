import {
  DEFAULT_TIME_LIMIT,
  ORDER_HISTORY_MAX,
  type TimeLimitSeconds,
} from '../constants';
import {
  clearFullLines,
  cloneBoard,
  expandBoardForIzakaya,
  isBottomRowFull,
  lockCells,
} from '../falling/board';
import type { Board, Card, MinoType, OrderKind } from '../types';
import { drawCard, drawCost } from './cards';
import {
  computeLandings,
  nearestToAim,
  nearestToCenter,
  resolveTap,
  sameLanding,
} from './landings';
import type { IzakayaState, IzakayaStats, SessionSave, UndoSnapshot } from './types';

function emptyStats(now = Date.now()): IzakayaStats {
  return {
    foodCount: 0,
    drinkCount: 0,
    usedCount: 0,
    drawCount: 0,
    shapePickCount: 0,
    emptyCardCount: 0,
    startedAt: now,
    clearedAt: null,
  };
}

export function createIzakayaState(
  fallingBoard: Board,
  timeLimit: TimeLimitSeconds = DEFAULT_TIME_LIMIT,
  now = Date.now(),
): IzakayaState {
  const board = expandBoardForIzakaya(fallingBoard);
  return {
    board,
    initialBoard: cloneBoard(board),
    phase: 'idle',
    resources: 0,
    orders: [],
    stats: emptyStats(now),
    timeLimit,
    remainingMs: timeLimit * 1000,
    excluded: [],
    card: null,
    selectedMino: null,
    rotation: 0,
    landings: [],
    aim: null,
    undo: null,
    cleared: false,
    message: null,
  };
}

export function resetIzakayaOnly(state: IzakayaState, now = Date.now()): IzakayaState {
  return {
    ...state,
    board: cloneBoard(state.initialBoard),
    phase: 'idle',
    resources: 0,
    orders: [],
    stats: emptyStats(now),
    remainingMs: state.timeLimit * 1000,
    excluded: [],
    card: null,
    selectedMino: null,
    rotation: 0,
    landings: [],
    aim: null,
    undo: null,
    cleared: false,
    message: null,
  };
}

export function restoreFromSave(save: SessionSave): IzakayaState {
  const timeLimit = save.timeLimit ?? DEFAULT_TIME_LIMIT;
  return {
    board: cloneBoard(save.board),
    initialBoard: cloneBoard(save.initialBoard ?? save.board),
    phase: 'idle',
    resources: save.resources,
    orders: save.orders ?? [],
    stats: { ...save.stats, clearedAt: null },
    timeLimit,
    remainingMs: timeLimit * 1000,
    excluded: [],
    card: null,
    selectedMino: null,
    rotation: 0,
    landings: [],
    aim: null,
    undo: null,
    cleared: false,
    message: null,
  };
}

export function toSessionSave(state: IzakayaState): SessionSave {
  return {
    v: 1,
    board: cloneBoard(state.board),
    initialBoard: cloneBoard(state.initialBoard),
    resources: state.resources,
    orders: state.orders.slice(0, ORDER_HISTORY_MAX),
    stats: { ...state.stats, clearedAt: null },
    timeLimit: state.timeLimit,
  };
}

export function recordOrder(
  state: IzakayaState,
  kind: OrderKind,
  name: string,
): IzakayaState {
  if (state.cleared || state.phase !== 'idle') return state;
  const trimmed = name.trim();
  const stats = { ...state.stats };
  if (kind === 'food') stats.foodCount += 1;
  else stats.drinkCount += 1;
  const orders =
    trimmed.length > 0
      ? [{ kind, name: trimmed, at: Date.now() }, ...state.orders].slice(
          0,
          ORDER_HISTORY_MAX,
        )
      : state.orders;
  return {
    ...state,
    resources: state.resources + 1,
    stats,
    orders,
    message: null,
  };
}

export function setExcluded(state: IzakayaState, excluded: MinoType[]): IzakayaState {
  if (state.phase !== 'idle') return state;
  return { ...state, excluded: [...excluded] };
}

export function toggleExclude(state: IzakayaState, mino: MinoType): IzakayaState {
  if (state.phase !== 'idle') return state;
  const has = state.excluded.includes(mino);
  const excluded = has
    ? state.excluded.filter((m) => m !== mino)
    : [...state.excluded, mino];
  return { ...state, excluded };
}

/**
 * DRAW — consumes resources and draws a card.
 * Optional `card` forces the result (tests / roulette animation settle).
 */
export function draw(
  state: IzakayaState,
  rand: () => number = Math.random,
  card?: Card,
): IzakayaState {
  if (state.cleared || state.phase !== 'idle') return state;
  const cost = drawCost(state.excluded);
  if (state.resources < cost) {
    return { ...state, message: '資源が足りません' };
  }
  const drawn = drawCard(state.excluded, rand, card);
  const base: IzakayaState = {
    ...state,
    resources: state.resources - cost,
    stats: {
      ...state.stats,
      drawCount: state.stats.drawCount + 1,
    },
    undo: null, // next draw discards undo
    excluded: [],
    message: null,
    rotation: 0,
  };

  if (drawn.kind === 'empty') {
    return {
      ...base,
      card: drawn,
      selectedMino: null,
      phase: 'idle',
      landings: [],
      aim: null,
      remainingMs: state.timeLimit * 1000,
      stats: {
        ...base.stats,
        emptyCardCount: base.stats.emptyCardCount + 1,
      },
      message: 'エース — 何も置けない',
    };
  }

  if (drawn.kind === 'shapePick') {
    return {
      ...base,
      card: drawn,
      selectedMino: null,
      phase: 'pickingShape',
      landings: [],
      aim: null,
      remainingMs: state.timeLimit * 1000,
      stats: {
        ...base.stats,
        shapePickCount: base.stats.shapePickCount + 1,
      },
      message: 'ジョーカー — 形を選んでください',
    };
  }

  return enterPlacing(base, drawn, drawn.mino);
}

function enterPlacing(
  state: IzakayaState,
  card: Card,
  mino: MinoType,
): IzakayaState {
  const landings = computeLandings(state.board, mino, 0);
  const aim = nearestToCenter(landings);
  return {
    ...state,
    card,
    selectedMino: mino,
    rotation: 0,
    phase: 'placing',
    landings,
    aim,
    remainingMs: state.timeLimit * 1000,
    message:
      landings.length === 0 ? '置ける場所がありません' : null,
  };
}

export function pickShape(state: IzakayaState, mino: MinoType): IzakayaState {
  if (state.phase !== 'pickingShape' || !state.card) return state;
  return enterPlacing(state, state.card, mino);
}

export function rotatePlacing(state: IzakayaState): IzakayaState {
  if (state.phase !== 'placing' || !state.selectedMino) return state;
  const rotation = (state.rotation + 1) % 4;
  const landings = computeLandings(state.board, state.selectedMino, rotation);
  let aim = state.aim;
  if (aim) {
    const sameCol = landings.find((l) => Math.abs(l.avgX - aim!.avgX) < 0.01);
    aim = sameCol ?? nearestToAim(landings, aim);
  } else {
    aim = nearestToCenter(landings);
  }
  return {
    ...state,
    rotation,
    landings,
    aim,
    message: landings.length === 0 ? '置ける場所がありません' : null,
  };
}

export function setAim(state: IzakayaState, aim: typeof state.aim): IzakayaState {
  if (state.phase !== 'placing') return state;
  return { ...state, aim };
}

export function tickTimer(state: IzakayaState, dtMs: number): IzakayaState {
  if (state.phase !== 'placing' || state.cleared) return state;
  const remainingMs = Math.max(0, state.remainingMs - dtMs);
  if (remainingMs > 0) return { ...state, remainingMs };
  return timeoutPlace({ ...state, remainingMs: 0 });
}

function snapshotForUndo(state: IzakayaState): UndoSnapshot {
  return {
    board: cloneBoard(state.board),
    usedCount: state.stats.usedCount,
    card: state.card!,
    selectedMino: state.selectedMino,
    rotation: state.rotation,
  };
}

function placeLanding(state: IzakayaState, landing: NonNullable<typeof state.aim>): IzakayaState {
  if (!state.selectedMino) return state;
  const undo = snapshotForUndo(state);
  const locked = lockCells(state.board, landing.cells, state.selectedMino);

  // USER OVERRIDE: win when bottom-most row is full before clear, then clear lines.
  const bottomFull = isBottomRowFull(locked);
  const { board, cleared } = clearFullLines(locked);
  const won = bottomFull && cleared > 0;

  const stats = {
    ...state.stats,
    usedCount: state.stats.usedCount + 1,
    clearedAt: won ? Date.now() : null,
  };

  if (won) {
    return {
      ...state,
      board,
      stats,
      phase: 'idle',
      card: null,
      selectedMino: null,
      landings: [],
      aim: null,
      undo: null,
      cleared: true,
      remainingMs: state.timeLimit * 1000,
      message: '最下段クリア！',
    };
  }

  return {
    ...state,
    board,
    stats,
    phase: 'idle',
    card: null,
    selectedMino: null,
    landings: [],
    aim: null,
    undo,
    cleared: false,
    remainingMs: state.timeLimit * 1000,
    message: null,
  };
}

export function placeAtTap(
  state: IzakayaState,
  x: number,
  y: number,
): IzakayaState {
  if (state.phase !== 'placing') return state;
  const landing = resolveTap(state.landings, x, y);
  if (!landing) {
    return { ...state, message: 'そこには置けません' };
  }
  return placeLanding(state, landing);
}

export function timeoutPlace(state: IzakayaState): IzakayaState {
  if (state.phase !== 'placing') return state;
  if (state.landings.length === 0) {
    // No place — end turn without board change, no undo, no usedCount bump
    return {
      ...state,
      phase: 'idle',
      card: null,
      selectedMino: null,
      landings: [],
      aim: null,
      remainingMs: state.timeLimit * 1000,
      message: '時間切れ — 置けませんでした',
    };
  }
  let target = state.aim;
  if (!target || !state.landings.some((l) => sameLanding(l, target))) {
    target = nearestToAim(state.landings, state.aim);
  }
  if (!target) {
    return {
      ...state,
      phase: 'idle',
      card: null,
      selectedMino: null,
      landings: [],
      aim: null,
      remainingMs: state.timeLimit * 1000,
      message: '時間切れ — 置けませんでした',
    };
  }
  return placeLanding(state, target);
}

export function undoPlace(state: IzakayaState): IzakayaState {
  if (state.phase !== 'idle' || !state.undo || state.cleared) return state;
  const u = state.undo;
  const mino =
    u.selectedMino ??
    (u.card.kind === 'mino' ? u.card.mino : null);
  if (!mino) return state;
  const landings = computeLandings(u.board, mino, u.rotation);
  const aim = nearestToCenter(landings);
  return {
    ...state,
    board: cloneBoard(u.board),
    stats: { ...state.stats, usedCount: u.usedCount },
    card: u.card,
    selectedMino: mino,
    rotation: u.rotation,
    phase: 'placing',
    landings,
    aim,
    undo: null,
    remainingMs: state.timeLimit * 1000,
    message: null,
  };
}

export { expandBoardForIzakaya, isBottomRowFull, clearFullLines, drawCost };

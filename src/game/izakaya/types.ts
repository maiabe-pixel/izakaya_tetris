import type { TimeLimitSeconds } from '../constants';
import type {
  Board,
  Card,
  IzakayaPhase,
  Landing,
  MinoType,
  OrderEntry,
} from '../types';

export type UndoSnapshot = {
  board: Board;
  usedCount: number;
  card: Card;
  selectedMino: MinoType | null;
  rotation: number;
};

export type IzakayaStats = {
  foodCount: number;
  drinkCount: number;
  usedCount: number;
  drawCount: number;
  shapePickCount: number;
  emptyCardCount: number;
  startedAt: number;
  clearedAt: number | null;
};

export type IzakayaState = {
  board: Board;
  /** Board at izakaya start (for 「居酒屋だけやり直す」). */
  initialBoard: Board;
  phase: IzakayaPhase;
  resources: number;
  orders: OrderEntry[];
  stats: IzakayaStats;
  timeLimit: TimeLimitSeconds;
  remainingMs: number;
  excluded: MinoType[];
  card: Card | null;
  selectedMino: MinoType | null;
  rotation: number;
  landings: Landing[];
  aim: Landing | null;
  undo: UndoSnapshot | null;
  cleared: boolean;
  message: string | null;
};

export type SessionSave = {
  v: 1;
  board: Board;
  initialBoard: Board;
  resources: number;
  orders: OrderEntry[];
  stats: IzakayaStats;
  timeLimit: TimeLimitSeconds;
};

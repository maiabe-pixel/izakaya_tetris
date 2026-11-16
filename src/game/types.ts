export type MinoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type Cell = MinoType | null;

export type Board = Cell[][]; // [row][col], row 0 = top

export type Point = { x: number; y: number };

export type Screen =
  | 'title'
  | 'timeLimit'
  | 'falling'
  | 'izakaya'
  | 'result';

export type CardKind = 'mino' | 'shapePick' | 'empty';

export type Card =
  | { kind: 'mino'; mino: MinoType }
  | { kind: 'shapePick' }
  | { kind: 'empty' };

export type IzakayaPhase = 'idle' | 'pickingShape' | 'placing';

export type OrderKind = 'food' | 'drink';

export type OrderEntry = {
  kind: OrderKind;
  name: string;
  at: number;
};

export type Landing = {
  /** Top-left of the piece AABB is not used; cells are absolute. */
  cells: Point[];
  /** Average x of occupied cells (for aim / nearest). */
  avgX: number;
  avgY: number;
  /** Column index used when resolving by column (min x of cells). */
  col: number;
};

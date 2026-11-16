export const GAME_TITLE = '居酒屋テトリス';
export const GAME_SUBTITLE = '― 詰んでからが、本番。―';
export const GAME_EYEBROW = 'IZAKAYA TETRIS';

export const BOARD_W = 10;
export const FALLING_H = 20;
export const IZAKAYA_EXTRA_ROWS = 7;
export const IZAKAYA_H = FALLING_H + IZAKAYA_EXTRA_ROWS; // 27

export const TIME_LIMIT_OPTIONS = [3, 5, 7, 10, 15] as const;
export type TimeLimitSeconds = (typeof TIME_LIMIT_OPTIONS)[number];
export const DEFAULT_TIME_LIMIT: TimeLimitSeconds = 7;

export const SESSION_SAVE_KEY = 'izakaya-neon-puzzle:session-v1';
export const AUDIO_SAVE_KEY = 'izakaya-neon-puzzle:audio-v1';

export const ORDER_HISTORY_MAX = 20;
export const CARD_POOL_SIZE = 10;
export const DRAG_AIM_THRESHOLD_PX = 12;

/** Gravity intervals (ms) by speed stage. Unique to this product. */
export const GRAVITY_MS = [
  800, 720, 640, 560, 480, 400, 340, 280, 230, 190, 160, 130, 110, 95, 80,
] as const;

export const LINE_SCORE = [0, 100, 300, 500, 800] as const;
export const LINES_PER_LEVEL = 10;

export const MINO_COLORS: Record<string, string> = {
  I: '#2ee6ff',
  O: '#f5d547',
  T: '#c46bff',
  S: '#4dff8a',
  Z: '#ff5c8a',
  J: '#4f7cff',
  L: '#ff9a3c',
};

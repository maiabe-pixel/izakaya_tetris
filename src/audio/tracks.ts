/**
 * Single source of truth for BGM paths.
 * Swap files here without touching playback logic.
 * Public builds strip *.mp3 from dist (see vite plugin + verify:no-bgm).
 */

export type TrackId = 'falling' | 'izakaya';

export type TrackMeta = {
  id: TrackId;
  /** Public URL path (served from /public). */
  src: string;
  title: string;
  artist: string;
  source: string;
  license: string;
  note: string;
};

export const TRACKS: Record<TrackId, TrackMeta> = {
  falling: {
    id: 'falling',
    src: '/audio/tetris.mp3',
    title: '',
    artist: '',
    source: '',
    license: '未確認',
    note: 'ローカル確認用。公開リポジトリには同梱しない。',
  },
  izakaya: {
    id: 'izakaya',
    src: '/audio/izakaya.mp3',
    title: '',
    artist: '',
    source: '',
    license: '未確認',
    note: 'ローカル確認用。公開リポジトリには同梱しない。',
  },
};

export const BGM_FADE_OUT_MS = 700;
export const BGM_FADE_IN_MS = 1000;

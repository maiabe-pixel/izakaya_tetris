/**
 * Single source of truth for BGM paths and metadata.
 * Swap files here without touching playback logic.
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
    title: 'Falling theme',
    artist: 'Provided by project owner',
    source: 'public/audio/tetris.mp3',
    license: '著作権フリー（公開同梱可）',
    note: '落下モード用。ユーザー提供のフリー音源。',
  },
  izakaya: {
    id: 'izakaya',
    src: '/audio/izakaya.mp3',
    title: 'Izakaya theme',
    artist: 'Provided by project owner',
    source: 'public/audio/izakaya.mp3',
    license: '著作権フリー（公開同梱可）',
    note: '居酒屋モード用。ユーザー提供のフリー音源。',
  },
};

export const BGM_FADE_OUT_MS = 700;
export const BGM_FADE_IN_MS = 1000;

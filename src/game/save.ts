import { AUDIO_SAVE_KEY, SESSION_SAVE_KEY } from './constants';
import type { SessionSave } from './izakaya/types';

export type AudioSettings = {
  bgmOn: boolean;
  sfxOn: boolean;
  /** 0–100, default 15 */
  bgmVolume: number;
};

export const DEFAULT_AUDIO: AudioSettings = {
  bgmOn: true,
  sfxOn: true,
  bgmVolume: 15,
};

export function loadSession(): SessionSave | null {
  try {
    const raw = localStorage.getItem(SESSION_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSave;
    if (!parsed || parsed.v !== 1 || !parsed.board) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(save: SessionSave): void {
  try {
    localStorage.setItem(SESSION_SAVE_KEY, JSON.stringify(save));
  } catch {
    /* ignore quota */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(AUDIO_SAVE_KEY);
    if (!raw) return { ...DEFAULT_AUDIO };
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      bgmOn: parsed.bgmOn ?? true,
      sfxOn: parsed.sfxOn ?? true,
      bgmVolume:
        typeof parsed.bgmVolume === 'number'
          ? Math.max(0, Math.min(100, parsed.bgmVolume))
          : 15,
    };
  } catch {
    return { ...DEFAULT_AUDIO };
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_SAVE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

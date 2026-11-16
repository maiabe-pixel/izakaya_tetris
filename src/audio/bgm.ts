import { resumeAudioContext } from './audioContext';
import type { AudioSettings } from './settings';
import {
  BGM_FADE_IN_MS,
  BGM_FADE_OUT_MS,
  TRACKS,
  type TrackId,
} from './tracks';

type Slot = {
  id: TrackId;
  audio: HTMLAudioElement;
  fadeTimer: number | null;
};

const slots = new Map<TrackId, HTMLAudioElement>();
let current: Slot | null = null;
let pendingUnlock: TrackId | null = null;
let unlocked = false;
let gestureHooked = false;

function volumeLinear(settings: AudioSettings): number {
  if (!settings.bgmOn) return 0;
  return Math.max(0, Math.min(1, settings.bgmVolume / 100));
}

function clearFade(slot: Slot | null) {
  if (slot?.fadeTimer != null) {
    window.clearInterval(slot.fadeTimer);
    slot.fadeTimer = null;
  }
}

function fadeTo(
  slot: Slot,
  target: number,
  ms: number,
  onDone?: () => void,
): void {
  clearFade(slot);
  const el = slot.audio;
  const start = el.volume;
  const steps = Math.max(1, Math.floor(ms / 40));
  let i = 0;
  slot.fadeTimer = window.setInterval(() => {
    i++;
    const t = i / steps;
    el.volume = Math.max(0, Math.min(1, start + (target - start) * t));
    if (i >= steps) {
      clearFade(slot);
      el.volume = target;
      onDone?.();
    }
  }, 40);
}

function ensureElement(id: TrackId): HTMLAudioElement {
  let audio = slots.get(id);
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
    audio.src = TRACKS[id].src;
    slots.set(id, audio);
  } else if (!audio.src.endsWith(TRACKS[id].src) && audio.src !== TRACKS[id].src) {
    // Keep absolute vs path comparison loose — assign canonical path once.
    if (!audio.src.includes(TRACKS[id].src.replace(/^\//, ''))) {
      audio.src = TRACKS[id].src;
    }
  }
  return audio;
}

/** Warm both tracks so mode switches don't allocate a fresh element mid-session. */
export function preloadBgm(): void {
  if (typeof window === 'undefined') return;
  for (const id of Object.keys(TRACKS) as TrackId[]) {
    const el = ensureElement(id);
    try {
      el.load();
    } catch {
      /* ignore */
    }
  }
}

export async function playBgm(
  id: TrackId,
  settings: AudioSettings,
): Promise<void> {
  pendingUnlock = id;
  await resumeAudioContext();

  const audio = ensureElement(id);
  audio.volume = audio.volume || 0;

  if (current?.id === id) {
    const target = volumeLinear(settings);
    try {
      if (audio.paused) await audio.play();
      unlocked = true;
      pendingUnlock = null;
      fadeTo(current, target, BGM_FADE_IN_MS);
    } catch {
      pendingUnlock = id;
    }
    return;
  }

  const prev = current;
  current = null;
  if (prev && prev.id !== id) {
    fadeTo(prev, 0, BGM_FADE_OUT_MS, () => {
      prev.audio.pause();
    });
  }

  const slot: Slot = { id, audio, fadeTimer: null };
  current = slot;
  const target = volumeLinear(settings);
  try {
    await audio.play();
    unlocked = true;
    pendingUnlock = null;
    fadeTo(slot, target, BGM_FADE_IN_MS);
  } catch {
    // Mobile Safari often blocks play outside the latest user gesture.
    pendingUnlock = id;
  }
}

export async function stopBgm(): Promise<void> {
  // Keep pendingUnlock so a later gesture can start the next track if requested again.
  const prev = current;
  current = null;
  if (!prev) return;
  fadeTo(prev, 0, BGM_FADE_OUT_MS, () => {
    prev.audio.pause();
  });
}

export async function applyBgmSettings(settings: AudioSettings): Promise<void> {
  if (!current) {
    if (settings.bgmOn && pendingUnlock) {
      await playBgm(pendingUnlock, settings);
    }
    return;
  }
  const target = volumeLinear(settings);
  fadeTo(current, target, settings.bgmOn ? BGM_FADE_IN_MS : BGM_FADE_OUT_MS);
  if (settings.bgmOn) {
    try {
      await current.audio.play();
      pendingUnlock = null;
    } catch {
      pendingUnlock = current.id;
    }
  }
}

export function markAudioUnlocked(): void {
  unlocked = true;
}

export function getPendingBgm(): TrackId | null {
  return pendingUnlock;
}

export function getCurrentBgm(): TrackId | null {
  return current?.id ?? null;
}

export function isBgmUnlocked(): boolean {
  return unlocked;
}

/**
 * Always listen for gestures so delayed mode-entry BGM (e.g. after falling
 * game-over timeout) can start on the next tap on iOS/Android.
 */
export function ensureBgmGestureRetry(
  getSettings: () => AudioSettings,
): () => void {
  if (typeof window === 'undefined' || gestureHooked) {
    return () => undefined;
  }
  gestureHooked = true;
  const onGesture = () => {
    markAudioUnlocked();
    void resumeAudioContext();
    const pending = getPendingBgm();
    if (pending) void playBgm(pending, getSettings());
  };
  window.addEventListener('pointerdown', onGesture);
  window.addEventListener('touchstart', onGesture, { passive: true });
  window.addEventListener('keydown', onGesture);
  return () => {
    gestureHooked = false;
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('touchstart', onGesture);
    window.removeEventListener('keydown', onGesture);
  };
}

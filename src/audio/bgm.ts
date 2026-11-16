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

let current: Slot | null = null;
let pendingUnlock: TrackId | null = null;
let unlocked = false;

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

async function makeAudio(id: TrackId): Promise<HTMLAudioElement | null> {
  const meta = TRACKS[id];
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  audio.src = meta.src;
  audio.volume = 0;
  try {
    // Probe load; missing file is OK (local without BGM).
    await new Promise<void>((resolve) => {
      const ok = () => {
        cleanup();
        resolve();
      };
      const fail = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', ok);
        audio.removeEventListener('error', fail);
      };
      audio.addEventListener('canplaythrough', ok);
      audio.addEventListener('error', fail);
      audio.load();
      window.setTimeout(ok, 800);
    });
  } catch {
    /* ignore */
  }
  return audio;
}

export async function playBgm(
  id: TrackId,
  settings: AudioSettings,
): Promise<void> {
  await resumeAudioContext();
  if (!unlocked) {
    pendingUnlock = id;
  }
  if (current?.id === id) {
    // Re-apply volume
    const target = volumeLinear(settings);
    fadeTo(current, target, BGM_FADE_IN_MS);
    return;
  }

  const prev = current;
  current = null;
  if (prev) {
    fadeTo(prev, 0, BGM_FADE_OUT_MS, () => {
      prev.audio.pause();
      prev.audio.src = '';
    });
  }

  const audio = await makeAudio(id);
  if (!audio) return;
  const slot: Slot = { id, audio, fadeTimer: null };
  current = slot;
  const target = volumeLinear(settings);
  try {
    await audio.play();
    unlocked = true;
    fadeTo(slot, target, BGM_FADE_IN_MS);
  } catch {
    pendingUnlock = id;
    // Will retry after user gesture
  }
}

export async function stopBgm(): Promise<void> {
  pendingUnlock = null;
  const prev = current;
  current = null;
  if (!prev) return;
  fadeTo(prev, 0, BGM_FADE_OUT_MS, () => {
    prev.audio.pause();
    prev.audio.src = '';
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
    } catch {
      /* ignore */
    }
  }
}

export function markAudioUnlocked(): void {
  unlocked = true;
  if (pendingUnlock) {
    const id = pendingUnlock;
    // Caller should call playBgm with settings after this.
    void id;
  }
}

export function getPendingBgm(): TrackId | null {
  return pendingUnlock;
}

export function getCurrentBgm(): TrackId | null {
  return current?.id ?? null;
}

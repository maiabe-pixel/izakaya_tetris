import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  applyBgmSettings,
  ensureBgmGestureRetry,
  getPendingBgm,
  markAudioUnlocked,
  playBgm,
  preloadBgm,
  stopBgm,
} from './bgm';
import {
  DEFAULT_AUDIO,
  loadAudioSettings,
  saveAudioSettings,
  type AudioSettings,
} from './settings';
import { playSfx, type SfxId } from './sfx';
import type { TrackId } from './tracks';
import { resumeAudioContext } from './audioContext';

export type AudioApi = {
  settings: AudioSettings;
  setBgmOn: (on: boolean) => void;
  setSfxOn: (on: boolean) => void;
  setBgmVolume: (v: number) => void;
  unlock: () => void;
  playTrack: (id: TrackId) => void;
  stopTrack: () => void;
  sfx: (id: SfxId) => void;
};

export const AudioContextReact = createContext<AudioApi | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    if (typeof window === 'undefined') return { ...DEFAULT_AUDIO };
    return loadAudioSettings();
  });
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    saveAudioSettings(settings);
    void applyBgmSettings(settings);
  }, [settings]);

  useEffect(() => {
    preloadBgm();
    return ensureBgmGestureRetry(() => settingsRef.current);
  }, []);

  const unlock = useCallback(() => {
    markAudioUnlocked();
    void resumeAudioContext();
    const pending = getPendingBgm();
    if (pending) void playBgm(pending, settingsRef.current);
  }, []);

  const playTrack = useCallback((id: TrackId) => {
    void playBgm(id, settingsRef.current);
  }, []);

  const stopTrack = useCallback(() => {
    void stopBgm();
  }, []);

  const sfx = useCallback((id: SfxId) => {
    void playSfx(id, settingsRef.current);
  }, []);

  const api = useMemo<AudioApi>(
    () => ({
      settings,
      setBgmOn: (bgmOn) => setSettings((s) => ({ ...s, bgmOn })),
      setSfxOn: (sfxOn) => setSettings((s) => ({ ...s, sfxOn })),
      setBgmVolume: (bgmVolume) =>
        setSettings((s) => ({
          ...s,
          bgmVolume: Math.max(0, Math.min(100, bgmVolume)),
        })),
      unlock,
      playTrack,
      stopTrack,
      sfx,
    }),
    [settings, unlock, playTrack, stopTrack, sfx],
  );

  return (
    <AudioContextReact.Provider value={api}>{children}</AudioContextReact.Provider>
  );
}

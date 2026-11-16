import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyBgmSettings,
  getPendingBgm,
  markAudioUnlocked,
  playBgm,
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

  useEffect(() => {
    saveAudioSettings(settings);
    void applyBgmSettings(settings);
  }, [settings]);

  const unlock = useCallback(() => {
    markAudioUnlocked();
    void resumeAudioContext();
    const pending = getPendingBgm();
    if (pending) void playBgm(pending, settings);
  }, [settings]);

  useEffect(() => {
    const onFirst = () => unlock();
    window.addEventListener('pointerdown', onFirst, { once: true });
    window.addEventListener('keydown', onFirst, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirst);
      window.removeEventListener('keydown', onFirst);
    };
  }, [unlock]);

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
      playTrack: (id) => {
        void playBgm(id, settings);
      },
      stopTrack: () => {
        void stopBgm();
      },
      sfx: (id) => {
        void playSfx(id, settings);
      },
    }),
    [settings, unlock],
  );

  return (
    <AudioContextReact.Provider value={api}>{children}</AudioContextReact.Provider>
  );
}

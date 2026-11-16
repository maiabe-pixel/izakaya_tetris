import { getSharedAudioContext, resumeAudioContext } from './audioContext';
import type { AudioSettings } from './settings';

export type SfxId =
  | 'move'
  | 'rotate'
  | 'hardDrop'
  | 'lineClear'
  | 'levelUp'
  | 'cardDraw'
  | 'cardDecide'
  | 'emptyCard'
  | 'order'
  | 'gameOver'
  | 'timeoutPlace'
  | 'clear';

type Tone = { freq: number; dur: number; type?: OscillatorType; gain?: number };

const PATCHES: Record<SfxId, Tone[]> = {
  move: [{ freq: 420, dur: 0.04, type: 'square', gain: 0.08 }],
  rotate: [{ freq: 560, dur: 0.05, type: 'triangle', gain: 0.1 }],
  hardDrop: [
    { freq: 180, dur: 0.06, type: 'square', gain: 0.12 },
    { freq: 90, dur: 0.08, type: 'square', gain: 0.1 },
  ],
  lineClear: [
    { freq: 520, dur: 0.08, type: 'sine', gain: 0.12 },
    { freq: 780, dur: 0.1, type: 'sine', gain: 0.1 },
  ],
  levelUp: [
    { freq: 440, dur: 0.08, type: 'sine', gain: 0.1 },
    { freq: 660, dur: 0.1, type: 'sine', gain: 0.1 },
    { freq: 880, dur: 0.12, type: 'sine', gain: 0.1 },
  ],
  cardDraw: [
    { freq: 300, dur: 0.05, type: 'sawtooth', gain: 0.06 },
    { freq: 450, dur: 0.08, type: 'sawtooth', gain: 0.07 },
  ],
  cardDecide: [{ freq: 700, dur: 0.12, type: 'triangle', gain: 0.12 }],
  emptyCard: [{ freq: 160, dur: 0.18, type: 'sine', gain: 0.1 }],
  order: [{ freq: 640, dur: 0.07, type: 'triangle', gain: 0.09 }],
  gameOver: [
    { freq: 220, dur: 0.15, type: 'sawtooth', gain: 0.1 },
    { freq: 140, dur: 0.25, type: 'sawtooth', gain: 0.1 },
  ],
  timeoutPlace: [{ freq: 380, dur: 0.1, type: 'square', gain: 0.1 }],
  clear: [
    { freq: 523, dur: 0.12, type: 'sine', gain: 0.12 },
    { freq: 659, dur: 0.12, type: 'sine', gain: 0.12 },
    { freq: 784, dur: 0.2, type: 'sine', gain: 0.14 },
  ],
};

export async function playSfx(
  id: SfxId,
  settings: AudioSettings,
): Promise<void> {
  if (!settings.sfxOn) return;
  const ctx = await resumeAudioContext();
  if (!ctx) return;
  const tones = PATCHES[id];
  let t = ctx.currentTime;
  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.value = tone.freq;
    const g = tone.gain ?? 0.1;
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + tone.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + tone.dur + 0.02);
    t += tone.dur * 0.7;
  }
  void getSharedAudioContext();
}

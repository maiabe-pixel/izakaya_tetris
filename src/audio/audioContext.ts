/** Shared AudioContext helper — carefully named to avoid clashing with DOM AudioContext. */

let ctx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export async function resumeAudioContext(): Promise<AudioContext | null> {
  const c = getSharedAudioContext();
  if (!c) return null;
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      /* autoplay policy */
    }
  }
  return c;
}

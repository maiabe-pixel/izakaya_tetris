import { useContext } from 'react';
import { AudioContextReact } from './AudioProvider';

export function useAudio() {
  const ctx = useContext(AudioContextReact);
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return ctx;
}

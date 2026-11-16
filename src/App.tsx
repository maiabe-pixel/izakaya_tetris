import { useCallback, useEffect, useState } from 'react';
import { useAudio } from './audio/useAudio';
import {
  DEFAULT_TIME_LIMIT,
  type TimeLimitSeconds,
} from './game/constants';
import {
  createFallingState,
  fallingBoardSnapshot,
  type FallingState,
} from './game/falling/engine';
import {
  createIzakayaState,
  resetIzakayaOnly,
  restoreFromSave,
  toSessionSave,
} from './game/izakaya/engine';
import type { IzakayaState } from './game/izakaya/types';
import { clearSession, loadSession, saveSession } from './game/save';
import type { Screen } from './game/types';
import { AppShell } from './ui/AppShell';
import { FallingScreen } from './ui/screens/FallingScreen';
import { IzakayaScreen } from './ui/screens/IzakayaScreen';
import { ResultScreen } from './ui/screens/ResultScreen';
import { TimeLimitScreen } from './ui/screens/TimeLimitScreen';
import { TitleScreen } from './ui/screens/TitleScreen';

export default function App() {
  const audio = useAudio();
  const [screen, setScreen] = useState<Screen>('title');
  const [timeLimit, setTimeLimit] =
    useState<TimeLimitSeconds>(DEFAULT_TIME_LIMIT);
  const [falling, setFalling] = useState<FallingState | null>(null);
  const [izakaya, setIzakaya] = useState<IzakayaState | null>(null);
  const [hasSave, setHasSave] = useState(() => !!loadSession());

  // Persist izakaya idle session
  useEffect(() => {
    if (!izakaya || screen !== 'izakaya') return;
    if (izakaya.phase !== 'idle' || izakaya.cleared) return;
    saveSession(toSessionSave(izakaya));
    setHasSave(true);
  }, [izakaya, screen]);

  // Falling → izakaya on game over
  useEffect(() => {
    if (screen !== 'falling' || !falling?.gameOver) return;
    audio.sfx('gameOver');
    const board = fallingBoardSnapshot(falling);
    const t = window.setTimeout(() => {
      audio.stopTrack();
      const next = createIzakayaState(board, timeLimit);
      setIzakaya(next);
      setScreen('izakaya');
      // May be deferred until next gesture on mobile — IzakayaScreen retries.
      audio.playTrack('izakaya');
    }, 700);
    return () => window.clearTimeout(t);
  }, [screen, falling, timeLimit, audio]);

  // Cleared → result
  useEffect(() => {
    if (screen !== 'izakaya' || !izakaya?.cleared) return;
    const t = window.setTimeout(() => {
      clearSession();
      setHasSave(false);
      setScreen('result');
    }, 900);
    return () => window.clearTimeout(t);
  }, [screen, izakaya]);

  const goTitle = useCallback(() => {
    audio.stopTrack();
    setFalling(null);
    setIzakaya(null);
    setScreen('title');
    setHasSave(!!loadSession());
  }, [audio]);

  return (
    <AppShell>
      {screen === 'title' && (
        <TitleScreen
          hasSave={hasSave}
          onStart={() => {
            audio.unlock();
            setTimeLimit(DEFAULT_TIME_LIMIT);
            setScreen('timeLimit');
          }}
          onContinue={() => {
            audio.unlock();
            const save = loadSession();
            if (!save) return;
            setIzakaya(restoreFromSave(save));
            setTimeLimit(save.timeLimit ?? DEFAULT_TIME_LIMIT);
            setScreen('izakaya');
            // Start under this tap gesture (iOS); screen effect will reinforce.
            audio.playTrack('izakaya');
          }}
          onClearSave={() => {
            clearSession();
            setHasSave(false);
          }}
        />
      )}

      {screen === 'timeLimit' && (
        <TimeLimitScreen
          value={timeLimit}
          onChange={setTimeLimit}
          onBack={() => setScreen('title')}
          onConfirm={() => {
            setFalling(createFallingState());
            setScreen('falling');
          }}
        />
      )}

      {screen === 'falling' && falling && (
        <FallingScreen
          state={falling}
          setState={setFalling}
          timeLimit={timeLimit}
        />
      )}

      {screen === 'izakaya' && izakaya && (
        <IzakayaScreen
          state={izakaya}
          setState={setIzakaya}
          onResetIzakaya={() => setIzakaya(resetIzakayaOnly(izakaya))}
          onRestartFalling={() => {
            clearSession();
            setHasSave(false);
            setIzakaya(null);
            setFalling(createFallingState());
            setScreen('falling');
          }}
          onTitleClear={() => {
            clearSession();
            setHasSave(false);
            goTitle();
          }}
        />
      )}

      {screen === 'result' && izakaya && (
        <ResultScreen
          stats={izakaya.stats}
          orders={izakaya.orders}
          onTitle={goTitle}
        />
      )}
    </AppShell>
  );
}

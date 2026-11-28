import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { Board, Screen } from './game/types';
import { AppShell } from './ui/AppShell';
import { IzakayaEntryFanfare } from './ui/components/IzakayaEntryFanfare';
import { FallingScreen } from './ui/screens/FallingScreen';
import { IzakayaScreen } from './ui/screens/IzakayaScreen';
import { ResultScreen } from './ui/screens/ResultScreen';
import { TimeLimitScreen } from './ui/screens/TimeLimitScreen';
import { TitleScreen } from './ui/screens/TitleScreen';

/** Existing GAME OVER hold before the entry fanfare (unchanged). */
const GAME_OVER_HOLD_MS = 700;

export default function App() {
  const audio = useAudio();
  const [screen, setScreen] = useState<Screen>('title');
  const [timeLimit, setTimeLimit] =
    useState<TimeLimitSeconds>(DEFAULT_TIME_LIMIT);
  const [falling, setFalling] = useState<FallingState | null>(null);
  const [izakaya, setIzakaya] = useState<IzakayaState | null>(null);
  const [hasSave, setHasSave] = useState(() => !!loadSession());
  const [fanfare, setFanfare] = useState(false);
  const pendingBoardRef = useRef<Board | null>(null);
  const goArmedRef = useRef(false);

  // Persist izakaya idle session
  useEffect(() => {
    if (!izakaya || screen !== 'izakaya') return;
    if (izakaya.phase !== 'idle' || izakaya.cleared) return;
    saveSession(toSessionSave(izakaya));
    setHasSave(true);
  }, [izakaya, screen]);

  // Falling GAME OVER → hold → fanfare (izakaya starts after fanfare)
  useEffect(() => {
    if (screen !== 'falling' || !falling?.gameOver) {
      goArmedRef.current = false;
      return;
    }
    if (goArmedRef.current || fanfare) return;
    goArmedRef.current = true;
    audio.sfx('gameOver');
    pendingBoardRef.current = fallingBoardSnapshot(falling);
    const t = window.setTimeout(() => {
      setFanfare(true);
    }, GAME_OVER_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [screen, falling, fanfare, audio]);

  const finishFanfare = useCallback(() => {
    const board = pendingBoardRef.current;
    pendingBoardRef.current = null;
    setFanfare(false);
    goArmedRef.current = false;
    if (!board) return;
    audio.stopTrack();
    const next = createIzakayaState(board, timeLimit);
    setIzakaya(next);
    setScreen('izakaya');
    // May be deferred until next gesture on mobile — IzakayaScreen retries.
    audio.playTrack('izakaya');
  }, [audio, timeLimit]);

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
    setFanfare(false);
    pendingBoardRef.current = null;
    goArmedRef.current = false;
    setFalling(null);
    setIzakaya(null);
    setScreen('title');
    setHasSave(!!loadSession());
  }, [audio]);

  // DEV-only: force GAME OVER to exercise fanfare timing in local checks.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as Window & {
      __izForceFallingGameOver?: () => void;
    };
    w.__izForceFallingGameOver = () => {
      setFalling((s) => {
        const base = s ?? createFallingState();
        return { ...base, gameOver: true, active: null };
      });
      setScreen('falling');
    };
    return () => {
      delete w.__izForceFallingGameOver;
    };
  }, []);

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
            // Save resume skips fanfare (in-session continue only).
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

      {fanfare ? <IzakayaEntryFanfare onDone={finishFanfare} /> : null}

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

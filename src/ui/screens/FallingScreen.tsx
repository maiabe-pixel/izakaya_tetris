import { useEffect, useRef } from 'react';
import { useAudio } from '../../audio/useAudio';
import {
  hardDrop,
  moveLeft,
  moveRight,
  rotateCw,
  softDrop,
  tickGravity,
  type FallingState,
} from '../../game/falling/engine';
import { FallingBoardCanvas } from '../components/FallingBoardCanvas';
import { FallingControls } from '../components/FallingControls';
import { NextPreview } from '../components/NextPreview';

type Props = {
  state: FallingState;
  setState: (s: FallingState) => void;
  timeLimit: number;
};

export function FallingScreen({ state, setState, timeLimit }: Props) {
  const audio = useAudio();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    audio.playTrack('falling');
  }, [audio]);

  useEffect(() => {
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;
      const s = stateRef.current;
      if (!s.gameOver && s.active) {
        while (acc >= s.dropMs) {
          acc -= s.dropMs;
          const next = tickGravity(stateRef.current);
          stateRef.current = next;
          setState(next);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [setState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stateRef.current.gameOver) return;
      let next: FallingState | null = null;
      if (e.key === 'ArrowLeft') {
        next = moveLeft(stateRef.current);
        audio.sfx('move');
      } else if (e.key === 'ArrowRight') {
        next = moveRight(stateRef.current);
        audio.sfx('move');
      } else if (e.key === 'ArrowDown') {
        next = softDrop(stateRef.current);
        audio.sfx('move');
      } else if (e.key === 'ArrowUp' || e.key === 'x' || e.key === 'X') {
        next = rotateCw(stateRef.current);
        audio.sfx('rotate');
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        next = hardDrop(stateRef.current);
        audio.sfx('hardDrop');
      }
      if (next) {
        stateRef.current = next;
        setState(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [audio, setState]);

  const apply = (fn: (s: FallingState) => FallingState, sfx?: Parameters<typeof audio.sfx>[0]) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
    if (sfx) audio.sfx(sfx);
  };

  return (
    <section className="screen">
      <div className="stat-grid">
        <div className="stat-box">
          <div className="label">得点</div>
          <div className="value">{state.score}</div>
        </div>
        <div className="stat-box">
          <div className="label">消去行</div>
          <div className="value">{state.lines}</div>
        </div>
        <div className="stat-box">
          <div className="label">速度</div>
          <div className="value">{state.level + 1}</div>
        </div>
        <div className="stat-box">
          <div className="label">制限</div>
          <div className="value">{timeLimit}s</div>
        </div>
      </div>
      <NextPreview type={state.next} />
      <FallingBoardCanvas state={state} />
      {state.gameOver ? (
        <p className="hint">積んだ…居酒屋モードへ</p>
      ) : (
        <FallingControls
          onLeft={() => apply(moveLeft, 'move')}
          onRight={() => apply(moveRight, 'move')}
          onRotate={() => apply(rotateCw, 'rotate')}
          onSoft={() => apply(softDrop, 'move')}
          onHard={() => apply(hardDrop, 'hardDrop')}
        />
      )}
    </section>
  );
}

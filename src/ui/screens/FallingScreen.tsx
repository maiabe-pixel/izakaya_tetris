import { useEffect, useRef, useState } from 'react';
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

type FlashKind = 'score' | 'clear' | null;

export function FallingScreen({ state, setState, timeLimit }: Props) {
  const audio = useAudio();
  const { playTrack } = audio;
  const stateRef = useRef(state);
  stateRef.current = state;
  const prevStats = useRef({ score: state.score, lines: state.lines });
  const [flash, setFlash] = useState<FlashKind>(null);

  useEffect(() => {
    playTrack('falling');
  }, [playTrack]);

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

  // Light score / line-clear FX (visual only)
  useEffect(() => {
    const prev = prevStats.current;
    let kind: FlashKind = null;
    if (state.lines > prev.lines) kind = 'clear';
    else if (state.score > prev.score) kind = 'score';
    prevStats.current = { score: state.score, lines: state.lines };
    if (!kind) return;
    setFlash(kind);
    const t = window.setTimeout(() => setFlash(null), 520);
    return () => window.clearTimeout(t);
  }, [state.score, state.lines]);

  const apply = (
    fn: (s: FallingState) => FallingState,
    sfx?: Parameters<typeof audio.sfx>[0],
  ) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
    if (sfx) audio.sfx(sfx);
  };

  return (
    <section className="screen falling-screen">
      <div className="arcade-cabinet">
        <div className="arcade-marquee">
          <span className="eyebrow">ARCADE DROP</span>
          <span className="arcade-marquee-title">落下チャレンジ</span>
        </div>

        <div className="score-panel">
          <div className="stat-box">
            <div className="label">SCORE</div>
            <div className="value">{state.score}</div>
          </div>
          <div className="stat-box">
            <div className="label">LINES</div>
            <div className="value">{state.lines}</div>
          </div>
          <div className="stat-box">
            <div className="label">LV</div>
            <div className="value">{state.level + 1}</div>
          </div>
          <div className="stat-box">
            <div className="label">居酒屋</div>
            <div className="value">{timeLimit}s</div>
          </div>
        </div>

        <div className="arcade-stage">
          <NextPreview type={state.next} />
          <div
            className={`board-wrap arcade-bezel${flash ? ` fx-${flash}` : ''}${
              state.gameOver ? ' fx-go' : ''
            }`}
          >
            <FallingBoardCanvas state={state} />
            {flash === 'clear' ? (
              <div className="arcade-fx arcade-fx-clear" aria-hidden="true">
                CLEAR!
              </div>
            ) : null}
            {flash === 'score' ? (
              <div className="arcade-fx arcade-fx-score" aria-hidden="true">
                +SCORE
              </div>
            ) : null}
            {state.gameOver ? (
              <div className="arcade-go" role="status">
                <div className="arcade-go-label">GAME OVER</div>
                <div className="arcade-go-copy">ここからが、本番。</div>
              </div>
            ) : null}
          </div>
        </div>

        {state.gameOver ? (
          <p className="hint arcade-go-hint">ネオン横丁の居酒屋へ移動中…</p>
        ) : (
          <FallingControls
            onLeft={() => apply(moveLeft, 'move')}
            onRight={() => apply(moveRight, 'move')}
            onRotate={() => apply(rotateCw, 'rotate')}
            onSoft={() => apply(softDrop, 'move')}
            onHard={() => apply(hardDrop, 'hardDrop')}
          />
        )}
      </div>
    </section>
  );
}

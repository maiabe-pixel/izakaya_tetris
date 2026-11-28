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

function StatIcon({ kind }: { kind: 'score' | 'lines' | 'lv' | 'izakaya' }) {
  if (kind === 'score') {
    return (
      <svg className="fall-stat-ico" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M8 9V6.8A1.8 1.8 0 0 1 9.8 5h4.4A1.8 1.8 0 0 1 16 6.8V9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M7 9h10v2.2c0 2.6-1.9 4.8-4.4 5.3L12 20l-.6-3.5C8.9 16 7 13.8 7 11.2V9z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
    );
  }
  if (kind === 'lines') {
    return (
      <svg className="fall-stat-ico" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 7h12M6 12h12M6 17h8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === 'lv') {
    return (
      <svg className="fall-stat-ico" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 17h2.2V12H5V17zm4.2 0h2.2V9H9.2v8zm4.2 0h2.2V6.5h-2.2V17zm4.2 0H20V4.5h-2.4V17z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg className="fall-stat-ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 7.5v5l3.2 1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

  // Keep falling chrome inside the visible viewport (iOS Safari UI chrome).
  useEffect(() => {
    const root = document.documentElement;
    const syncVvh = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty('--fall-vvh', `${Math.round(h)}px`);
    };
    syncVvh();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', syncVvh);
    vv?.addEventListener('scroll', syncVvh);
    window.addEventListener('resize', syncVvh);
    window.addEventListener('orientationchange', syncVvh);
    return () => {
      vv?.removeEventListener('resize', syncVvh);
      vv?.removeEventListener('scroll', syncVvh);
      window.removeEventListener('resize', syncVvh);
      window.removeEventListener('orientationchange', syncVvh);
      root.style.removeProperty('--fall-vvh');
    };
  }, []);

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
    <section className="screen falling-screen falling-bg">
      <div className="falling-bg-stage">
        <img
          className="falling-bg-image"
          src="/images/drop-mode-bg-v2.png"
          alt=""
          draggable={false}
        />
        <div className="falling-bg-ui">
          <div className="arcade-cabinet">
            <div className="arcade-marquee">
              <span className="eyebrow fall-eyebrow">ARCADE DROP</span>
              <span className="arcade-marquee-title">落下チャレンジ</span>
            </div>

            <div className="score-panel fall-stat-grid">
              <div className="stat-box fall-stat is-score">
                <StatIcon kind="score" />
                <div className="label">SCORE</div>
                <div className="value">{state.score}</div>
              </div>
              <div className="stat-box fall-stat is-lines">
                <StatIcon kind="lines" />
                <div className="label">LINES</div>
                <div className="value">{state.lines}</div>
              </div>
              <div className="stat-box fall-stat is-lv">
                <StatIcon kind="lv" />
                <div className="label">LV</div>
                <div className="value">{state.level + 1}</div>
              </div>
              <div className="stat-box fall-stat is-izakaya">
                <StatIcon kind="izakaya" />
                <div className="label">居酒屋</div>
                <div className="value">{timeLimit}s</div>
              </div>
            </div>

            <div className="arcade-stage">
              <NextPreview type={state.next} />
              <div
                className={`arcade-bezel fall-board-frame${
                  flash ? ` fx-${flash}` : ''
                }${state.gameOver ? ' fx-go' : ''}`}
              >
                <FallingBoardCanvas state={state} />
                {flash === 'clear' ? (
                  <div
                    className="arcade-fx arcade-fx-clear"
                    aria-hidden="true"
                  >
                    CLEAR!
                  </div>
                ) : null}
                {flash === 'score' ? (
                  <div
                    className="arcade-fx arcade-fx-score"
                    aria-hidden="true"
                  >
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
              <p className="hint arcade-go-hint">
                ネオン横丁の居酒屋へ移動中…
              </p>
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
        </div>
      </div>
    </section>
  );
}

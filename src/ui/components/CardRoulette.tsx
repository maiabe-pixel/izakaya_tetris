import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildCardPool } from '../../game/izakaya/cards';
import type { Card } from '../../game/types';
import { NeonCardFace } from './NeonCardFace';

type Props = {
  result: Card;
  onDone: () => void;
  durationMs?: number;
};

function cardKey(c: Card, i: number): string {
  if (c.kind === 'mino') return `${c.kind}-${c.mino}-${i}`;
  return `${c.kind}-${i}`;
}

/**
 * Neon strip roulette — portaled to document.body so mobile overflow /
 * stacking contexts on .screen never hide it.
 */
export function CardRoulette({ result, onDone, durationMs = 2400 }: Props) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const strip = useMemo(() => {
    const base = buildCardPool();
    const many: Card[] = [];
    for (let i = 0; i < 4; i++) many.push(...base);
    many.push(result);
    many.push(...base.slice(0, 2));
    return { cards: many, landIndex: many.length - 1 - 2 };
  }, [result]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const cardEl = track.children[strip.landIndex] as HTMLElement | undefined;
    if (!cardEl) return;

    const target =
      cardEl.offsetLeft + cardEl.offsetWidth / 2 - wrap.clientWidth / 2;

    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
    void track.offsetWidth;
    track.style.transition = `transform ${durationMs}ms cubic-bezier(0.12, 0.75, 0.08, 1)`;
    track.style.transform = `translate3d(${-Math.max(0, target)}px,0,0)`;

    const landTimer = window.setTimeout(() => setLanded(true), durationMs + 40);
    const doneTimer = window.setTimeout(() => onDoneRef.current(), durationMs + 700);
    return () => {
      window.clearTimeout(landTimer);
      window.clearTimeout(doneTimer);
    };
  }, [strip.landIndex, durationMs]);

  const label =
    result.kind === 'mino'
      ? `${result.mino} カード`
      : result.kind === 'shapePick'
        ? 'エース（好きなミノ）'
        : 'ジョーカー（スカ）';

  const node = (
    <div className="roulette-overlay" role="dialog" aria-modal="true" aria-label="カード抽選">
      <div className="panel roulette-panel">
        <div className="eyebrow">NEON DRAW</div>
        <h2 className="roulette-title">カードを引く</h2>
        <div className="roulette-track-wrap" ref={wrapRef}>
          <div className="roulette-pointer" aria-hidden="true" />
          <div className="roulette-track" ref={trackRef}>
            {strip.cards.map((c, i) => (
              <div
                key={cardKey(c, i)}
                className={
                  landed && i === strip.landIndex ? 'roulette-slot is-winner' : 'roulette-slot'
                }
              >
                <NeonCardFace card={c} />
              </div>
            ))}
          </div>
        </div>
        <div className={`roulette-reveal${landed ? ' is-show' : ''}`} aria-live="polite">
          <NeonCardFace card={result} />
          <p className="roulette-result-label">{label}</p>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return node;
  return createPortal(node, document.body);
}

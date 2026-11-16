import { useEffect, useMemo, useState } from 'react';
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

export function CardRoulette({ result, onDone, durationMs = 2200 }: Props) {
  const strip = useMemo(() => {
    const base = buildCardPool();
    const many: Card[] = [];
    for (let i = 0; i < 8; i++) many.push(...base);
    // Ensure result near the end for a clean stop
    many.push(...base);
    many.push(result);
    return many;
  }, [result]);

  const [offset, setOffset] = useState(0);
  const cardW = 88;
  const gap = 8.8; // ~0.55rem
  const step = cardW + gap;

  useEffect(() => {
    const targetIndex = strip.length - 1;
    const centerPad = typeof window !== 'undefined' ? Math.min(420, window.innerWidth) / 2 - 20 : 180;
    const end = targetIndex * step - centerPad + cardW / 2;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setOffset(end * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 380);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [strip, step, durationMs, onDone]);

  return (
    <div className="roulette-overlay" role="dialog" aria-label="カード抽選">
      <div className="panel roulette-panel">
        <div className="eyebrow">NEON DRAW</div>
        <h2 style={{ margin: '0.35rem 0 0' }}>カードを引く</h2>
        <div className="roulette-track-wrap">
          <div className="roulette-pointer" />
          <div
            className="roulette-track"
            style={{ transform: `translateX(${-offset}px)` }}
          >
            {strip.map((c, i) => (
              <NeonCardFace key={cardKey(c, i)} card={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

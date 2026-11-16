import { useEffect, useRef } from 'react';
import { IZAKAYA_EXTRA_ROWS, MINO_COLORS } from '../../game/constants';
import { sameLanding } from '../../game/izakaya/landings';
import type { IzakayaState } from '../../game/izakaya/types';
import type { Landing } from '../../game/types';

type Props = {
  state: IzakayaState;
  maxWidth?: number;
  onTapCell?: (x: number, y: number) => void;
  onHoverCell?: (x: number, y: number) => void;
  onDragAim?: (x: number, y: number) => void;
  dragThreshold?: number;
};

function cellAt(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  w: number,
  h: number,
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - rect.left) / rect.width) * w);
  const y = Math.floor(((clientY - rect.top) / rect.height) * h);
  if (x < 0 || y < 0 || x >= w || y >= h) return null;
  return { x, y };
}

export function IzakayaBoardCanvas({
  state,
  maxWidth = 320,
  onTapCell,
  onHoverCell,
  onDragAim,
  dragThreshold = 12,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{
    x0: number;
    y0: number;
    moved: boolean;
    last: { x: number; y: number } | null;
  } | null>(null);

  const w = state.board[0]?.length ?? 10;
  const h = state.board.length;
  const cell = Math.floor(Math.min(maxWidth / w, 22));

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const board = state.board;
    ctx.clearRect(0, 0, w * cell, h * cell);
    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, 0, w * cell, h * cell);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(x * cell, y * cell, cell, cell);
        const c = board[y][x];
        if (c) {
          ctx.fillStyle = MINO_COLORS[c] ?? '#fff';
          ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
        }
      }
    }

    // Divider between extra rows and original falling zone
    const divY = IZAKAYA_EXTRA_ROWS * cell;
    ctx.strokeStyle = 'rgba(255, 80, 180, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, divY);
    ctx.lineTo(w * cell, divY);
    ctx.stroke();
    ctx.lineWidth = 1;

    if (state.phase === 'placing') {
      const paint = (landing: Landing, strong: boolean) => {
        ctx.globalAlpha = strong ? 0.55 : 0.28;
        ctx.fillStyle = strong ? '#ffe566' : '#3de7ff';
        ctx.strokeStyle = strong ? '#ffe566' : 'rgba(61,231,255,0.7)';
        for (const p of landing.cells) {
          ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
          ctx.strokeRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
        }
        ctx.globalAlpha = 1;
      };
      for (const l of state.landings) {
        const strong = sameLanding(l, state.aim);
        if (!strong) paint(l, false);
      }
      if (state.aim) paint(state.aim, true);
    }
  }, [state, cell, w, h]);

  return (
    <div className="board-wrap">
      <canvas
        ref={ref}
        width={w * cell}
        height={h * cell}
        onPointerMove={(e) => {
          if (state.phase !== 'placing') return;
          const canvas = ref.current;
          if (!canvas) return;
          if (e.pointerType === 'mouse') {
            const pos = cellAt(canvas, e.clientX, e.clientY, w, h);
            if (pos) onHoverCell?.(pos.x, pos.y);
          } else if (drag.current) {
            const dx = Math.abs(e.clientX - drag.current.x0);
            if (dx >= dragThreshold) {
              drag.current.moved = true;
              const pos = cellAt(canvas, e.clientX, e.clientY, w, h);
              if (pos) {
                drag.current.last = pos;
                onDragAim?.(pos.x, pos.y);
              }
            }
          }
        }}
        onPointerDown={(e) => {
          if (state.phase !== 'placing') return;
          const canvas = ref.current;
          if (!canvas) return;
          canvas.setPointerCapture(e.pointerId);
          drag.current = {
            x0: e.clientX,
            y0: e.clientY,
            moved: false,
            last: cellAt(canvas, e.clientX, e.clientY, w, h),
          };
        }}
        onPointerUp={(e) => {
          if (state.phase !== 'placing') return;
          const canvas = ref.current;
          const d = drag.current;
          drag.current = null;
          if (!canvas || !d) return;
          if (d.moved) return; // aim only
          const pos =
            d.last ?? cellAt(canvas, e.clientX, e.clientY, w, h);
          if (pos) onTapCell?.(pos.x, pos.y);
        }}
      />
    </div>
  );
}

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
    ctx.fillStyle = '#080810';
    ctx.fillRect(0, 0, w * cell, h * cell);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.045)';
        ctx.strokeRect(x * cell, y * cell, cell, cell);
        const c = board[y][x];
        if (c) {
          const base = MINO_COLORS[c] ?? '#fff';
          const pad = Math.max(1, Math.floor(cell * 0.08));
          const bx = x * cell + pad;
          const by = y * cell + pad;
          const bw = cell - pad * 2;
          const bh = cell - pad * 2;
          const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.18, base);
          grad.addColorStop(0.72, base);
          grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.92;
          ctx.fillRect(bx, by, bw, bh);
          ctx.globalAlpha = 1;
          // Soft outer neon edge (visual only)
          ctx.strokeStyle = base;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          ctx.globalAlpha = 1;
          // Highlight core
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillRect(bx + 1, by + 1, Math.max(1, bw * 0.35), Math.max(1, bh * 0.22));
        }
      }
    }

    // Divider between extra rows and original falling zone
    const divY = IZAKAYA_EXTRA_ROWS * cell;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 22, 132, 0.95)';
    ctx.shadowColor = 'rgba(255, 22, 132, 0.85)';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, divY);
    ctx.lineTo(w * cell, divY);
    ctx.stroke();
    ctx.restore();

    if (state.phase === 'placing') {
      const paint = (landing: Landing, strong: boolean) => {
        ctx.globalAlpha = strong ? 0.55 : 0.28;
        ctx.fillStyle = strong ? '#FFAD32' : '#29DFF2';
        ctx.strokeStyle = strong ? '#FFAD32' : 'rgba(41,223,242,0.75)';
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

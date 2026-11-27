import { useEffect, useRef } from 'react';
import { MINO_COLORS } from '../../game/constants';
import {
  activeCells,
  ghostY,
  type FallingPiece,
  type FallingState,
} from '../../game/falling/engine';
import type { Board } from '../../game/types';

type Props = {
  state: FallingState;
  maxWidth?: number;
};

function paintCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
  color: string,
  alpha = 1,
) {
  const pad = Math.max(1, Math.floor(cell * 0.08));
  const bx = x * cell + pad;
  const by = y * cell + pad;
  const bw = cell - pad * 2;
  const bh = cell - pad * 2;
  const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.18, color);
  grad.addColorStop(0.72, color);
  grad.addColorStop(1, '#000000');
  ctx.globalAlpha = alpha * 0.92;
  ctx.fillStyle = grad;
  ctx.fillRect(bx, by, bw, bh);
  ctx.globalAlpha = alpha * 0.35;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(bx + 1, by + 1, Math.max(1, bw * 0.35), Math.max(1, bh * 0.22));
  ctx.globalAlpha = 1;
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  board: Board,
  active: FallingPiece | null,
  cell: number,
) {
  const h = board.length;
  const w = board[0]?.length ?? 10;
  ctx.clearRect(0, 0, w * cell, h * cell);
  // Near-black navy fill
  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, w * cell, h * cell);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
      const c = board[y][x];
      if (c) {
        paintCell(ctx, x, y, cell, MINO_COLORS[c] ?? '#fff', 1);
      }
    }
  }

  if (active) {
    const gy = ghostY(board, active);
    const ghost = activeCells({ ...active, y: gy });
    const color = MINO_COLORS[active.type] ?? '#fff';
    for (const p of ghost) {
      if (p.y < 0) continue;
      paintCell(ctx, p.x, p.y, cell, color, 0.28);
    }
    const cells = activeCells(active);
    for (const p of cells) {
      if (p.y < 0) continue;
      paintCell(ctx, p.x, p.y, cell, color, 1);
    }
  }
}

export function FallingBoardCanvas({ state, maxWidth = 320 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const w = state.board[0]?.length ?? 10;
  const h = state.board.length;
  const cell = Math.floor(Math.min(maxWidth / w, 28));

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBoard(ctx, state.board, state.active, cell);
  }, [state, cell]);

  return (
    <div className="board-wrap">
      <canvas ref={ref} width={w * cell} height={h * cell} />
    </div>
  );
}

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

function drawBoard(
  ctx: CanvasRenderingContext2D,
  board: Board,
  active: FallingPiece | null,
  cell: number,
) {
  const h = board.length;
  const w = board[0]?.length ?? 10;
  ctx.clearRect(0, 0, w * cell, h * cell);
  ctx.fillStyle = '#10121b';
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

  if (active) {
    const gy = ghostY(board, active);
    const ghost = activeCells({ ...active, y: gy });
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = MINO_COLORS[active.type];
    for (const p of ghost) {
      if (p.y < 0) continue;
      ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
    }
    ctx.globalAlpha = 1;
    const cells = activeCells(active);
    ctx.fillStyle = MINO_COLORS[active.type];
    for (const p of cells) {
      if (p.y < 0) continue;
      ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
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

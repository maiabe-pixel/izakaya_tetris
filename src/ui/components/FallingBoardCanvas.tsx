import { useEffect, useRef, useState } from 'react';
import { BOARD_W, FALLING_H, MINO_COLORS } from '../../game/constants';
import {
  activeCells,
  ghostY,
  type FallingPiece,
  type FallingState,
} from '../../game/falling/engine';
import type { Board } from '../../game/types';

type Props = {
  state: FallingState;
};

/** Visible gap reserved below the neon board frame before the control row. */
const BOARD_CLEARANCE_PX = 28;
/** Neon host border + padding around the canvas (both axes). */
const HOST_CHROME_PX = 10;

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
  const w = board[0]?.length ?? BOARD_W;
  ctx.clearRect(0, 0, w * cell, h * cell);
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

/**
 * cellSize = floor(min(availW/10, availH/20)) so the full 10×20 stays
 * visible with square cells. availH is clamped to space above controls.
 */
export function FallingBoardCanvas({ state }: Props) {
  const budgetRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cols = state.board[0]?.length ?? BOARD_W;
  const rows = state.board.length || FALLING_H;
  const [cell, setCell] = useState(12);

  useEffect(() => {
    const budget = budgetRef.current;
    if (!budget) return;

    const measure = () => {
      const rect = budget.getBoundingClientRect();
      // Exclude control row from height budget; reserve clearance + neon chrome.
      const pad = document.querySelector('.falling-screen .fall-pad');
      let rawH = Math.max(0, rect.height);
      if (pad) {
        const padTop = pad.getBoundingClientRect().top;
        rawH = Math.max(0, Math.min(rawH, padTop - rect.top));
      }
      const availW = Math.max(0, rect.width - HOST_CHROME_PX);
      const availH = Math.max(
        0,
        rawH - BOARD_CLEARANCE_PX - HOST_CHROME_PX,
      );
      if (availW < 2 || availH < 2) return;
      const next = Math.max(
        4,
        Math.floor(Math.min(availW / cols, availH / rows)),
      );
      setCell((prev) => (prev === next ? prev : next));
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(budget);
    const pad = document.querySelector('.falling-screen .fall-pad');
    if (pad) ro.observe(pad);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', measure);
    vv?.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      ro.disconnect();
      vv?.removeEventListener('resize', measure);
      vv?.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [cols, rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssW = cols * cell;
    const cssH = rows * cell;
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBoard(ctx, state.board, state.active, cell);
  }, [state, cell, cols, rows]);

  return (
    <div className="fall-board-budget" ref={budgetRef}>
      <div className="board-wrap fall-board-host">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

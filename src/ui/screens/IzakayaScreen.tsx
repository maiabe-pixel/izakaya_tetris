import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '../../audio/useAudio';
import { DRAG_AIM_THRESHOLD_PX } from '../../game/constants';
import { ALL_MINOS } from '../../game/falling/minos';
import { drawCard } from '../../game/izakaya/cards';
import {
  draw,
  drawCost,
  pickShape,
  placeAtTap,
  recordOrder,
  rotatePlacing,
  setAim,
  tickTimer,
  toggleExclude,
  undoPlace,
} from '../../game/izakaya/engine';
import {
  landingContainingCell,
  landingInColumn,
  nearestToCenter,
} from '../../game/izakaya/landings';
import type { IzakayaState } from '../../game/izakaya/types';
import type { Card, MinoType } from '../../game/types';
import { CardRoulette } from '../components/CardRoulette';
import { IzakayaBoardCanvas } from '../components/IzakayaBoardCanvas';
import { MinoGlyph } from '../components/MinoGlyph';

type Props = {
  state: IzakayaState;
  setState: (s: IzakayaState) => void;
  onResetIzakaya: () => void;
  onRestartFalling: () => void;
  onTitleClear: () => void;
};

const EXCLUDE_TOP: MinoType[] = ['I', 'O', 'T', 'S'];
const EXCLUDE_BOT: MinoType[] = ['Z', 'J', 'L'];

/** Lucide-style thick stroke icons (stroke 2.5–3). Display-only. */
function StatIcon({ kind }: { kind: 'res' | 'order' | 'use' | 'time' }) {
  if (kind === 'res') {
    /* Stock: stacked squares (gold) */
    return (
      <svg
        className="stat-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3.5"
          y="9.5"
          width="11"
          height="11"
          rx="1.8"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <rect
          x="9.5"
          y="3.5"
          width="11"
          height="11"
          rx="1.8"
          stroke="currentColor"
          strokeWidth="2.75"
        />
      </svg>
    );
  }
  if (kind === 'order') {
    /* Order: clipboard (pink) */
    return (
      <svg
        className="stat-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="4.5"
          width="14"
          height="16.5"
          rx="2"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <path
          d="M9 4.5h6v2.2a1.2 1.2 0 0 1-1.2 1.2h-3.6A1.2 1.2 0 0 1 9 6.7V4.5z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 12h7M8.5 16h5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === 'use') {
    /* Used: beer mug (gold) */
    return (
      <svg
        className="stat-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6.5 8.5h9.5l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8.5z"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinejoin="round"
        />
        <path
          d="M16 10.5h2.4a2.2 2.2 0 0 1 2.2 2.2v2.6a2.2 2.2 0 0 1-2.2 2.2H15.8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 8.5c0-2.4 1.9-4.2 4.2-4.2S16.4 6.1 16.4 8.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  /* Remaining: stacked cards (pink) */
  return (
    <svg
      className="stat-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="6.5"
        width="11"
        height="14"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="2.75"
      />
      <rect
        x="9.5"
        y="3.5"
        width="11"
        height="14"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="2.75"
      />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg
      className="order-head-ico"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 3.5h10v17l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3.5z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.5h4M10 12h4M10 15.5h3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MealIcon() {
  /* Fork + knife */
  return (
    <svg
      className="order-btn-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3.5v6.2c0 1.4.9 2.3 2 2.3h0V20.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 3.5v4M7 3.5v4M9 3.5v4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 3.5 18 9.2V20.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9.2h5.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BeerIcon() {
  return (
    <svg
      className="order-btn-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 8.5h9.5l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8.5z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 10.5h2.4a2.2 2.2 0 0 1 2.2 2.2v2.6a2.2 2.2 0 0 1-2.2 2.2H15.8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M8 8.5c0-2.4 1.9-4.2 4.2-4.2S16.4 6.1 16.4 8.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg
      className="draw-cta-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="izkFateCardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7ab8" />
          <stop offset="100%" stopColor="#ff1684" />
        </linearGradient>
      </defs>
      <rect
        x="3.5"
        y="6.5"
        width="11"
        height="14"
        rx="1.6"
        fill="url(#izkFateCardGrad)"
        stroke="#fff"
        strokeWidth="2.5"
        opacity="0.92"
      />
      <rect
        x="9.5"
        y="3.5"
        width="11"
        height="14"
        rx="1.6"
        fill="url(#izkFateCardGrad)"
        stroke="#fff"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function RewindIcon() {
  /* Undo arrow */
  return (
    <svg
      className="undo-cta-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 7.5 5.5 11.5 9.5 15.5"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 11.5H14a5 5 0 0 1 0 10H11"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg
      className="izk-menu-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 9.5 5.6 4.8h12.8L20 9.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9.5h16v10.2H4z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 19.7v-5.2h5v5.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      className="izk-menu-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19.2 12a7.2 7.2 0 1 1-2.1-5.1"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M19.5 4.8v4.4h-4.4"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      className="izk-menu-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 11.2 12 4.8l7.5 6.4"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.8V19h10v-8.2"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IzakayaScreen({
  state,
  setState,
  onResetIzakaya,
  onRestartFalling,
  onTitleClear,
}: Props) {
  const audio = useAudio();
  const { playTrack, unlock, sfx } = audio;
  const [name, setName] = useState('');
  const [roulette, setRoulette] = useState<Card | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const prevPhase = useRef(state.phase);
  const rouletteCardRef = useRef<Card | null>(null);

  useEffect(() => {
    unlock();
    playTrack('izakaya');
  }, [playTrack, unlock]);

  useEffect(() => {
    const kick = () => {
      unlock();
      playTrack('izakaya');
    };
    window.addEventListener('pointerdown', kick, { once: true });
    window.addEventListener('touchstart', kick, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('touchstart', kick);
    };
  }, [playTrack, unlock]);

  useEffect(() => {
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      const s = stateRef.current;
      if (s.phase === 'placing' && !s.cleared) {
        const next = tickTimer(s, dt);
        if (next !== s) {
          if (
            prevPhase.current === 'placing' &&
            next.phase === 'idle' &&
            !next.cleared &&
            next.stats.usedCount > s.stats.usedCount
          ) {
            sfx('timeoutPlace');
          }
          if (next.cleared) sfx('clear');
          stateRef.current = next;
          setState(next);
        }
      }
      prevPhase.current = stateRef.current.phase;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sfx, setState]);

  const cost = useMemo(() => drawCost(state.excluded), [state.excluded]);
  const canDraw =
    state.phase === 'idle' &&
    !state.cleared &&
    state.resources >= cost &&
    !roulette;
  const canUndo = state.phase === 'idle' && !!state.undo && !state.cleared;
  const nameOk = name.trim().length > 0;
  const timerWarn =
    state.phase === 'placing' && !state.cleared && state.remainingMs < 3000;
  const remainingSec = Math.ceil(state.remainingMs / 1000);
  const placing = state.phase === 'placing' && !state.cleared;

  const aimFromCell = (s: IzakayaState, x: number, y: number) => {
    const hit =
      landingContainingCell(s.landings, x, y) ??
      landingInColumn(s.landings, x) ??
      nearestToCenter(s.landings);
    return setAim(s, hit);
  };

  const beginRoulette = () => {
    if (!canDraw) return;
    unlock();
    playTrack('izakaya');
    sfx('cardDraw');
    const card = drawCard(state.excluded);
    rouletteCardRef.current = card;
    setRoulette(card);
  };

  const finishRoulette = useCallback(() => {
    const card = rouletteCardRef.current;
    if (!card) return;
    rouletteCardRef.current = null;
    setRoulette(null);
    const next = draw(stateRef.current, Math.random, card);
    stateRef.current = next;
    setState(next);
    if (card.kind === 'empty') sfx('emptyCard');
    else sfx('cardDecide');
  }, [setState, sfx]);

  const submitOrder = (kind: 'food' | 'drink') => {
    if (!nameOk) return;
    unlock();
    playTrack('izakaya');
    const next = recordOrder(stateRef.current, kind, name);
    stateRef.current = next;
    setState(next);
    setName('');
    sfx('order');
  };

  const renderExcludeCard = (m: MinoType) => (
    <button
      key={m}
      type="button"
      className={`mino-shape-card izk-exclude-card is-${m.toLowerCase()}${
        state.excluded.includes(m) ? ' is-on' : ''
      }`}
      onClick={() => {
        const next = toggleExclude(stateRef.current, m);
        stateRef.current = next;
        setState(next);
      }}
    >
      <MinoGlyph type={m} size={9} />
      <span>{m}</span>
    </button>
  );

  return (
    <section
      className={`screen izakaya-screen izakaya-bg${
        placing ? ' is-placing' : ''
      }${timerWarn ? ' timer-warn' : ''}`}
    >
      {roulette ? (
        <CardRoulette
          result={roulette}
          onDone={finishRoulette}
          durationMs={1400}
        />
      ) : null}

      <div className="izakaya-bg-stage">
        <div className="izakaya-bg-frame">
          <img
            className="izakaya-bg-image"
            src="/images/izakaya-background.png"
            alt=""
            draggable={false}
          />

          <div className="izakaya-bg-ui">
            <div className="izakaya-hud">
              <div className="stat-grid izk-stat-grid">
                <div className="stat-box izk-stat is-res">
                  <StatIcon kind="res" />
                  <div className="label">ストック</div>
                  <div className="value">{state.resources}</div>
                </div>
                <div className="stat-box izk-stat is-order">
                  <StatIcon kind="order" />
                  <div className="label">注文</div>
                  <div className="value">
                    {state.stats.foodCount + state.stats.drinkCount}
                  </div>
                </div>
                <div className="stat-box izk-stat is-use">
                  <StatIcon kind="use" />
                  <div className="label">使用</div>
                  <div className="value">{state.stats.usedCount}</div>
                </div>
                <div
                  className={`stat-box izk-stat is-remain${
                    timerWarn ? ' is-urgent' : ''
                  }`}
                >
                  <StatIcon kind="time" />
                  <div className="label">残り</div>
                  <div className={`value${timerWarn ? ' timer-urgent' : ''}`}>
                    {placing ? remainingSec : '—'}
                  </div>
                </div>
              </div>
            </div>

            {state.cleared ? (
              <div className="clear-banner">最下段クリア！</div>
            ) : null}
            {state.message ? (
              <p className="hint izakaya-msg">{state.message}</p>
            ) : null}

            <div className="izakaya-body">
              <div className="izakaya-main">
                <div className="izakaya-playfield">
                  <div className="izakaya-board-frame neon-board-frame">
                    <IzakayaBoardCanvas
                      state={state}
                      maxWidth={placing ? 300 : 188}
                      dragThreshold={DRAG_AIM_THRESHOLD_PX}
                      onTapCell={(x, y) => {
                        const before = stateRef.current;
                        const next = placeAtTap(before, x, y);
                        stateRef.current = next;
                        setState(next);
                        if (next.cleared) sfx('clear');
                        else if (next.stats.usedCount > before.stats.usedCount)
                          sfx('hardDrop');
                      }}
                      onHoverCell={(x, y) => {
                        const next = aimFromCell(stateRef.current, x, y);
                        stateRef.current = next;
                        setState(next);
                      }}
                      onDragAim={(x, y) => {
                        const next = aimFromCell(stateRef.current, x, y);
                        stateRef.current = next;
                        setState(next);
                      }}
                    />
                  </div>

                  {placing ? (
                    <div className="izakaya-place-bar">
                      <div
                        className={`neon-timer${timerWarn ? ' is-warn' : ''}`}
                      >
                        <span className="neon-timer-label">TIME</span>
                        <span className="neon-timer-value">{remainingSec}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary place-rotate"
                        onClick={() => {
                          const next = rotatePlacing(stateRef.current);
                          stateRef.current = next;
                          setState(next);
                          sfx('rotate');
                        }}
                      >
                        回転
                      </button>
                    </div>
                  ) : null}
                </div>

                {state.phase === 'idle' && !state.cleared ? (
                  <div className="izakaya-side">
                    <div className="order-slip izk-order-panel">
                      <div className="order-slip-head">
                        <ReceiptIcon />
                        <span>本日のご注文</span>
                      </div>
                      <div className="order-slip-body">
                        <input
                          className="field order-slip-field"
                          placeholder="例）枝豆 / ハイボール"
                          aria-label="注文の名前（必須）"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <p
                          className={`hint order-name-hint${
                            nameOk ? ' is-ok' : ''
                          }`}
                        >
                          名前を入れてから伝票を切ってください
                        </p>
                        <div className="row izk-order-btns">
                          <button
                            type="button"
                            className="btn order-food"
                            disabled={!nameOk}
                            onClick={() => submitOrder('food')}
                          >
                            <MealIcon />
                            <span>食べた！</span>
                          </button>
                          <button
                            type="button"
                            className="btn order-drink"
                            disabled={!nameOk}
                            onClick={() => submitOrder('drink')}
                          >
                            <BeerIcon />
                            <span>飲んだ！</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="izk-exclude" aria-label="除外ミノ">
                      <p className="izk-exclude-label">
                        除外（消費 {cost}）・カードは常に 10 枚から
                      </p>
                      <div className="mino-card-grid izk-exclude-row">
                        {EXCLUDE_TOP.map(renderExcludeCard)}
                      </div>
                      <div className="mino-card-grid izk-exclude-row is-three">
                        {EXCLUDE_BOT.map(renderExcludeCard)}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {state.phase === 'pickingShape' ? (
                <div className="stack shape-pick-panel">
                  <p className="hint">エース — 好きなミノを選んでください</p>
                  <div className="mino-card-grid">
                    {ALL_MINOS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className="mino-shape-card"
                        onClick={() => {
                          const next = pickShape(stateRef.current, m);
                          stateRef.current = next;
                          setState(next);
                          sfx('cardDecide');
                        }}
                      >
                        <MinoGlyph type={m} />
                        <span>{m}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {state.phase === 'idle' && !state.cleared ? (
                <div className="izakaya-idle">
                  <div className="row izakaya-actions">
                    <button
                      type="button"
                      className="btn btn-primary draw-cta"
                      disabled={!canDraw}
                      onClick={beginRoulette}
                    >
                      <CardsIcon />
                      <span>運命の一枚を引く！({cost})</span>
                    </button>
                    <button
                      type="button"
                      className="btn undo-cta"
                      disabled={!canUndo}
                      onClick={() => {
                        const next = undoPlace(stateRef.current);
                        stateRef.current = next;
                        setState(next);
                      }}
                    >
                      <RewindIcon />
                      <span>今のナシ！</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {state.orders.length > 0 && !placing ? (
                <details
                  className="order-history-fold"
                  open={historyOpen}
                  onToggle={(e) =>
                    setHistoryOpen((e.target as HTMLDetailsElement).open)
                  }
                >
                  <summary>注文履歴（{state.orders.length}）</summary>
                  <ul className="order-list">
                    {state.orders.map((o, i) => (
                      <li key={`${o.at}-${i}`}>
                        {o.kind === 'food' ? '食' : '飲'} — {o.name}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {!placing ? (
                <div className="stack izakaya-menu-actions">
                  <button
                    type="button"
                    className="btn izk-menu-btn"
                    onClick={onResetIzakaya}
                  >
                    <StoreIcon />
                    <span>居酒屋だけやり直す</span>
                  </button>
                  <button
                    type="button"
                    className="btn izk-menu-btn"
                    onClick={onRestartFalling}
                  >
                    <ResetIcon />
                    <span>落下からやり直す</span>
                  </button>
                  <button
                    type="button"
                    className="btn izk-menu-btn"
                    onClick={onTitleClear}
                  >
                    <HomeIcon />
                    <span>タイトルへ（保存削除）</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

  return (
    <section
      className={`screen izakaya-screen${placing ? ' is-placing' : ''}${
        timerWarn ? ' timer-warn' : ''
      }`}
    >
      {roulette ? (
        <CardRoulette
          result={roulette}
          onDone={finishRoulette}
          durationMs={1400}
        />
      ) : null}

      <div className="izakaya-hud">
        <div className="stat-grid">
          <div className="stat-box">
            <div className="label">資源</div>
            <div className="value">{state.resources}</div>
          </div>
          <div className="stat-box">
            <div className="label">注文</div>
            <div className="value">
              {state.stats.foodCount + state.stats.drinkCount}
            </div>
          </div>
          <div className="stat-box">
            <div className="label">使用</div>
            <div className="value">{state.stats.usedCount}</div>
          </div>
          <div className={`stat-box${timerWarn ? ' is-urgent' : ''}`}>
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
      {state.message ? <p className="hint izakaya-msg">{state.message}</p> : null}

      <div className="izakaya-playfield">
        <div className="board-wrap neon-board-frame">
          <IzakayaBoardCanvas
            state={state}
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
            <div className={`neon-timer${timerWarn ? ' is-warn' : ''}`}>
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
          <div className="order-slip">
            <div className="order-slip-head">本日のご注文</div>
            <input
              className="field order-slip-field"
              placeholder="例）枝豆 / ハイボール"
              aria-label="注文の名前（必須）"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {!nameOk ? (
              <p className="hint">名前を入れてから伝票を切ってください</p>
            ) : null}
            <div className="row">
              <button
                type="button"
                className="btn order-food"
                disabled={!nameOk}
                onClick={() => submitOrder('food')}
              >
                食べた！
              </button>
              <button
                type="button"
                className="btn order-drink"
                disabled={!nameOk}
                onClick={() => submitOrder('drink')}
              >
                飲んだ！
              </button>
            </div>
          </div>

          <p className="hint">除外（消費 {cost}）・カードは常に 10 枚から</p>
          <div className="mino-card-grid">
            {ALL_MINOS.map((m: MinoType) => (
              <button
                key={m}
                type="button"
                className={`mino-shape-card${
                  state.excluded.includes(m) ? ' is-on' : ''
                }`}
                onClick={() => {
                  const next = toggleExclude(stateRef.current, m);
                  stateRef.current = next;
                  setState(next);
                }}
              >
                <MinoGlyph type={m} />
                <span>{m}</span>
              </button>
            ))}
          </div>

          <div className="row izakaya-actions">
            <button
              type="button"
              className="btn btn-primary draw-cta"
              disabled={!canDraw}
              onClick={beginRoulette}
            >
              運命の一枚を引く！ ({cost})
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
              今のナシ！
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
          <button type="button" className="btn" onClick={onResetIzakaya}>
            居酒屋だけやり直す
          </button>
          <button type="button" className="btn" onClick={onRestartFalling}>
            落下からやり直す
          </button>
          <button type="button" className="btn" onClick={onTitleClear}>
            タイトルへ（保存削除）
          </button>
        </div>
      ) : null}
    </section>
  );
}

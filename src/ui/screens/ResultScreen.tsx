import type { IzakayaStats } from '../../game/izakaya/types';
import type { OrderEntry } from '../../game/types';
import { TitleLogo } from '../TitleLogo';

type Props = {
  stats: IzakayaStats;
  orders: OrderEntry[];
  onTitle: () => void;
};

export function ResultScreen({ stats, orders, onTitle }: Props) {
  const orderCount = stats.foodCount + stats.drinkCount;
  const elapsedMin = Math.max(
    1,
    Math.round(((stats.clearedAt ?? Date.now()) - stats.startedAt) / 60000),
  );
  return (
    <section className="screen panel" style={{ padding: '1.1rem' }}>
      <TitleLogo compact tagline="" />
      <h2 className="clear-banner" style={{ margin: 0 }}>
        CLEAR
      </h2>
      <p className="hint">最下段を消してクリアしました</p>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="label">注文</div>
          <div className="value">{orderCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">食</div>
          <div className="value">{stats.foodCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">飲</div>
          <div className="value">{stats.drinkCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">使用</div>
          <div className="value">{stats.usedCount}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="label">抽選</div>
          <div className="value">{stats.drawCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">エース</div>
          <div className="value">{stats.shapePickCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">ジョーカー</div>
          <div className="value">{stats.emptyCardCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">経過</div>
          <div className="value">{elapsedMin}分</div>
        </div>
      </div>
      {orders.length > 0 ? (
        <div>
          <p className="hint">注文履歴</p>
          <ul className="order-list">
            {orders.map((o, i) => (
              <li key={`${o.at}-${i}`}>
                {o.kind === 'food' ? '食' : '飲'} — {o.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button type="button" className="btn btn-primary" onClick={onTitle}>
        タイトルへ
      </button>
    </section>
  );
}

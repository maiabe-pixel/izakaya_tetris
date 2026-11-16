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
  const foodNames = orders.filter((o) => o.kind === 'food').map((o) => o.name);
  const drinkNames = orders.filter((o) => o.kind === 'drink').map((o) => o.name);

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
          <div className="label">特殊</div>
          <div className="value">{stats.shapePickCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">無効</div>
          <div className="value">{stats.emptyCardCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">経過</div>
          <div className="value">{elapsedMin}分</div>
        </div>
      </div>
      {foodNames.length > 0 ? (
        <div>
          <p className="hint">食の名前</p>
          <ul className="order-list">
            {foodNames.map((n, i) => (
              <li key={`f-${i}`}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {drinkNames.length > 0 ? (
        <div>
          <p className="hint">飲の名前</p>
          <ul className="order-list">
            {drinkNames.map((n, i) => (
              <li key={`d-${i}`}>{n}</li>
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

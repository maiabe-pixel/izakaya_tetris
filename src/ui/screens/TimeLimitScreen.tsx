import {
  DEFAULT_TIME_LIMIT,
  TIME_LIMIT_OPTIONS,
  type TimeLimitSeconds,
} from '../../game/constants';
import { TitleLogo } from '../TitleLogo';

type Props = {
  value: TimeLimitSeconds;
  onChange: (v: TimeLimitSeconds) => void;
  onBack: () => void;
  onConfirm: () => void;
};

export function TimeLimitScreen({
  value = DEFAULT_TIME_LIMIT,
  onChange,
  onBack,
  onConfirm,
}: Props) {
  return (
    <section className="screen panel" style={{ padding: '1.1rem' }}>
      <TitleLogo compact tagline="" />
      <h2 style={{ margin: 0, textAlign: 'center' }}>配置の制限時間</h2>
      <p className="hint">
        居酒屋モードでミノを置くときの秒数です。初期値は7秒です。
      </p>
      <div className="stack">
        {TIME_LIMIT_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="btn"
            style={{
              borderColor: value === s ? 'var(--magenta)' : undefined,
              boxShadow: value === s ? 'var(--glow-pink)' : undefined,
            }}
            onClick={() => onChange(s)}
          >
            {s}秒
          </button>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn" onClick={onBack}>
          戻る
        </button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>
          決定して落下へ
        </button>
      </div>
    </section>
  );
}

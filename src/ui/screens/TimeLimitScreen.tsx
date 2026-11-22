import {
  DEFAULT_TIME_LIMIT,
  TIME_LIMIT_OPTIONS,
  type TimeLimitSeconds,
} from '../../game/constants';
import { NeonAlleyDecor } from '../components/NeonAlleyDecor';
import { TitleLogo } from '../TitleLogo';

type Props = {
  value: TimeLimitSeconds;
  onChange: (v: TimeLimitSeconds) => void;
  onBack: () => void;
  onConfirm: () => void;
};

const CATCHPHRASES: Record<TimeLimitSeconds, string> = {
  3: '即決の鬼',
  5: 'せっかちさん',
  7: 'いつもの一杯',
  10: 'ちょっと考える',
  15: '慎重派',
};

export function TimeLimitScreen({
  value = DEFAULT_TIME_LIMIT,
  onChange,
  onBack,
  onConfirm,
}: Props) {
  return (
    <section className="screen panel playstyle-screen">
      <NeonAlleyDecor />
      <TitleLogo compact tagline="" />
      <h2>本日の遊び方</h2>
      <p className="hint">
        居酒屋でミノを置くときの制限時間です。お好みの一杯を選んでください（初期は
        {DEFAULT_TIME_LIMIT}秒）。
      </p>
      <div className="menu-tag-list" role="listbox" aria-label="制限時間">
        {TIME_LIMIT_OPTIONS.map((s) => {
          const selected = value === s;
          return (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={selected}
              className={`menu-tag${selected ? ' is-selected' : ''}`}
              onClick={() => onChange(s)}
            >
              <span className="sec">{s}秒</span>
              <span className="catch">{CATCHPHRASES[s]}</span>
              {s === DEFAULT_TIME_LIMIT ? (
                <span className="tag-chip">おすすめ</span>
              ) : (
                <span className="tag-chip">メニュー</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="row">
        <button type="button" className="btn" onClick={onBack}>
          戻る
        </button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>
          これでいく！
        </button>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useAudio } from '../../audio/useAudio';
import { NeonAlleyDecor } from '../components/NeonAlleyDecor';
import { TitleLogo } from '../TitleLogo';

type Props = {
  hasSave: boolean;
  onStart: () => void;
  onContinue: () => void;
  onClearSave: () => void;
};

function GearIcon() {
  return (
    <svg className="gear-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.24l2.39-.96c.5.39 1.04.7 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96c.25.1.54 0 .68-.24l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.56zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
      />
    </svg>
  );
}

export function TitleScreen({
  hasSave,
  onStart,
  onContinue,
  onClearSave,
}: Props) {
  const audio = useAudio();
  const { stopTrack } = audio;
  const [gearOpen, setGearOpen] = useState(false);

  // Title stays quiet until falling/izakaya starts a track.
  useEffect(() => {
    stopTrack();
  }, [stopTrack]);

  return (
    <section className="screen panel title-screen">
      <NeonAlleyDecor />
      <TitleLogo sign />

      <div className="title-fill">
        <span className="alley-tag">OPEN · NEON YOKOCHO</span>
      </div>

      <div className="title-cta-block">
        <button type="button" className="btn btn-primary" onClick={onStart}>
          いざ、開店！
        </button>
        {hasSave ? (
          <button type="button" className="btn" onClick={onContinue}>
            続きから (居酒屋)
          </button>
        ) : null}

        <div className={`gear-panel${gearOpen ? ' is-open' : ''}`}>
          <button
            type="button"
            className="gear-panel-toggle"
            aria-expanded={gearOpen}
            onClick={() => setGearOpen((v) => !v)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <GearIcon />
              音の設定
            </span>
            <span aria-hidden="true">{gearOpen ? '▲' : '▼'}</span>
          </button>
          <div className="gear-panel-body">
            <div className="row">
              <button
                type="button"
                className="btn"
                onClick={() => audio.setBgmOn(!audio.settings.bgmOn)}
              >
                BGM {audio.settings.bgmOn ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => audio.setSfxOn(!audio.settings.sfxOn)}
              >
                効果音 {audio.settings.sfxOn ? 'ON' : 'OFF'}
              </button>
            </div>
            <label className="hint" style={{ textAlign: 'left' }}>
              BGM音量 {audio.settings.bgmVolume}
              <input
                type="range"
                min={0}
                max={100}
                value={audio.settings.bgmVolume}
                onChange={(e) => audio.setBgmVolume(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }}
              />
            </label>
          </div>
        </div>

        {hasSave ? (
          <button type="button" className="btn btn-ghost" onClick={onClearSave}>
            保存データを消す
          </button>
        ) : null}
      </div>
    </section>
  );
}

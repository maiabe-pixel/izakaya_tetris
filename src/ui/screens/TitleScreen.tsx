import { useEffect } from 'react';
import { useAudio } from '../../audio/useAudio';
import { TitleLogo } from '../TitleLogo';

type Props = {
  hasSave: boolean;
  onStart: () => void;
  onContinue: () => void;
  onClearSave: () => void;
};

export function TitleScreen({
  hasSave,
  onStart,
  onContinue,
  onClearSave,
}: Props) {
  const audio = useAudio();
  const { stopTrack } = audio;

  // Title stays quiet until falling/izakaya starts a track.
  useEffect(() => {
    stopTrack();
  }, [stopTrack]);

  return (
    <section className="screen panel" style={{ padding: '1.1rem' }}>
      <TitleLogo />
      <div className="stack">
        <button type="button" className="btn btn-primary" onClick={onStart}>
          はじめる
        </button>
        {hasSave ? (
          <button type="button" className="btn" onClick={onContinue}>
            続きから (居酒屋)
          </button>
        ) : null}
      </div>

      <div className="audio-box panel" style={{ boxShadow: 'none' }}>
        <h3>音の設定</h3>
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

      {hasSave ? (
        <button type="button" className="btn btn-ghost" onClick={onClearSave}>
          保存データを消す
        </button>
      ) : null}
    </section>
  );
}

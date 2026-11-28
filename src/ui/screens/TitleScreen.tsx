import { useEffect, useState } from 'react';
import { useAudio } from '../../audio/useAudio';

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

function PlayIcon() {
  return (
    <svg className="title-play-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5.5v13l11-6.5L8 5.5z" />
    </svg>
  );
}

/**
 * Title = one baked art background + absolute % buttons only.
 * Do not redraw logo / tagline / ujiueda / beer / minos / décor.
 */
export function TitleScreen({
  hasSave,
  onStart,
  onContinue,
  onClearSave,
}: Props) {
  const audio = useAudio();
  const { stopTrack } = audio;
  const [gearOpen, setGearOpen] = useState(false);

  useEffect(() => {
    stopTrack();
  }, [stopTrack]);

  return (
    <section className="screen title-screen title-bg">
      <div className="title-bg-stage">
        <div className="title-bg-frame">
          {/* Single baked scene (1024×1536, aspect 2/3) */}
          <img
            className="title-bg-image"
            src="/images/title-background.png"
            alt=""
            decoding="async"
            draggable={false}
          />

          {/* Controls only — over wood counter */}
          <div className="title-bg-ui">
            <button
              type="button"
              className="title-btn title-btn-start"
              onClick={onStart}
            >
              <PlayIcon />
              <span>スタート！</span>
            </button>

            <button
              type="button"
              className="title-btn title-btn-continue"
              onClick={onContinue}
              disabled={!hasSave}
            >
              続きから（居酒屋）
            </button>

            <button
              type="button"
              className="title-btn title-btn-audio"
              aria-expanded={gearOpen}
              onClick={() => setGearOpen(true)}
            >
              <span className="title-btn-audio-label">
                <GearIcon />
                音の設定
              </span>
              <span aria-hidden="true">▼</span>
            </button>
          </div>

          {gearOpen ? (
            <div
              className="title-audio-modal"
              role="dialog"
              aria-modal="true"
              aria-label="音の設定"
            >
              <button
                type="button"
                className="title-audio-backdrop"
                aria-label="閉じる"
                onClick={() => setGearOpen(false)}
              />
              <div className="title-audio-panel">
                <div className="title-audio-head">
                  <strong>音の設定</strong>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setGearOpen(false)}
                  >
                    閉じる
                  </button>
                </div>
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
                    onChange={(e) =>
                      audio.setBgmVolume(Number(e.target.value))
                    }
                    style={{ width: '100%', accentColor: '#ff4da6' }}
                  />
                </label>
                {hasSave ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClearSave}
                  >
                    保存データを消す
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

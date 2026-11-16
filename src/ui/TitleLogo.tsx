import { GAME_EYEBROW, GAME_SUBTITLE, GAME_TITLE } from '../game/constants';

type Props = {
  tagline?: string;
  compact?: boolean;
  imageSrc?: string;
};

export function TitleLogo({
  tagline = 'ネオンの居酒屋で、最下段を消すパズル',
  compact = false,
  imageSrc,
}: Props) {
  return (
    <header className="title-logo">
      <div className="eyebrow">{GAME_EYEBROW}</div>
      {imageSrc ? (
        <img src={imageSrc} alt={GAME_TITLE} style={{ maxWidth: '100%' }} />
      ) : (
        <h1 className="neon-title" style={{ fontSize: compact ? '1.55rem' : undefined }}>
          {GAME_TITLE}
        </h1>
      )}
      <p className="subtitle">{GAME_SUBTITLE}</p>
      {!compact && tagline ? <p className="tagline">{tagline}</p> : null}
    </header>
  );
}

import { GAME_EYEBROW, GAME_SUBTITLE, GAME_TITLE } from '../game/constants';

type Props = {
  tagline?: string;
  compact?: boolean;
  imageSrc?: string;
  /** Show the framed neon sign board (title hero). */
  sign?: boolean;
};

export function TitleLogo({
  tagline = 'ネオン横丁のゲーム酒場',
  compact = false,
  imageSrc,
  sign = false,
}: Props) {
  const title = imageSrc ? (
    <img src={imageSrc} alt={GAME_TITLE} style={{ maxWidth: '100%' }} />
  ) : (
    <h1
      className="neon-title"
      style={{ fontSize: compact ? '1.45rem' : undefined }}
    >
      {GAME_TITLE}
    </h1>
  );

  return (
    <header className="title-logo">
      <div className="eyebrow">{GAME_EYEBROW}</div>
      {sign && !compact ? (
        <div className="sign-board">{title}</div>
      ) : (
        title
      )}
      <p className="subtitle">{GAME_SUBTITLE}</p>
      {!compact && tagline ? <p className="tagline">{tagline}</p> : null}
    </header>
  );
}

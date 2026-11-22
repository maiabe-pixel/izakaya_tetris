import type { MinoType } from '../../game/types';
import { MinoGlyph } from './MinoGlyph';

export function NextPreview({ type }: { type: MinoType }) {
  return (
    <div className="next-preview">
      <div className="next-preview-label">NEXT</div>
      <div className="next-preview-box">
        <MinoGlyph type={type} size={13} />
      </div>
    </div>
  );
}

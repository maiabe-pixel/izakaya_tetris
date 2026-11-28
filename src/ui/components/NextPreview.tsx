import type { MinoType } from '../../game/types';
import { MinoGlyph } from './MinoGlyph';

export function NextPreview({ type }: { type: MinoType }) {
  return (
    <div className="next-preview fall-next">
      <div className="next-preview-label">NEXT</div>
      <div className="next-preview-box">
        <MinoGlyph type={type} size={12} />
      </div>
    </div>
  );
}

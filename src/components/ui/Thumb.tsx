import type { Media } from '../../types';
import { MediaArt } from '../board/MediaArt';
import { fmtEventDate, isWords } from '../../lib/mediaKinds';

/** Small square swatch of a media item, used in lists and match cards. */
export function Thumb({ m, size = 52, title = true }: { m: Media; size?: number; title?: boolean }) {
  const tint = m.tint === 'white' ? 'var(--paper-deep)' : m.tint === 'deep' ? 'var(--paper-deep)' : `var(--${m.tint})`;
  return (
    <span
      title={title ? m.title : undefined}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flex: 'none',
        overflow: 'hidden',
        background: tint,
        boxShadow: '0 1px 2px rgba(46,44,42,.12)',
        border: '3px solid var(--card-white)',
        transform: `rotate(${m.rot / 2}deg)`,
        fontFamily: 'var(--serif)',
        fontSize: Math.max(9, size / 6),
        lineHeight: 1.1,
        padding: isWords(m.type) ? 4 : 0,
      }}
    >
      {isWords(m.type) ? (
        m.type === 'text' ? `“${m.quote ?? m.title}”` : m.quote ?? m.title
      ) : m.type === 'event' ? (
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--tangerine)', color: '#fff', fontFamily: 'var(--mono)', fontSize: Math.max(8, size / 6), lineHeight: 1.1 }}>
          {fmtEventDate(m.when).month}
          <span style={{ fontFamily: 'var(--serif)', fontSize: size / 2.6 }}>{fmtEventDate(m.when).day}</span>
        </span>
      ) : (
        <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
      )}
    </span>
  );
}

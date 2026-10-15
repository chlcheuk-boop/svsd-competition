import type { Media } from '../../types';
import { MediaArt } from './MediaArt';
import { MiniStamp } from '../ui/MiniStamp';
import { person } from '../../data/people';
import { sizeOf } from '../../lib/geometry';
import './media-card.css';

const TYPE_LABEL: Record<Media['type'], string> = {
  image: 'image', music: 'music', text: 'quote', video: 'film', object: 'object', link: 'link',
};

function PlayGlyph() {
  return (
    <svg className="play-glyph" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="rgba(249,248,246,.9)" />
      <path d="M16.5 13.5l10.2 6.6-10.1 6.5z" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Origin({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="card-origin">{text}</p>;
}

/** The paper scrap itself, without positioning. */
export function MediaCard({ m, showStamp = true }: { m: Media; showStamp?: boolean }) {
  const { w, h } = sizeOf(m);
  const via = m.via ? person(m.via) : undefined;

  let inner: JSX.Element;
  if (m.shape === 'polaroid') {
    inner = (
      <>
        <div className="polaroid-photo">
          <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
          {m.type === 'video' && <PlayGlyph />}
        </div>
        <div className="card-text">
          <h3 className="card-title">{m.title}</h3>
          <Origin text={m.origin} />
        </div>
      </>
    );
  } else if (m.shape === 'sticky') {
    inner = (
      <div className="sticky-body">
        {m.type === 'text' ? (
          <>
            <blockquote className="sticky-quote lined">{m.quote ?? m.title}</blockquote>
            {m.subtitle && <span className="sticky-attr mono">— {m.subtitle}</span>}
          </>
        ) : (
          <>
            <div className="sticky-thumb">
              <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
            </div>
            <h3 className="card-title">{m.title}</h3>
          </>
        )}
        <Origin text={m.origin} />
      </div>
    );
  } else if (m.shape === 'folded') {
    inner = (
      <div className="folded-body">
        <div className="folded-thumb">
          <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
          {m.type === 'video' && <PlayGlyph />}
        </div>
        <div className="card-text">
          <h3 className="card-title">{m.title}</h3>
          {m.subtitle && <span className="card-sub mono">{m.type === 'link' ? `↗ ${m.subtitle}` : m.subtitle}</span>}
          <Origin text={m.origin} />
        </div>
        <span className="fold" aria-hidden="true" />
      </div>
    );
  } else {
    // punched
    inner = (
      <>
        <div className="punch-holes" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} />
          ))}
        </div>
        {m.type === 'music' ? (
          <div className="punched-music">
            <div className="album">
              <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
              <span className="vinyl" aria-hidden="true" />
            </div>
            <div>
              <h3 className="card-title">{m.title}</h3>
              <span className="card-sub">{m.subtitle}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="punched-art">
              <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
            </div>
            <h3 className="card-title">{m.title}</h3>
          </>
        )}
        <Origin text={m.origin} />
      </>
    );
  }

  return (
    <div className={`paper-card shape-${m.shape} tint-${m.tint}`} style={{ width: w, height: h }}>
      <span className="type-label mono">{TYPE_LABEL[m.type]}</span>
      {inner}
      {showStamp && via && (
        <span className="corner-stamp" title={`added via a Crossing with ${via.name.split(' ')[0]}`}>
          <MiniStamp personId={via.id} size={26} />
        </span>
      )}
    </div>
  );
}

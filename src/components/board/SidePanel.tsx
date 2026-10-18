import { motion } from 'framer-motion';
import type { Connection, Media, PassportStamp } from '../../types';
import { MediaArt } from './MediaArt';
import { MiniStamp } from '../ui/MiniStamp';
import { person } from '../../data/people';
import { IconArrowLeft, IconArrowRight, IconClock, IconClose, IconEye, IconThread } from '../ui/icons';
import { fmtMonth } from './BoardView';
import './side-panel.css';

interface Props {
  m: Media;
  media: Media[];
  connections: Connection[];
  stamps: PassportStamp[];
  ripplePerson: string | null;
  onClose: () => void;
  onJump: (id: string) => void;
  onRipple: (personId: string | null) => void;
  onMakeThread?: () => void;
  onReplay?: () => void;
  onRemove?: () => void;
  readOnly?: boolean;
}

export function SidePanel({ m, media, connections, stamps, ripplePerson, onClose, onJump, onRipple, onMakeThread, onReplay, onRemove, readOnly }: Props) {
  const phone = window.innerWidth < 640; // slides up as a sheet on phones
  const byId = new Map(media.map((x) => [x.id, x]));
  const mine = connections.filter((c) => c.from === m.id || c.to === m.id);
  const connIds = new Set(mine.map((c) => c.id));
  const myStamps = stamps.filter((s) => s.target && (s.target.id === m.id || connIds.has(s.target.id)));
  const influencers = Array.from(new Set([m.via, ...mine.map((c) => c.via)].filter(Boolean))) as string[];

  return (
    <motion.aside
      className="side-panel"
      aria-label={`${m.title} details`}
      initial={phone ? { y: 500 } : { x: 420, rotate: 2 }}
      animate={phone ? { y: 0 } : { x: 0, rotate: 0 }}
      exit={phone ? { y: 520 } : { x: 440, rotate: 2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button className="sp-close" onClick={onClose} aria-label="Close panel">
        <IconClose size={18} />
      </button>
      <span className="mono sp-kind">{m.type} · added {fmtMonth(m.addedAt)}</span>

      <div className={`sp-media ${m.type === 'text' ? 'is-text tint-' + m.tint : ''}`}>
        {m.type === 'text' ? (
          <blockquote className="serif">“{m.quote ?? m.title}”</blockquote>
        ) : (
          <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
        )}
      </div>

      <h2 className="sp-title">{m.title}</h2>
      {m.subtitle && <p className="sp-subtitle">{m.subtitle}</p>}
      {m.url && (
        <a className="mono sp-url" href={m.url} target="_blank" rel="noreferrer">
          ↗ {m.url.replace(/^https?:\/\//, '')}
        </a>
      )}
      {m.origin && <p className="sp-origin">{m.origin}</p>}
      {m.tags.length > 0 && (
        <div className="sp-tags">
          {m.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      <section className="sp-section">
        <h3 className="mono-label">strings ({mine.length})</h3>
        {mine.length === 0 && <p className="sp-empty serif">No strings yet. Pick up the yarn and tie this to something.</p>}
        <ul className="sp-conns">
          {mine.map((c) => {
            const out = c.from === m.id;
            const other = byId.get(out ? c.to : c.from);
            if (!other) return null;
            return (
              <li key={c.id}>
                <button className="sp-conn" onClick={() => onJump(other.id)}>
                  <span className="sp-dir" style={{ color: `var(--${c.color === 'ink' ? 'ink' : c.color})` }}>
                    {out ? <IconArrowRight size={16} /> : <IconArrowLeft size={16} />}
                  </span>
                  <span className="sp-conn-body">
                    <span className="sp-conn-title">{other.title}</span>
                    {c.why ? <span className="sp-why">{c.why}</span> : <span className="mono sp-nowhy">no why yet</span>}
                  </span>
                  {c.via && <MiniStamp personId={c.via} size={22} />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {myStamps.length > 0 && (
        <section className="sp-section">
          <h3 className="mono-label">stamps</h3>
          <ul className="sp-stamps">
            {myStamps.map((s) => {
              const p = person(s.personId)!;
              return (
                <li key={s.id}>
                  <MiniStamp personId={s.personId} size={26} />
                  <div>
                    <p className="serif">“{s.excerpt}”</p>
                    <span className="mono">{p.name} · {p.city} · {fmtMonth(s.date)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="sp-section sp-actions">
        {influencers.map((pid) => {
          const p = person(pid)!;
          const on = ripplePerson === pid;
          return (
            <button key={pid} className={`sp-action ${on ? 'on' : ''}`} onClick={() => onRipple(on ? null : pid)} aria-pressed={on}>
              <IconEye size={18} />
              <span>
                Ripple view
                <span className="mono">{on ? 'showing' : 'show'} everything {p.name.split(' ')[0]} influenced</span>
              </span>
            </button>
          );
        })}
        {!readOnly && onMakeThread && (
          <button className="sp-action" onClick={onMakeThread}>
            <IconThread size={18} />
            <span>
              Make a thread
              <span className="mono">follow the strings from here (or shift-click cards)</span>
            </span>
          </button>
        )}
        {!readOnly && onReplay && (
          <button className="sp-action" onClick={onReplay}>
            <IconClock size={18} />
            <span>
              Time replay
              <span className="mono">watch the board grow in order</span>
            </span>
          </button>
        )}
        {!readOnly && onRemove && (
          <button className="btn btn-quiet sp-remove" onClick={onRemove}>
            remove from board
          </button>
        )}
      </section>
    </motion.aside>
  );
}

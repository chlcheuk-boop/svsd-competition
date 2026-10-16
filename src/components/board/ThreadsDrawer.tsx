import { motion } from 'framer-motion';
import type { Accent, Thread } from '../../types';
import { YARN_HEX } from './Yarn';
import { IconClose } from '../ui/icons';
import './threads-drawer.css';

export const THREAD_COLORS: Accent[] = ['tangerine', 'sky', 'pink', 'lime', 'ink'];

interface Part {
  thread: Thread;
  ids: string[];
  connectionIds: string[];
  color: Accent;
}

/** Board-side list of your threads; picking one traces it on the board. */
export function ThreadsDrawer({ parts, active, onPick, onOpen, onClose }: {
  parts: Part[];
  active: string | null;
  onPick: (id: string | null) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.aside
      className="threads-view"
      aria-label="Your threads"
      initial={{ x: -340, rotate: -2 }}
      animate={{ x: 0, rotate: 0 }}
      exit={{ x: -360, rotate: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button className="sp-close" onClick={onClose} aria-label="Close threads view">
        <IconClose size={16} />
      </button>
      <span className="mono-label">threads on this board</span>
      <h2 className="serif">Your threads</h2>

      <button className={`tv-row all ${active === null ? 'on' : ''}`} onClick={() => onPick(null)} aria-pressed={active === null}>
        <span className="tv-swatches">
          {parts.map((p) => (
            <span key={p.thread.id} style={{ background: YARN_HEX[p.color].base }} />
          ))}
        </span>
        <span className="tv-row-title">All threads</span>
        <span className="mono">{parts.length}</span>
      </button>

      <ul className="tv-list">
        {parts.map((p) => {
          const on = active === p.thread.id;
          return (
            <li key={p.thread.id}>
              <button className={`tv-row ${on ? 'on' : ''}`} onClick={() => onPick(on ? null : p.thread.id)} aria-pressed={on}>
                <svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true">
                  <path d="M2 7 C 8 0, 14 14, 24 6" fill="none" stroke={YARN_HEX[p.color].base} strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="tv-row-body">
                  <span className="tv-row-title serif">{p.thread.title}</span>
                  {p.thread.intro && <span className="tv-row-intro serif">{p.thread.intro}</span>}
                  <span className="mono">
                    {p.ids.length} cards · {p.connectionIds.length} {p.connectionIds.length === 1 ? 'string' : 'strings'}
                    {p.thread.coAuthor ? ' · shared' : ''}
                  </span>
                </span>
              </button>
              {on && (
                <button className="btn btn-ghost tv-read" onClick={() => onOpen(p.thread.id)}>
                  read the story →
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {parts.length === 0 && <p className="serif tv-empty">No threads yet.</p>}
      <p className="mono tv-hint">shift-click any chain of tied cards to make a new thread. any length works, as long as each pair has a string.</p>
    </motion.aside>
  );
}

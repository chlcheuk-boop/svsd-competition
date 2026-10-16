import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, Toolbar } from '../components/ui/Frame';
import { IconArrowLeft, IconClock, IconThread } from '../components/ui/icons';
import { Thumb } from '../components/ui/Thumb';
import { Toggle } from '../components/ui/Toggle';
import { YARN_HEX } from '../components/board/Yarn';
import { fmtMonth } from '../components/board/BoardView';
import { MAYA } from '../data/people';
import { universe } from '../lib/lookup';
import { seeded } from '../lib/geometry';
import type { Accent, Media } from '../types';
import './profile.css';

const LOOP_COLORS: Accent[] = ['tangerine', 'pink', 'sky', 'lime', 'peach', 'ink'];

/** Abstract taste fingerprint: one scribbled yarn loop per theme, sized by how often it shows up. */
function Fingerprint({ media }: { media: Media[] }) {
  const counts = new Map<string, number>();
  media.forEach((m) => m.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = top[0]?.[1] ?? 1;
  const positions = [
    [200, 170], [120, 120], [290, 120], [110, 240], [290, 240], [200, 290], [200, 70],
  ];
  return (
    <div className="fingerprint">
      <svg viewBox="0 0 400 360" role="img" aria-label={`Taste fingerprint: ${top.map(([t]) => t).join(', ')}`}>
        {top.map(([tag, n], i) => {
          const r = 34 + (n / max) * 52;
          const [cx, cy] = positions[i];
          const rnd = seeded(i * 13 + 5);
          let d = '';
          const loops = 3;
          for (let k = 0; k <= 64 * loops; k++) {
            const a = (k / 64) * Math.PI * 2;
            const rr = r * (0.82 + rnd() * 0.06 + 0.12 * Math.sin(a * 3 + i));
            const x = cx + Math.cos(a) * rr + (k / (64 * loops)) * 8;
            const y = cy + Math.sin(a) * rr * 0.86;
            d += `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
          }
          const c = YARN_HEX[LOOP_COLORS[i % LOOP_COLORS.length]];
          return (
            <motion.g key={tag} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i, type: 'spring', stiffness: 160, damping: 16 }} style={{ originX: `${cx}px`, originY: `${cy}px` }}>
              <path d={d} fill="none" stroke={c.base} strokeWidth="2.2" strokeLinejoin="round" opacity=".85" />
              <path d={d} fill="none" stroke={c.deep} strokeWidth="2.2" strokeDasharray="1 3" opacity=".35" />
            </motion.g>
          );
        })}
      </svg>
      <ul className="fp-legend">
        {top.map(([tag, n], i) => (
          <li key={tag}>
            <span className="fp-dot" style={{ background: YARN_HEX[LOOP_COLORS[i % LOOP_COLORS.length]].base }} />
            <span className="serif">{tag}</span>
            <span className="mono">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProfilePage() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const u = universe(state);
  const mine = state.threads.filter((t) => t.owner === 'maya');

  return (
    <div className="page profile-page">
      <div className="pf-wrap">
        <header className="pf-head">
          <Avatar size={120} />
          <div>
            <span className="mono-label">{MAYA.craft} · {MAYA.city}</span>
            <h1 className="serif">{MAYA.name}</h1>
            <p className="serif pf-bio">{MAYA.bio}</p>
            <div className="pf-stats mono">
              <span>{state.media.length} references</span>
              <span>{state.connections.length} strings</span>
              <span>{state.stamps.length} stamps</span>
            </div>
          </div>
        </header>

        <section className="pf-section">
          <div className="pf-section-head">
            <h2 className="serif">Threads</h2>
            <span className="mono-label">how other people meet you</span>
          </div>
          <div className="pf-threads">
            {mine.map((t, i) => (
              <motion.div key={t.id} className="pf-thread" style={{ rotate: i % 2 ? 0.8 : -0.8 }} whileHover={{ y: -4, rotate: 0 }}>
                <Link to={`/thread/${t.id}`} className="pf-thread-link">
                  <div className="pf-thread-stack">
                    {t.mediaIds.slice(0, 4).map((id) => {
                      const m = u.media.get(id);
                      return m ? <Thumb key={id} m={m} size={64} title={false} /> : null;
                    })}
                  </div>
                  <span className="mono-label">
                    {t.coAuthor ? 'shared thread space' : 'thread'} · {t.mediaIds.length} references · {fmtMonth(t.publishedAt)}
                  </span>
                  <h3 className="serif">{t.title}</h3>
                  {t.intro && <p className="serif">{t.intro}</p>}
                </Link>
                <div className="pf-thread-foot">
                  <Toggle
                    label={t.isPublic ? 'public' : 'private'}
                    checked={t.isPublic}
                    onChange={(v) => dispatch({ type: 'updateThread', id: t.id, patch: { isPublic: v } })}
                  />
                </div>
              </motion.div>
            ))}
            <div className="pf-thread empty">
              <IconThread size={26} />
              <p className="serif">Shift-click three to seven tied cards on your board to make a new thread.</p>
              <button className="btn btn-ghost" onClick={() => nav('/')}>go to board</button>
            </div>
          </div>
        </section>

        <section className="pf-grid">
          <div className="pf-section">
            <div className="pf-section-head">
              <h2 className="serif">Taste fingerprint</h2>
              <span className="mono-label">what matching sees: themes, not your images</span>
            </div>
            <Fingerprint media={state.media} />
          </div>
          <div className="pf-section">
            <div className="pf-section-head">
              <h2 className="serif">Visibility</h2>
            </div>
            <div className="pf-controls">
              <Toggle label="Matchable this week" hint="you appear in other people’s four cards" checked={state.settings.matchable}
                onChange={(v) => dispatch({ type: 'settings', patch: { matchable: v } })} />
              <Toggle label="Board is private" hint="matches see threads and fingerprint, not the whole board" checked={state.settings.boardPrivate}
                onChange={(v) => dispatch({ type: 'settings', patch: { boardPrivate: v } })} />
            </div>
            <button className="pf-replay" onClick={() => nav('/?replay=1')}>
              <IconClock size={22} />
              <span>
                <strong className="serif">Time replay</strong>
                <span className="mono">watch your board grow from feb 2025 to now</span>
              </span>
            </button>
          </div>
        </section>
      </div>
      <Toolbar tools={[{ id: 'back', label: 'back to board', icon: <IconArrowLeft />, onClick: () => nav('/') }]} />
    </div>
  );
}

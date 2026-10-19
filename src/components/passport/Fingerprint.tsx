import { motion } from 'framer-motion';
import { YARN_HEX } from '../board/Yarn';
import { seeded } from '../../lib/geometry';
import type { Accent, Media } from '../../types';
import './fingerprint.css';

// one color per loop position, picked so olive never touches red or brown (on the drawing or in the legend)
const LOOP_COLORS: Accent[] = ['lime', 'peach', 'sky', 'pink', 'tangerine', 'ink', 'pink'];

/** Abstract taste fingerprint: one scribbled yarn loop per theme, sized by how often it shows up. */
export function Fingerprint({ media }: { media: Media[] }) {
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


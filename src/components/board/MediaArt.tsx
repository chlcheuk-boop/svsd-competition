import type { ArtSpec } from '../../types';
import { seeded } from '../../lib/geometry';
import { asset } from '../../lib/asset';

/**
 * Generated abstract placeholder imagery. Every reference without a real upload
 * renders through here, so swapping in real images only touches `imageData`.
 */
export function MediaArt({ art, imageData, title }: { art?: ArtSpec; imageData?: string; title?: string }) {
  if (imageData) {
    return <img src={asset(imageData)} alt={title ?? ''} draggable={false} decoding="async" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
  }
  if (!art) return <div style={{ width: '100%', height: '100%', background: 'var(--paper-deep)' }} />;
  const r = seeded(art.seed);
  const [a, b, c, d, e] = [...art.colors, ...art.colors];
  const id = `g${art.kind}${art.seed}`;
  let body: JSX.Element;

  switch (art.kind) {
    case 'sun':
      body = (
        <>
          <rect width="100" height="100" fill={b} />
          <circle cx="50" cy="44" r="26" fill={a} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="0" y={70 + i * 6} width="100" height="3" fill={a} opacity={1 - i * 0.18} />
          ))}
          <rect x="12" y="10" width="34" height="3" fill={c} />
          <rect x="12" y="15" width="20" height="2" fill={c} />
        </>
      );
      break;
    case 'bauhaus':
      body = (
        <>
          <rect width="100" height="100" fill={d ?? '#EFE6D6'} />
          <circle cx={30 + r() * 10} cy="34" r="20" fill={a} />
          <path d={`M${50 + r() * 6} 92 L88 30 L96 92Z`} fill={b} />
          <rect x="10" y="64" width="44" height="12" fill={c} />
          <rect x="62" y="8" width="3" height="54" fill="#2E2C2A" />
          <rect x="10" y="84" width="30" height="2.5" fill="#2E2C2A" />
        </>
      );
      break;
    case 'grid': {
      const lines = [a, b, c, d].map((col, i) => {
        const y0 = 18 + i * 18 + r() * 6;
        const bend = 30 + r() * 40;
        return (
          <g key={i}>
            <path d={`M-4 ${y0} H${bend} L${bend + 16} ${y0 + 16 * (i % 2 ? -1 : 1)} H104`} stroke={col} strokeWidth="5" fill="none" strokeLinejoin="round" />
            <circle cx={bend} cy={y0} r="3" fill="#fff" stroke="#2E2C2A" strokeWidth="1.2" />
          </g>
        );
      });
      body = (
        <>
          <rect width="100" height="100" fill={e ?? '#EFE6D6'} />
          {lines}
        </>
      );
      break;
    }
    case 'stencil': {
      const letters = ['P', 'R', 'B', '2', 'E', 'K', 'A'];
      const L = letters[art.seed % letters.length];
      body = (
        <>
          <rect width="100" height="100" fill={a} />
          <text x="50" y="80" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="82" fill={c}>
            {L}
          </text>
          <rect x="0" y="44" width="100" height="3.5" fill={a} />
          <rect x="47" y="0" width="3" height="100" fill={a} opacity=".9" />
          <rect x="70" y="8" width="22" height="8" fill={b} />
        </>
      );
      break;
    }
    case 'neon':
      body = (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1b1a19" />
              <stop offset="1" stopColor={a} />
            </linearGradient>
            <filter id={`${id}b`}>
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <rect width="100" height="100" fill={`url(#${id})`} />
          <g filter={`url(#${id}b)`}>
            <rect x="18" y="10" width="10" height="90" fill={b} opacity=".85" />
            <rect x="62" y="0" width="8" height="100" fill={c} opacity=".7" />
          </g>
          <rect x="36" y="30" width="18" height="70" fill="#1b1a19" opacity=".7" />
          <rect x="40" y="38" width="4" height="10" fill={c} opacity=".9" />
        </>
      );
      break;
    case 'gradient':
      body = (
        <>
          <defs>
            <radialGradient id={id} cx={0.3 + r() * 0.4} cy={0.35} r="0.9">
              <stop offset="0" stopColor={a} />
              <stop offset="0.55" stopColor={b} />
              <stop offset="1" stopColor={c} />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${id})`} />
        </>
      );
      break;
    case 'waves':
      body = (
        <>
          <rect width="100" height="100" fill={a} />
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={i}
              d={`M-5 ${22 + i * 10} Q 20 ${12 + i * 10 + r() * 8} 45 ${22 + i * 10} T 105 ${22 + i * 10}`}
              stroke={i % 2 ? b : c}
              strokeWidth="2.2"
              fill="none"
              opacity={0.9 - i * 0.07}
            />
          ))}
        </>
      );
      break;
    case 'dots':
      body = (
        <>
          <rect width="100" height="100" fill={a} />
          {Array.from({ length: 36 }).map((_, i) => {
            const x = 10 + (i % 6) * 16;
            const y = 10 + Math.floor(i / 6) * 16;
            const s = r();
            return <circle key={i} cx={x} cy={y} r={1 + s * 5} fill={s > 0.85 ? c : b} />;
          })}
        </>
      );
      break;
    case 'stripes':
      body = (
        <>
          {[a, b, c, d, e].map((col, i) => (
            <rect key={i} x={i * 20} y="0" width="20.5" height="100" fill={col} />
          ))}
          <rect x="0" y="62" width="100" height="6" fill="#fff" opacity=".35" />
        </>
      );
      break;
    case 'arch':
      body = (
        <>
          <rect width="100" height="100" fill={b} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${14 + i * 9} 100 V${60 - i * 4} A${36 - i * 9} ${36 - i * 9} 0 0 1 ${86 - i * 9} ${60 - i * 4} V100`} fill={i % 2 ? b : a} />
          ))}
          <rect x="0" y="94" width="100" height="6" fill={c} />
        </>
      );
      break;
    case 'token':
      body = (
        <>
          <rect width="100" height="100" fill={c} />
          <circle cx="50" cy="52" r="32" fill={a} />
          <circle cx="50" cy="52" r="26" fill="none" stroke={b} strokeWidth="1.5" />
          <path d="M42 46 h16 v12 h-16z" fill={c} />
          <ellipse cx="50" cy="88" rx="28" ry="3" fill="#000" opacity=".08" />
        </>
      );
      break;
    case 'map': {
      // a walking-map fragment: blocks, a few streets, one river, one pin
      const streets = [12, 34, 58, 81].map((v, i) => v + (r() * 6 - 3));
      body = (
        <>
          <rect width="100" height="100" fill={a} />
          <path d={`M-5 ${60 + r() * 10} C 30 ${50 + r() * 20}, 60 ${80 + r() * 10}, 105 ${62 + r() * 10}`} stroke={b} strokeWidth="9" fill="none" opacity=".75" />
          {streets.map((v, i) => (
            <path key={`v${i}`} d={`M${v} -5 L${v + (i % 2 ? 6 : -4)} 105`} stroke="#fff" strokeWidth={i === 1 ? 4 : 2.2} opacity=".9" />
          ))}
          {streets.map((v, i) => (
            <path key={`h${i}`} d={`M-5 ${v} L105 ${v + (i % 2 ? -5 : 3)}`} stroke="#fff" strokeWidth={i === 2 ? 4 : 2.2} opacity=".9" />
          ))}
          <rect x="40" y="18" width="14" height="12" fill={c} opacity=".55" />
          <g transform="translate(50 46)">
            <path d="M0 0 C -9 -10, -7 -20, 0 -20 C 7 -20, 9 -10, 0 0Z" fill={d ?? '#E05E31'} stroke="#2E2C2A" strokeWidth="1.2" />
            <circle cy="-13" r="3" fill="#fff" />
          </g>
        </>
      );
      break;
    }
    default:
      body = <rect width="100" height="100" fill={a} />;
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ display: 'block' }} aria-hidden="true">
      {body}
    </svg>
  );
}

import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { universe, linkBetween } from '../lib/lookup';
import { Toolbar, useToast } from '../components/ui/Frame';
import { IconArrowLeft, IconPen, IconShare } from '../components/ui/icons';
import { MediaArt } from '../components/board/MediaArt';
import { MiniStamp } from '../components/ui/MiniStamp';
import { YarnStrand } from '../components/board/Yarn';
import { fmtMonth } from '../components/board/BoardView';
import { MAYA, person } from '../data/people';
import type { Media } from '../types';
import './thread.css';

function BigMedia({ m }: { m: Media }) {
  if (m.type === 'text') {
    return (
      <div className={`tv-quote tint-${m.tint}`}>
        <blockquote className="serif lined">{m.quote ?? m.title}</blockquote>
        {m.subtitle && <span className="mono">— {m.subtitle}</span>}
      </div>
    );
  }
  return (
    <div className={`tv-frame type-${m.type}`}>
      <div className="tv-art">
        <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
        {m.type === 'video' && <span className="tv-play" aria-hidden="true">▶</span>}
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const { id = '' } = useParams();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const u = universe(state);
  const thread = u.threads.find((t) => t.id === id);
  const [editing, setEditing] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<{ d: string; h: number; stitches: { x: number; y: number }[] }>({ d: '', h: 0, stitches: [] });

  useLayoutEffect(() => {
    wrap.current?.closest('.page')?.scrollTo(0, 0);
  }, [id]);

  const items = thread ? thread.mediaIds.map((mid) => u.media.get(mid)).filter(Boolean) as Media[] : [];

  // Lay one continuous yarn down the page, through every media frame.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const build = () => {
      const base = el.getBoundingClientRect();
      const anchors = Array.from(el.querySelectorAll<HTMLElement>('[data-anchor]')).map((a) => {
        const r = a.getBoundingClientRect();
        return { top: { x: r.left - base.left + r.width / 2, y: r.top - base.top + 6 }, bottom: { x: r.left - base.left + r.width / 2, y: r.bottom - base.top - 6 }, left: r.left - base.left, right: r.right - base.left };
      });
      if (!anchors.length) return;
      const heads = el.querySelectorAll<HTMLElement>('.tv-head > *');
      const lastHead = heads[heads.length - 1];
      const startY = lastHead ? lastHead.getBoundingClientRect().bottom - base.top + 18 : 0;
      let d = `M ${base.width / 2} ${startY} C ${base.width / 2 - 120} ${startY + 40}, ${anchors[0].top.x + 140} ${anchors[0].top.y - 60}, ${anchors[0].top.x} ${anchors[0].top.y}`;
      const stitches: { x: number; y: number }[] = [];
      anchors.forEach((a, i) => {
        stitches.push(a.top, a.bottom);
        // the thread passes under the frame and surfaces at the bottom
        d += ` M ${a.bottom.x} ${a.bottom.y}`;
        const next = anchors[i + 1];
        if (next) {
          const swing = (i % 2 ? 1 : -1) * Math.min(1, base.width / 860);
          const span = next.top.y - a.bottom.y;
          d += ` C ${a.bottom.x + swing * 260} ${a.bottom.y + span * 0.35}, ${next.top.x + swing * 260} ${next.top.y - span * 0.35}, ${next.top.x} ${next.top.y}`;
        } else {
          d += ` C ${a.bottom.x - 80} ${a.bottom.y + 60}, ${a.bottom.x + 40} ${a.bottom.y + 110}, ${a.bottom.x} ${a.bottom.y + 140}`;
        }
      });
      setPath({ d, h: el.scrollHeight, stitches });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length, editing]);

  if (!thread) return <Navigate to="/profile" replace />;
  const mine = thread.owner === 'maya';
  const author = mine ? MAYA.name : person(thread.owner)?.name;
  const co = thread.coAuthor ? person(thread.coAuthor) : undefined;
  const color = mine ? 'tangerine' : (person(thread.owner)?.color ?? 'tangerine');

  return (
    <div className="page thread-page paper-grain">
      <div className="tv-wrap" ref={wrap}>
        <svg className="tv-yarn" width="100%" height={path.h} aria-hidden="true">
          <YarnStrand d={path.d} color={color} width={3.2} />
          {path.stitches.map((p, i) => (
            <g key={i}>
              <circle cx={p.x - 6} cy={p.y} r={2.4} fill="rgba(46,44,42,.5)" />
              <circle cx={p.x + 6} cy={p.y} r={2.4} fill="rgba(46,44,42,.5)" />
              <YarnStrand d={`M ${p.x - 6} ${p.y} L ${p.x + 6} ${p.y}`} color={color} width={2.6} />
            </g>
          ))}
        </svg>

        <header className="tv-head">
          <span className="mono-label">
            thread · {author}{co ? ` with ${co.name}` : ''} · {fmtMonth(thread.publishedAt)} · {thread.isPublic ? 'public' : 'private'}
          </span>
          {editing ? (
            <>
              <input className="tv-title-input serif" value={thread.title} onChange={(e) => dispatch({ type: 'updateThread', id, patch: { title: e.target.value } })} aria-label="Thread title" />
              <input className="tv-intro-input serif" value={thread.intro ?? ''} placeholder="one line to set it up" onChange={(e) => dispatch({ type: 'updateThread', id, patch: { intro: e.target.value } })} aria-label="Thread intro" />
            </>
          ) : (
            <>
              <h1 className="serif">{thread.title}</h1>
              {thread.intro && <p className="serif tv-intro">{thread.intro}</p>}
            </>
          )}
          {co && (
            <span className="tv-co mono">
              <MiniStamp personId={co.id} size={20} /> a shared thread space · you and {co.name.split(' ')[0]} both add to it
            </span>
          )}
        </header>

        {items.map((m, i) => {
          const next = items[i + 1];
          const link = next ? linkBetween(u.connections, m.id, next.id) : undefined;
          const side = i % 2 ? 'right' : 'left';
          return (
            <section key={m.id} className={`tv-item ${side}`}>
              <motion.figure
                className="tv-media"
                data-anchor
                initial={{ opacity: 0, y: 30, rotate: side === 'left' ? -3 : 3 }}
                whileInView={{ opacity: 1, y: 0, rotate: side === 'left' ? -1.2 : 1.2 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              >
                <BigMedia m={m} />
                <figcaption>
                  <strong>{m.title}</strong>
                  {m.subtitle && m.type !== 'text' && <span>{m.subtitle}</span>}
                  {m.origin && <em className="serif">{m.origin}</em>}
                </figcaption>
                {m.via && <span className="tv-stamp"><MiniStamp personId={m.via} size={30} /></span>}
              </motion.figure>
              {next && (
                <motion.div
                  className={`tv-why ${side === 'left' ? 'right' : 'left'} ${link?.why ? '' : 'missing'}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8 }}
                >
                  {link?.why ? (
                    <>
                      <p className="serif">{link.why}</p>
                      {link.via && (
                        <span className="mono tv-why-via">
                          <MiniStamp personId={link.via} size={16} /> tied by {person(link.via)?.name.split(' ')[0]}
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="serif">no string here yet. {co ? 'write this why together.' : 'the gap is part of the story.'}</p>
                  )}
                </motion.div>
              )}
            </section>
          );
        })}
        <footer className="tv-end mono">— end of thread · {items.length} references —</footer>
      </div>

      <Toolbar
        tools={[
          { id: 'edit', label: editing ? 'done' : 'edit thread', icon: <IconPen />, active: editing, disabled: !mine, onClick: () => setEditing((e) => !e) },
          {
            id: 'share', label: mine && !thread.isPublic ? 'publish' : 'share', icon: <IconShare />,
            onClick: () => {
              if (mine && !thread.isPublic) {
                dispatch({ type: 'updateThread', id, patch: { isPublic: true } });
                toast({ text: 'published · it now appears on your profile' });
                return;
              }
              try {
                navigator.clipboard?.writeText(window.location.href);
              } catch {
                /* clipboard blocked */
              }
              toast({ text: 'link copied · threads are how people meet you' });
            },
          },
          { id: 'back', label: mine ? 'back to board' : 'back', icon: <IconArrowLeft />, onClick: () => (mine ? nav('/') : nav(-1)) },
        ]}
      />
    </div>
  );
}

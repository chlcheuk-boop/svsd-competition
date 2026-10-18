import { animate, motion, useAnimationFrame, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Accent, Board, Connection, Media } from '../../types';
import {
  bezierPath, boundsOf, centerOf, closestT, connectionGeometry, holesFor, pointAt, sagCurve, sizeOf,
  type Bezier, type Pt,
} from '../../lib/geometry';
import { MediaCard } from './MediaCard';
import { YarnStrand, YARN_HEX } from './Yarn';
import { MiniStamp } from '../ui/MiniStamp';
import { person } from '../../data/people';
import { IconMinus, IconPlus } from '../ui/icons';
import './board.css';

export type BoardTool = 'select' | 'yarn' | 'scissors' | 'place';

export interface Camera {
  x: number;
  y: number;
  z: number;
}

export interface FocusRequest {
  kind: 'connection' | 'media';
  id: string;
  nonce: number;
}

export interface BoardViewProps {
  media: Media[];
  connections: Connection[];
  tool: BoardTool;
  yarnColor: Accent;
  editable?: boolean;
  maskPrefix: string;
  onMove?: (id: string, x: number, y: number) => void;
  onConnect?: (from: string, to: string) => void;
  onSnip?: (ids: string[]) => void;
  onCardClick?: (id: string, opts: { shift: boolean }) => void;
  onPlace?: (pt: Pt) => void;
  onTagClick?: (connId: string) => void;
  onBackgroundClick?: () => void;
  selectedId?: string | null;
  pathSelection?: string[];
  emphasis?: Set<string> | null;
  glow?: Set<string>;
  backdrop?: Board | null;
  focus?: FocusRequest | null;
  /** Fly the camera to fit a group of cards (e.g. one thread). */
  frame?: { ids: string[]; nonce: number } | null;
  /** Colored traces drawn under specific strings (e.g. threads). */
  traces?: { connectionIds: string[]; color: Accent }[];
  placeGhost?: Media | null;
  /** Rendered above the canvas in screen space; receives a world→screen mapper. */
  screenOverlay?: (toScreen: (p: Pt) => Pt, cam: Camera) => ReactNode;
  initialCamera?: Camera;
  onCamera?: (c: Camera) => void;
}

interface Ghost {
  id: string;
  color: Accent;
  a: Pt;
  b: Pt;
  cut: Pt;
  sag: number;
}

const DRAG_THRESHOLD = 4;

export function connectionMidpoint(c: Connection, byId: Map<string, Media>): Pt | null {
  const a = byId.get(c.from);
  const b = byId.get(c.to);
  if (!a || !b) return null;
  return pointAt(connectionGeometry(a, b).curve, 0.5);
}

export default function BoardView(props: BoardViewProps) {
  const {
    media, connections, tool, yarnColor, editable = true, maskPrefix, onMove, onConnect, onSnip, onCardClick,
    onPlace, onTagClick, onBackgroundClick, selectedId, pathSelection = [], emphasis, glow, backdrop, focus,
    frame, traces, placeGhost, screenOverlay, initialCamera, onCamera,
  } = props;

  const viewport = useRef<HTMLDivElement>(null);
  const [cam, setCam] = useState<Camera>(initialCamera ?? { x: 0, y: 0, z: 1 });
  const camRef = useRef(cam);
  camRef.current = cam;
  const [hovered, setHovered] = useState<string | null>(null);
  const [pending, setPending] = useState<{ from: string; pt: Pt; click: boolean } | null>(null);
  const [cut, setCut] = useState<{ id: string; pt: Pt } | null>(null);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [snapKey, setSnapKey] = useState(0);
  const [pulse, setPulse] = useState<string | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const snipping = useRef(false);

  const byId = useMemo(() => new Map(media.map((m) => [m.id, m])), [media]);
  const rotOf = useCallback((m: Media) => (hovered === m.id || dragging === m.id ? m.rot * 0.2 : m.rot), [hovered, dragging]);

  useEffect(() => onCamera?.(cam), [cam, onCamera]);

  /* ---------- camera ---------- */
  const toWorld = useCallback((clientX: number, clientY: number): Pt => {
    const r = viewport.current!.getBoundingClientRect();
    const c = camRef.current;
    return { x: (clientX - r.left - c.x) / c.z, y: (clientY - r.top - c.y) / c.z };
  }, []);
  const toScreen = useCallback((p: Pt): Pt => ({ x: p.x * cam.z + cam.x, y: p.y * cam.z + cam.y }), [cam]);

  const fit = useCallback((animated = false) => {
    const el = viewport.current;
    if (!el) return;
    const b = boundsOf(media);
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const phone = vw < 640;
    const padX = phone ? 12 : 120;
    const padTop = phone ? 70 : 110;
    const padBottom = phone ? 110 : 150;
    const z = Math.max(0.15, Math.min(1.05, (vw - padX * 2) / (b.maxX - b.minX), (vh - padTop - padBottom) / (b.maxY - b.minY)));
    let target = {
      z,
      x: (vw - (b.maxX - b.minX) * z) / 2 - b.minX * z,
      y: padTop + (vh - padTop - padBottom - (b.maxY - b.minY) * z) / 2 - b.minY * z,
    };
    if (phone && z < 0.3) {
      // a whole wide desk is unreadable on a phone: fit its height, start at the left edge, pan sideways
      const zh = Math.min(0.6, Math.max(0.3, (vh - padTop - padBottom) / (b.maxY - b.minY)));
      target = { z: zh, x: padX - b.minX * zh, y: padTop + (vh - padTop - padBottom - (b.maxY - b.minY) * zh) / 2 - b.minY * zh };
    }
    if (!animated) return setCam(target);
    const from = { ...camRef.current };
    animate(0, 1, { duration: 0.6, ease: [0.2, 0.8, 0.2, 1], onUpdate: (t) => setCam({
      x: from.x + (target.x - from.x) * t, y: from.y + (target.y - from.y) * t, z: from.z + (target.z - from.z) * t,
    }) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.length]);

  // Fit once the viewport has a real size, and keep fitting on resize until the user moves the camera.
  const userMoved = useRef(!!initialCamera);
  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!userMoved.current && el.clientWidth > 300) fit(false);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flyTo = useCallback((p: Pt, z = 1.1) => {
    const el = viewport.current;
    if (!el) return;
    userMoved.current = true;
    const from = { ...camRef.current };
    const target = { z, x: el.clientWidth / 2 - p.x * z, y: el.clientHeight / 2 - 40 - p.y * z };
    animate(0, 1, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: (t) => setCam({
      x: from.x + (target.x - from.x) * t, y: from.y + (target.y - from.y) * t, z: from.z + (target.z - from.z) * t,
    }) });
  }, []);

  useEffect(() => {
    if (!focus) return;
    let p: Pt | null = null;
    if (focus.kind === 'connection') {
      const c = connections.find((x) => x.id === focus.id);
      if (c) p = connectionMidpoint(c, byId);
    } else {
      const m = byId.get(focus.id);
      if (m) p = centerOf(m);
    }
    if (!p) return;
    const t = window.setTimeout(() => flyTo(p!, 1.15), 120);
    setPulse(focus.id);
    const t2 = window.setTimeout(() => setPulse(null), 5200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.nonce]);

  useEffect(() => {
    const el = viewport.current;
    if (!frame || !el) return;
    const group = frame.ids.map((i) => byId.get(i)).filter(Boolean) as Media[];
    if (!group.length) return;
    const b = boundsOf(group);
    const z = Math.max(0.15, Math.min(1.1, (el.clientWidth - 520) / (b.maxX - b.minX), (el.clientHeight - 300) / (b.maxY - b.minY)));
    flyTo({ x: (b.minX + b.maxX) / 2 - 120 / z, y: (b.minY + b.maxY) / 2 }, z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame?.nonce]);

  const traceColor = useMemo(() => {
    const m = new Map<string, Accent>();
    traces?.forEach((t) => t.connectionIds.forEach((id) => m.set(id, t.color)));
    return m;
  }, [traces]);

  const zoomAt = useCallback((factor: number, sx?: number, sy?: number) => {
    const el = viewport.current!;
    const c = camRef.current;
    const px = sx ?? el.clientWidth / 2;
    const py = sy ?? el.clientHeight / 2;
    userMoved.current = true;
    const z = Math.min(2.4, Math.max(0.15, c.z * factor));
    const k = z / c.z;
    setCam({ z, x: px - (px - c.x) * k, y: py - (py - c.y) * k });
  }, []);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top);
      } else {
        userMoved.current = true;
        setCam((c) => ({ ...c, x: c.x - e.deltaX, y: c.y - e.deltaY }));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.('input, textarea, [contenteditable]')) return;
      if (e.code === 'Space') {
        setSpaceDown(true);
        e.preventDefault();
      }
      if (e.key === 'Escape') setPending(null);
      if (e.key === '+' || e.key === '=') zoomAt(1.15);
      if (e.key === '-') zoomAt(1 / 1.15);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [zoomAt]);

  useEffect(() => {
    if (tool !== 'yarn') setPending(null);
    setCut(null);
  }, [tool]);

  /* ---------- pointer handling ---------- */
  /* ---------- two-finger pinch to zoom (touch) ---------- */
  const touches = useRef(new Map<number, Pt>());
  const pinch = useRef<{ d0: number; c0: Camera; mid0: Pt } | null>(null);

  const releaseTouch = (e: React.PointerEvent) => {
    const t = e.target as Element;
    if (e.pointerType === 'touch' && t.hasPointerCapture?.(e.pointerId)) t.releasePointerCapture(e.pointerId);
  };

  const onPointerDownCapture = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.current.size === 2) {
      const [a, b] = [...touches.current.values()];
      const r = viewport.current!.getBoundingClientRect();
      pinch.current = {
        d0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        c0: { ...camRef.current },
        mid0: { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top },
      };
      userMoved.current = true;
      setPending(null);
      setDragging(null);
    }
  };

  useEffect(() => {
    const move = (ev: PointerEvent) => {
      if (!touches.current.has(ev.pointerId)) return;
      touches.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      const p = pinch.current;
      if (!p || touches.current.size < 2 || !viewport.current) return;
      const [a, b] = [...touches.current.values()];
      const r = viewport.current.getBoundingClientRect();
      const mid = { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top };
      const z = Math.min(2.4, Math.max(0.15, p.c0.z * (Math.hypot(a.x - b.x, a.y - b.y) / p.d0)));
      // keep the world point under the starting midpoint under the fingers
      const wx = (p.mid0.x - p.c0.x) / p.c0.z;
      const wy = (p.mid0.y - p.c0.y) / p.c0.z;
      setCam({ z, x: mid.x - wx * z, y: mid.y - wy * z });
    };
    const up = (ev: PointerEvent) => {
      touches.current.delete(ev.pointerId);
      if (touches.current.size < 2) {
        // let the release of the last finger finish before handlers check the flag
        window.setTimeout(() => {
          if (touches.current.size < 2) pinch.current = null;
        }, 0);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  const startPan = (e: React.PointerEvent) => {
    const sx = e.clientX;
    const sy = e.clientY;
    const c0 = { ...camRef.current };
    let moved = false;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      if (pinch.current) {
        moved = true;
        return;
      }
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 3) moved = userMoved.current = true;
      setCam({ ...c0, x: c0.x + ev.clientX - sx, y: c0.y + ev.clientY - sy });
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      viewport.current?.classList.remove('panning');
      if (!moved && !pinch.current) onBackgroundClick?.();
    };
    viewport.current?.classList.add('panning');
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const cardUnder = (clientX: number, clientY: number): string | null => {
    const els = document.elementsFromPoint(clientX, clientY);
    for (const el of els) {
      const card = (el as HTMLElement).closest?.('[data-card-id]') as HTMLElement | null;
      if (card && viewport.current?.contains(card)) return card.dataset.cardId!;
    }
    return null;
  };

  const finishYarn = (fromId: string, clientX: number, clientY: number) => {
    const to = cardUnder(clientX, clientY);
    if (to && to !== fromId) {
      onConnect?.(fromId, to);
      setPending(null);
      return true;
    }
    return false;
  };

  const onCardPointerDown = (e: React.PointerEvent, m: Media) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (spaceDown) return startPan(e);

    if (tool === 'yarn') {
      if (pending?.click) {
        if (!finishYarn(pending.from, e.clientX, e.clientY)) setPending(null);
        return;
      }
      const pt = toWorld(e.clientX, e.clientY);
      setPending({ from: m.id, pt, click: false });
      const sx = e.clientX;
      const sy = e.clientY;
      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId || pinch.current) return;
        setPending((p) => (p ? { ...p, pt: toWorld(ev.clientX, ev.clientY) } : p));
      };
      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        if (pinch.current) return setPending(null);
        const movedFar = Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8;
        if (finishYarn(m.id, ev.clientX, ev.clientY)) return;
        // click without drag: keep the thread in hand until the next card
        if (!movedFar) setPending((p) => (p ? { ...p, click: true } : p));
        else setPending(null);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      return;
    }

    if (tool === 'scissors') {
      releaseTouch(e);
      snipping.current = true;
      const up = () => {
        snipping.current = false;
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointerup', up);
      return;
    }

    if (tool === 'place') return;

    // select: drag or click
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = m.x;
    const oy = m.y;
    let moved = false;
    const shift = e.shiftKey;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId || pinch.current) return;
      const dx = (ev.clientX - sx) / camRef.current.z;
      const dy = (ev.clientY - sy) / camRef.current.z;
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < DRAG_THRESHOLD) return;
      if (!editable) return;
      moved = true;
      setDragging(m.id);
      onMove?.(m.id, Math.round(ox + dx), Math.round(oy + dy));
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDragging(null);
      if (!moved && !pinch.current) onCardClick?.(m.id, { shift });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onViewportPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || spaceDown) return startPan(e);
    if (e.button !== 0) return;
    if (tool === 'place') {
      onPlace?.(toWorld(e.clientX, e.clientY));
      return;
    }
    if (tool === 'yarn' && pending?.click) {
      setPending(null);
      return;
    }
    if (tool === 'scissors') {
      releaseTouch(e);
      snipping.current = true;
      const up = () => {
        snipping.current = false;
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointerup', up);
      return;
    }
    startPan(e);
  };

  const onViewportPointerMove = (e: React.PointerEvent) => {
    const r = viewport.current!.getBoundingClientRect();
    if (tool !== 'select') setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
    if (pending?.click) setPending((p) => (p ? { ...p, pt: toWorld(e.clientX, e.clientY) } : p));
  };

  /* ---------- snipping ---------- */
  const snip = (c: Connection, at: Pt) => {
    const a = byId.get(c.from);
    const b = byId.get(c.to);
    if (!a || !b) return;
    const g = connectionGeometry(a, b, rotOf(a), rotOf(b));
    const t = closestT(g.curve, at);
    const cutPt = pointAt(g.curve, t);
    const sag = g.curve.c1.y - (g.curve.p1.y + (g.curve.p2.y - g.curve.p1.y) / 3);
    setGhosts((gs) => [...gs, { id: c.id + Date.now(), color: c.color, a: g.ha.outer, b: g.hb.outer, cut: cutPt, sag }]);
    setSnapKey((k) => k + 1);
    setCut(null);
    onSnip?.([c.id]);
  };

  /* ---------- derived geometry ---------- */
  const geo = useMemo(() => {
    return connections
      .map((c) => {
        const a = byId.get(c.from);
        const b = byId.get(c.to);
        if (!a || !b) return null;
        return { c, a, b, ...connectionGeometry(a, b, rotOf(a), rotOf(b)) };
      })
      .filter(Boolean) as Array<{ c: Connection; a: Media; b: Media; ha: { outer: Pt; inner: Pt }; hb: { outer: Pt; inner: Pt }; curve: Bezier }>;
  }, [connections, byId, rotOf]);

  const dimmed = (id: string) => !!emphasis && !emphasis.has(id);

  const cardRect = (m: Media, fill: string) => {
    const { w, h } = sizeOf(m);
    const c = centerOf(m);
    return <rect x={m.x} y={m.y} width={w} height={h} fill={fill} transform={`rotate(${rotOf(m)} ${c.x} ${c.y})`} />;
  };

  const cursorClass = spaceDown ? 'tool-pan' : `tool-${tool}`;

  return (
    <div
      ref={viewport}
      className={`board-viewport paper-grain ${cursorClass}`}
      onPointerDownCapture={onPointerDownCapture}
      onPointerDown={onViewportPointerDown}
      onPointerMove={onViewportPointerMove}
      onPointerLeave={() => setCursor(null)}
      onDragStart={(e) => e.preventDefault()}
      style={{ backgroundPosition: `${cam.x}px ${cam.y}px`, backgroundSize: `${22 * cam.z}px ${22 * cam.z}px` }}
    >
      <div className="board-world" style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})` }}>
        {backdrop && <Backdrop board={backdrop} />}

        {media.map((m, i) => {
          const isSel = selectedId === m.id;
          const pathIdx = pathSelection.indexOf(m.id);
          const lifted = hovered === m.id || dragging === m.id;
          return (
            <div
              key={m.id}
              className={`card-slot ${dimmed(m.id) ? 'dimmed' : ''} ${glow?.has(m.id) ? 'glow' : ''} ${pulse === m.id ? 'pulse' : ''}`}
              data-card-id={m.id}
              style={{ left: m.x, top: m.y, zIndex: dragging === m.id ? 30 : lifted ? 20 : isSel ? 10 : 1 }}
              onPointerDown={(e) => onCardPointerDown(e, m)}
              onPointerEnter={() => setHovered(m.id)}
              onPointerLeave={() => setHovered((h) => (h === m.id ? null : h))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCardClick?.(m.id, { shift: e.shiftKey });
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${m.title}${m.origin ? ', ' + m.origin : ''}`}
            >
              <motion.div
                className={`card-motion ${isSel ? 'selected' : ''} ${pathIdx >= 0 ? 'in-path' : ''}`}
                initial={{ opacity: 0, scale: 1.06, y: -14, rotate: m.rot * 2 }}
                animate={{
                  opacity: 1,
                  scale: dragging === m.id ? 1.04 : lifted ? 1.02 : 1,
                  y: lifted ? -4 : 0,
                  rotate: rotOf(m),
                }}
                transition={{
                  type: 'spring', stiffness: 380, damping: 26,
                  opacity: { duration: 0.25, delay: Math.min(i * 0.025, 0.4) },
                }}
                style={{ boxShadow: lifted ? 'var(--shadow-lift)' : undefined }}
              >
                <MediaCard m={m} />
                {pathIdx >= 0 && <span className="path-badge mono">{pathIdx + 1}</span>}
              </motion.div>
            </div>
          );
        })}

        {placeGhost && cursor && (
          <div
            className="place-ghost"
            style={{
              left: (cursor.x - cam.x) / cam.z - sizeOf(placeGhost).w / 2,
              top: (cursor.y - cam.y) / cam.z - sizeOf(placeGhost).h / 2,
              transform: `rotate(${placeGhost.rot}deg)`,
            }}
          >
            <MediaCard m={placeGhost} />
          </div>
        )}

        {/* ---------- yarn ---------- */}
        <svg className="yarn-layer" width="1" height="1" aria-hidden="true">
          <defs>
            {geo.map(({ c, a, b }) => (
              <mask key={c.id} id={`${maskPrefix}-${c.id}`} maskUnits="userSpaceOnUse" x="-6000" y="-6000" width="16000" height="16000">
                <rect x="-6000" y="-6000" width="16000" height="16000" fill="#fff" />
                {cardRect(a, '#000')}
                {cardRect(b, '#000')}
              </mask>
            ))}
          </defs>

          {geo.map(({ c, ha, hb, curve }) => {
            const d = bezierPath(curve);
            const isGlow = glow?.has(c.id);
            const isPulse = pulse === c.id;
            const op = dimmed(c.id) ? 0.16 : 1;
            return (
              <g key={c.id} opacity={op} style={{ transition: 'opacity .3s' }}>
                {traceColor.has(c.id) && (
                  <path d={d} fill="none" style={{ stroke: YARN_HEX[traceColor.get(c.id)!].base }} strokeWidth={13} strokeLinecap="round" opacity={0.28} mask={`url(#${maskPrefix}-${c.id})`} />
                )}
                {(isGlow || isPulse) && (
                  <path d={d} fill="none" className={isPulse ? 'yarn-pulse' : 'yarn-glow'} strokeWidth={14} strokeLinecap="round" mask={`url(#${maskPrefix}-${c.id})`} />
                )}
                <YarnStrand d={d} color={c.color} mask={`url(#${maskPrefix}-${c.id})`} />
                {/* stitches: the thread surfaces at the outer hole and dives at the inner one */}
                {[ha, hb].map((h, i) => (
                  <g key={i}>
                    <YarnStrand d={`M${h.outer.x},${h.outer.y} Q${(h.outer.x + h.inner.x) / 2 + 1},${(h.outer.y + h.inner.y) / 2 - 1.5} ${h.inner.x},${h.inner.y}`} color={c.color} width={2.6} />
                    <circle cx={h.outer.x} cy={h.outer.y} r={2.3} fill="rgba(46,44,42,.55)" />
                    <circle cx={h.inner.x} cy={h.inner.y} r={2.3} fill="rgba(46,44,42,.55)" />
                    <circle cx={h.inner.x} cy={h.inner.y} r={1.2} fill={YARN_HEX[c.color].deep} />
                  </g>
                ))}
                {tool === 'scissors' && (
                  <path
                    d={d}
                    className="yarn-hit"
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    mask={`url(#${maskPrefix}-${c.id})`}
                    onPointerMove={(e) => setCut({ id: c.id, pt: toWorld(e.clientX, e.clientY) })}
                    onPointerLeave={() => setCut((x) => (x?.id === c.id ? null : x))}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      releaseTouch(e);
                      snipping.current = true;
                      const up = () => {
                        snipping.current = false;
                        window.removeEventListener('pointerup', up);
                      };
                      window.addEventListener('pointerup', up);
                      snip(c, toWorld(e.clientX, e.clientY));
                    }}
                    onPointerEnter={(e) => {
                      if (snipping.current && e.buttons === 1) snip(c, toWorld(e.clientX, e.clientY));
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* hovered string for scissors: highlight + dotted cut mark */}
          {tool === 'scissors' && cut && (() => {
            const g = geo.find((x) => x.c.id === cut.id);
            if (!g) return null;
            const t = closestT(g.curve, cut.pt);
            const p = pointAt(g.curve, t);
            const p2 = pointAt(g.curve, Math.min(1, t + 0.01));
            const ang = Math.atan2(p2.y - p.y, p2.x - p.x) + Math.PI / 2;
            const L = 16;
            return (
              <g style={{ pointerEvents: 'none' }}>
                <path d={bezierPath(g.curve)} fill="none" stroke="rgba(224,94,49,.18)" strokeWidth={10} strokeLinecap="round" mask={`url(#${maskPrefix}-${g.c.id})`} />
                <line
                  x1={p.x - Math.cos(ang) * L} y1={p.y - Math.sin(ang) * L}
                  x2={p.x + Math.cos(ang) * L} y2={p.y + Math.sin(ang) * L}
                  stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="2 3" strokeLinecap="round"
                />
                <text x={p.x + 12} y={p.y - 16} className="cut-label">cut here</text>
              </g>
            );
          })()}

          {ghosts.map((g) => (
            <SnipGhost key={g.id} g={g} onDone={() => setGhosts((gs) => gs.filter((x) => x.id !== g.id))} />
          ))}

          {pending && byId.get(pending.from) && <PendingYarn from={byId.get(pending.from)!} pt={pending.pt} color={yarnColor} />}
        </svg>

        {/* ---------- tags and charms hanging on strings ---------- */}
        <div className="string-ornaments">
          {geo.map(({ c, curve }) => {
            const mid = pointAt(curve, 0.5);
            const st = pointAt(curve, 0.28);
            const via = c.via ? person(c.via) : undefined;
            const op = dimmed(c.id) ? 0.16 : 1;
            return (
              <div key={c.id} style={{ opacity: op, transition: 'opacity .3s' }}>
                {c.why && (
                  <WhyTag
                    pt={mid}
                    text={c.why}
                    color={c.color}
                    onClick={onTagClick ? () => onTagClick(c.id) : undefined}
                  />
                )}
                {via && (
                  <div className="string-stamp" style={{ left: st.x, top: st.y }}>
                    <MiniStamp personId={via.id} size={24} />
                    <span className="string-stamp-label mono">
                      added via a Crossing with {via.name.split(' ')[0]} · {fmtMonth(c.addedAt)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {screenOverlay?.(toScreen, cam)}

      {/* custom tool cursors */}
      {cursor && tool === 'yarn' && !spaceDown && <NeedleCursor x={cursor.x} y={cursor.y} color={yarnColor} holding={!!pending} />}
      {cursor && tool === 'scissors' && !spaceDown && <ScissorsCursor x={cursor.x} y={cursor.y} snapKey={snapKey} />}

      <div className="zoom-control" onPointerDown={(e) => e.stopPropagation()}>
        <button onClick={() => zoomAt(1 / 1.2)} aria-label="Zoom out">
          <IconMinus size={16} />
        </button>
        <button className="mono zoom-pct" onClick={() => fit(true)} aria-label="Fit board to screen" title="fit to screen">
          {Math.round(cam.z * 100)}%
        </button>
        <button onClick={() => zoomAt(1.2)} aria-label="Zoom in">
          <IconPlus size={16} />
        </button>
      </div>
    </div>
  );
}

export const fmtMonth = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

/* ---------- pieces ---------- */

function WhyTag({ pt, text, color, onClick }: { pt: Pt; text: string; color: Accent; onClick?: () => void }) {
  return (
    <div className="why-tag" style={{ left: pt.x, top: pt.y }}>
      <svg className="why-loop" width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
        <path d="M7 0 C 3 4, 11 7, 7 14" fill="none" stroke={YARN_HEX[color].deep} strokeWidth="1" strokeLinecap="round" />
      </svg>
      <button
        className="tag-paper"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClick}
        aria-label={`why: ${text}`}
        tabIndex={onClick ? 0 : -1}
      >
        <span className="tag-hole" />
        <span className="tag-lines" />
      </button>
      <div className="tag-reveal" role="tooltip">
        <p>{text}</p>
        {onClick && <span className="mono">click to edit</span>}
      </div>
    </div>
  );
}

function PendingYarn({ from, pt, color }: { from: Media; pt: Pt; color: Accent }) {
  const [t, setT] = useState(0);
  useAnimationFrame((time) => setT(time));
  const h = holesFor(from, pt);
  const d = Math.hypot(pt.x - h.outer.x, pt.y - h.outer.y);
  const sag = Math.min(90, 20 + d * 0.22) + Math.sin(t / 170) * 6;
  const sway = Math.cos(t / 230) * 5;
  const curve = sagCurve(h.outer, pt, sag, sway);
  return (
    <g>
      <YarnStrand d={bezierPath(curve)} color={color} />
      <YarnStrand d={`M${h.outer.x},${h.outer.y} L${h.inner.x},${h.inner.y}`} color={color} width={2.6} />
      <circle cx={h.outer.x} cy={h.outer.y} r={2.3} fill="rgba(46,44,42,.55)" />
      <circle cx={h.inner.x} cy={h.inner.y} r={2.3} fill="rgba(46,44,42,.55)" />
    </g>
  );
}

function SnipGhost({ g, onDone }: { g: Ghost; onDone: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const ctl = animate(0, 1, { duration: 0.95, ease: [0.3, 0.1, 0.4, 1], onUpdate: setP, onComplete: onDone });
    return () => ctl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ease = p * p * (3 - 2 * p);
  const half = (anchor: Pt) => {
    const fall = { x: anchor.x + (g.cut.x - anchor.x) * 0.22, y: anchor.y + 64 };
    const end = { x: g.cut.x + (fall.x - g.cut.x) * ease, y: g.cut.y + (fall.y - g.cut.y) * ease };
    const curve = sagCurve(anchor, end, g.sag * 0.5 * (1 - ease) + 6 * ease);
    // frayed fibers at the cut end
    const dir = Math.atan2(end.y - curve.c2.y, end.x - curve.c2.x);
    const fibers = [-0.6, 0, 0.55].map((o, i) => {
      const len = 5 + i * 1.5;
      return `M${end.x},${end.y} l${Math.cos(dir + o) * len},${Math.sin(dir + o) * len}`;
    });
    return { d: bezierPath(curve), fibers };
  };
  const A = half(g.a);
  const B = half(g.b);
  const opacity = p < 0.45 ? 1 : 1 - (p - 0.45) / 0.55;
  const c = YARN_HEX[g.color];
  return (
    <g opacity={opacity}>
      {[A, B].map((h, i) => (
        <g key={i}>
          <YarnStrand d={h.d} color={g.color} />
          {h.fibers.map((f, j) => (
            <path key={j} d={f} stroke={j === 1 ? c.deep : c.base} strokeWidth={1.1} strokeLinecap="round" fill="none" />
          ))}
        </g>
      ))}
    </g>
  );
}

function NeedleCursor({ x, y, color, holding }: { x: number; y: number; color: Accent; holding: boolean }) {
  const c = YARN_HEX[color];
  return (
    <svg className="tool-cursor" style={{ left: x - 4, top: y - 30 }} width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M4 30 L26 4" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="23.5" cy="7" rx="1.2" ry="3" transform="rotate(40 23.5 7)" fill="none" stroke="var(--ink)" strokeWidth="1" />
      {!holding && <path d="M23.5 7 C 32 10, 26 22, 38 26 S 40 38, 34 40" fill="none" stroke={c.base} strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  );
}

function ScissorsCursor({ x, y, snapKey }: { x: number; y: number; snapKey: number }) {
  return (
    <svg className="tool-cursor" style={{ left: x - 22, top: y - 22 }} width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <g transform="translate(22 22)">
        <motion.g key={`a${snapKey}`} initial={{ rotate: snapKey ? -2 : -16 }} animate={{ rotate: [-2, -16] }} transition={{ duration: 0.28 }} style={{ originX: '0px', originY: '0px' }}>
          <path d="M0 0 L22 -4" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="-9" cy="3" r="5" fill="var(--card-white)" stroke="var(--ink)" strokeWidth="1.5" />
          <path d="M0 0 L-5 2" stroke="var(--ink)" strokeWidth="1.5" />
        </motion.g>
        <motion.g key={`b${snapKey}`} initial={{ rotate: snapKey ? 2 : 16 }} animate={{ rotate: [2, 16] }} transition={{ duration: 0.28 }} style={{ originX: '0px', originY: '0px' }}>
          <path d="M0 0 L22 4" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="-9" cy="-3" r="5" fill="var(--card-white)" stroke="var(--tangerine)" strokeWidth="1.5" />
          <path d="M0 0 L-5 -2" stroke="var(--ink)" strokeWidth="1.5" />
        </motion.g>
        <circle r="1.4" fill="var(--ink)" />
      </g>
    </svg>
  );
}

function Backdrop({ board }: { board: Board }) {
  const byId = new Map(board.media.map((m) => [m.id, m]));
  return (
    <div className="backdrop-layer" aria-hidden="true">
      {board.media.map((m) => (
        <div key={m.id} className="card-slot" style={{ left: m.x, top: m.y, transform: `rotate(${m.rot}deg)` }}>
          <MediaCard m={m} showStamp={false} />
        </div>
      ))}
      <svg className="yarn-layer" width="1" height="1">
        {board.connections.map((c) => {
          const a = byId.get(c.from);
          const b = byId.get(c.to);
          if (!a || !b) return null;
          return <YarnStrand key={c.id} d={bezierPath(connectionGeometry(a, b).curve)} color={c.color} />;
        })}
      </svg>
    </div>
  );
}

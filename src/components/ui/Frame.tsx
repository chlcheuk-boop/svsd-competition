import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { IconCards, IconPassport } from './icons';
import { useStore } from '../../store/store';
import { MAYA } from '../../data/people';
import { Logo } from './Logo';
import './frame.css';

export function TopNav() {
  const { state } = useStore();
  const loc = useLocation();
  const items = [
    { to: '/matches', label: 'Matches of the week', icon: <IconCards />, dot: !state.matchesSeen },
    { to: '/passport', label: 'Passport', icon: <IconPassport /> },
  ];
  return (
    <nav className="topnav" aria-label="Main">
      <NavLink to="/" className="nav-logo" aria-label="Purl, back to my board">
        <Logo size={30} />
      </NavLink>
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `nav-round ${isActive || loc.pathname.startsWith(it.to) ? 'active' : ''}`}
          aria-label={it.label}
          data-nav={it.to.slice(1)}
        >
          {it.icon}
          {it.dot && <span className="nav-dot" aria-label="new matches" />}
          <span className="nav-tip">{it.label}</span>
        </NavLink>
      ))}
      {loc.pathname !== '/' && (
        <NavLink to="/" className="nav-home mono">
          ← my board
        </NavLink>
      )}
    </nav>
  );
}

export function Avatar({ size = 44, label = MAYA.initial, color = 'var(--pink)', ink = 'var(--ink)' }: {
  size?: number; label?: string; color?: string; ink?: string;
}) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: color, color: ink, fontSize: size * 0.42 }}>
      <span className="avatar-initial">{label}</span>
    </span>
  );
}

export function AvatarButton() {
  const nav = useNavigate();
  return (
    <button className="avatar-btn" onClick={() => nav('/settings')} aria-label="Your profile and settings">
      <Avatar />
    </button>
  );
}

export interface Tool {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function Toolbar({ tools, children }: { tools: Tool[]; children?: ReactNode }) {
  return (
    <div className="toolbar-wrap">
      <AnimatePresence>{children}</AnimatePresence>
      <motion.div
        className="toolbar"
        role="toolbar"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <svg className="toolbar-edge" viewBox="0 0 400 10" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 10 L0 4 Q 10 0 20 4 T 40 4 T 60 4 T 80 4 T 100 4 T 120 4 T 140 4 T 160 4 T 180 4 T 200 4 T 220 4 T 240 4 T 260 4 T 280 4 T 300 4 T 320 4 T 340 4 T 360 4 T 380 4 T 400 4 L400 10 Z" fill="var(--card-white)" />
        </svg>
        {tools.map((t) => (
          <button
            key={t.id}
            className={`tool ${t.active ? 'active' : ''}`}
            onClick={t.onClick}
            aria-pressed={t.active}
            disabled={t.disabled}
            data-tool={t.id}
          >
            <span className="tool-icon">{t.icon}</span>
            <span className="tool-label mono">{t.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- toasts ---------- */
interface ToastMsg {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}
const ToastCtx = createContext<(t: Omit<ToastMsg, 'id'>, ms?: number) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const timer = useRef<number>();
  const show = useCallback((t: Omit<ToastMsg, 'id'>, ms = 3200) => {
    window.clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), ms);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 8, x: '-50%' }}
          >
            <span>{toast.text}{toast.action && " ·"}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.run();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastCtx.Provider>
  );
}

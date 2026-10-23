import { useEffect } from 'react';
import { playerById, END_LABEL } from './seed.js';
import { winnerOf, norm } from './stats.js';

export const Ball = ({ className = 'ball' }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <defs><clipPath id="ballclip"><circle cx="32" cy="32" r="29" /></clipPath></defs>
    <circle cx="32" cy="32" r="29" fill="#f4f7f2" />
    <g clipPath="url(#ballclip)" fill="#0b1a10" stroke="#0b1a10" strokeWidth="2.5" strokeLinejoin="round">
      <polygon points="32,21 42.5,28.6 38.5,41 25.5,41 21.5,28.6" />
      <path d="M32 21V9M42.5 28.6l11.4-3.7M38.5 41l7 9.7M25.5 41l-7 9.7M21.5 28.6l-11.4-3.7" fill="none" />
      <polygon points="32,10 25,3 39,3" /><polygon points="53,24 62,20 60,34" /><polygon points="45,50 56,52 47,62" />
      <polygon points="19,50 8,52 17,62" /><polygon points="11,24 2,20 4,34" />
    </g>
    <circle cx="32" cy="32" r="29" fill="none" stroke="#0b1a10" strokeWidth="2" />
  </svg>
);

const I = (d) => (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{d}</svg>
);
export const Icon = {
  home: I(<><path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /></>),
  vs: I(<><path d="M4 4l6 16M16 4l-2 6M14 10c-2 1-2 4 0 5s5 0 6 3-3 4-6 2" /></>),
  plus: I(<path d="M12 5v14M5 12h14" strokeWidth="3" />),
  boot: I(<><path d="M3 17h18v2H3zM4 17V8l5-3 3 5 6 2c2 .7 3 2 3 5" /></>),
  user: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>),
  trophy: I(<><path d="M8 4h8v5a4 4 0 01-8 0zM8 6H4c0 3 2 5 4 5M16 6h4c0 3-2 5-4 5M12 13v4M8 21h8M9 17h6v4H9z" /></>),
  camera: I(<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>),
  bell: I(<><path d="M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4" /></>),
};

export const Avatar = ({ id, size = '' }) => {
  const p = playerById(id);
  return <div className={'avatar ' + size} style={{ background: p.color }}>{p.name.slice(0, 1)}</div>;
};

const hash = (s) => [...norm(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export const clubInitials = (name = '') => {
  const words = name.replace(/\b(actual|\d{2,4})\b/gi, '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase();
};
export const clubColors = (name) => {
  const a = hash(name || '?') % 360;
  return [`hsl(${a} 60% 42%)`, `hsl(${(a + 40) % 360} 55% 22%)`];
};
export const ClubBadge = ({ name, small }) => {
  const [c1, c2] = clubColors(name);
  return (
    <div className={'club' + (small ? ' sm' : '')}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      {clubInitials(name)}
    </div>
  );
};

export function fmtDate(ts, withTime = false) {
  if (!ts) return '';
  const d = new Date(ts);
  const opts = { day: 'numeric', month: 'short' };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  const s = d.toLocaleDateString('es-AR', opts);
  return withTime ? `${s} · ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : s;
}

export function MatchCard({ m, onClick }) {
  const w = winnerOf(m);
  const side = (pid, club, right) => (
    <div className={'side' + (right ? ' right' : '') + (w === pid ? ' win' : '')}>
      <Avatar id={pid} size="sm" />
      <div className="who">
        <div className="pname">{playerById(pid).name}</div>
        <div className="cname">{club}</div>
      </div>
    </div>
  );
  return (
    <button className="card match" onClick={onClick}>
      <div className="match-meta">
        <span>{fmtDate(m.date)}{m.hasPhoto ? ' · 📷' : ''}</span>
        <span className={'tag t' + m.end}>{END_LABEL[m.end]}</span>
      </div>
      <div className="score-line">
        {side(m.p1, m.c1)}
        <div className="scoreboard">
          <span className={w === m.p1 ? '' : 'lose'}>{m.g1}</span>
          <span className="sep">-</span>
          <span className={w === m.p2 ? '' : 'lose'}>{m.g2}</span>
        </div>
        {side(m.p2, m.c2, true)}
      </div>
      {m.end === 'pen' && <div className="pen-note">Penales {m.pen1} - {m.pen2}</div>}
    </button>
  );
}

export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({ text, okText = 'Sí', danger, onOk, onCancel }) {
  return (
    <Sheet title="¿Seguro?" onClose={onCancel}>
      <p className="muted">{text}</p>
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn grow" onClick={onCancel}>Cancelar</button>
        <button className={'btn grow ' + (danger ? 'danger' : 'primary')} onClick={onOk}>{okText}</button>
      </div>
    </Sheet>
  );
}

export const Stepper = ({ value, onChange, min = 0 }) => (
  <div className="stepper">
    <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Restar">−</button>
    <div className="val">{value}</div>
    <button type="button" onClick={() => onChange(value + 1)} aria-label="Sumar">+</button>
  </div>
);

export const Seg = ({ options, value, onChange }) => (
  <div className="seg">
    {options.map((o) => (
      <button type="button" key={o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
        {o.label}{o.sub && <small>{o.sub}</small>}
      </button>
    ))}
  </div>
);

export const FormDots = ({ form }) => (
  <div className="form-dots">{form.map((f, i) => <span key={i} className={f}>{f}</span>)}</div>
);

import { useState } from 'react';
import { PLAYERS, playerById } from '../seed.js';
import { Avatar, MatchCard } from '../components.jsx';

export default function H2H({ stats, me, includeBaseline, onOpenMatch }) {
  const [a, setA] = useState(me);
  const [b, setB] = useState(PLAYERS.find((p) => p.id !== me).id);
  const h = stats.h2h(a, b);
  const total = h.winsA + h.winsB;
  const pa = playerById(a), pb = playerById(b);

  const Picker = ({ value, other, onChange }) => (
    <div className="row" style={{ gap: 10 }}>
      {PLAYERS.map((p) => (
        <button key={p.id} disabled={p.id === other} onClick={() => onChange(p.id)} aria-label={p.name}
          style={{ opacity: p.id === value ? 1 : p.id === other ? 0.12 : 0.4, transition: '.15s' }}>
          <Avatar id={p.id} size="sm" />
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="section-title">Cara a cara <small>{includeBaseline ? 'Histórico completo' : 'Esta temporada'}</small></div>
      <div className="card">
        <div className="h2h-big">
          <div>
            <div style={{ display: "grid", placeItems: "center" }}><Avatar id={a} /></div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{pa.name}</div>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <span className="num" style={{ color: h.winsA >= h.winsB ? pa.color : 'var(--muted)' }}>{h.winsA}</span>
            <span className="muted" style={{ fontFamily: 'var(--display)', fontSize: 22 }}>VS</span>
            <span className="num" style={{ color: h.winsB >= h.winsA ? pb.color : 'var(--muted)' }}>{h.winsB}</span>
          </div>
          <div>
            <div style={{ display: "grid", placeItems: "center" }}><Avatar id={b} /></div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{pb.name}</div>
          </div>
        </div>
        <div className="h2h-bar">
          <div style={{ width: total ? `${(h.winsA / total) * 100}%` : '50%', background: pa.color }} />
          <div style={{ flex: 1, background: pb.color }} />
        </div>
        <p className="center muted" style={{ fontSize: 12, margin: '10px 0 4px' }}>
          {total} partidos ganados entre los dos
          {h.matches.length > 0 && <> · Goles en la app: {h.goalsA} - {h.goalsB}</>}
        </p>
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <div className="row"><span className="muted" style={{ fontSize: 12, width: 64 }}>Jugador 1</span><Picker value={a} other={b} onChange={setA} /></div>
          <div className="row"><span className="muted" style={{ fontSize: 12, width: 64 }}>Jugador 2</span><Picker value={b} other={a} onChange={setB} /></div>
        </div>
      </div>

      <div className="section-title">Todos contra todos <small>victorias de la fila</small></div>
      <div className="card" style={{ padding: '6px 10px' }}>
        <table className="matrix">
          <thead><tr><th /> {PLAYERS.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
          <tbody>
            {PLAYERS.map((r) => (
              <tr key={r.id}>
                <th style={{ textAlign: 'left', color: r.color }}>{r.name}</th>
                {PLAYERS.map((c) => {
                  if (r.id === c.id) return <td key={c.id} className="self">—</td>;
                  const x = stats.h2h(r.id, c.id);
                  return <td key={c.id} style={{ fontWeight: x.winsA > x.winsB ? 800 : 400, color: x.winsA > x.winsB ? 'var(--accent)' : undefined }}>{x.winsA}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">Partidos entre {pa.name} y {pb.name}</div>
      {h.matches.length === 0
        ? <div className="card empty">Todavía no hay partidos entre ellos cargados en la app.</div>
        : h.matches.map((m) => <MatchCard key={m.id} m={m} onClick={() => onOpenMatch(m)} />)}
    </>
  );
}

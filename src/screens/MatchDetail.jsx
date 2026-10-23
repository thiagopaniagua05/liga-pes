import { useEffect, useState } from 'react';
import { playerById, END_LABEL, POINTS } from '../seed.js';
import { MatchCard, fmtDate, Confirm } from '../components.jsx';
import { winnerOf } from '../stats.js';

export default function MatchDetail({ store, m, onEdit, onDeleted }) {
  const [photo, setPhoto] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const w = winnerOf(m);

  useEffect(() => {
    let alive = true;
    if (m.hasPhoto) store.get('photos', m.id).then((p) => alive && setPhoto(p?.data || null)).catch(() => {});
    return () => { alive = false; };
  }, [m.id, m.hasPhoto]);

  const list = (side) => (m.scorers || []).filter((s) => s.side === side);

  return (
    <div>
      <MatchCard m={m} onClick={() => {}} />
      <p className="center" style={{ fontSize: 13, margin: '10px 0' }}>
        Ganó <b style={{ color: playerById(w).color }}>{playerById(w).name}</b> en {END_LABEL[m.end].toLowerCase()} · +{POINTS[m.end]} {POINTS[m.end] === 1 ? 'punto' : 'puntos'}
      </p>

      {(m.scorers || []).length > 0 && (
        <div className="card">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            {[1, 2].map((side) => (
              <div key={side} className="grow" style={{ textAlign: side === 1 ? 'left' : 'right' }}>
                {list(side).map((s) => (
                  <div key={s.name} style={{ fontSize: 13, padding: '3px 0' }}>⚽ {s.name}{s.goals > 1 ? ` ×${s.goals}` : ''}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {m.hasPhoto && (photo ? <img className="photo" src={photo} alt="Foto del resultado" /> : <p className="muted center">Cargando foto…</p>)}

      <div style={{ marginTop: 14 }}>
        <span className="label">Historial</span>
        <div className="log-item">🗓 Jugado el {fmtDate(m.date, true)}</div>
        {(m.log || []).map((l, i) => (
          <div key={i} className="log-item">✏️ {playerById(l.by).name} {l.action} el partido · {fmtDate(l.at, true)}</div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn danger" onClick={() => setConfirm(true)}>Borrar</button>
        <button className="btn primary grow" onClick={onEdit}>Editar partido</button>
      </div>

      {confirm && (
        <Confirm danger okText="Borrar" text="Se va a borrar este partido para todos y se recalcula la tabla."
          onCancel={() => setConfirm(false)}
          onOk={async () => {
            if (m.hasPhoto) await store.remove('photos', m.id);
            await store.remove('matches', m.id);
            onDeleted();
          }} />
      )}
    </div>
  );
}

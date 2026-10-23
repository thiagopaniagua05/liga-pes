import { useState } from 'react';
import { playerById } from '../seed.js';
import { Avatar, MatchCard } from '../components.jsx';

export default function Home({ stats, includeBaseline, onOpenMatch, onOpenPlayer, onNewMatch }) {
  const [limit, setLimit] = useState(10);
  const max = Math.max(1, ...stats.ranking.map((r) => r.pts));
  const recent = [...stats.matches].reverse();

  return (
    <>
      <div className="section-title">
        Tabla general <small>{includeBaseline ? 'Histórico completo' : 'Esta temporada'}</small>
      </div>
      <div className="table-head"><span style={{ width: 22 }}>#</span><span style={{ width: 40 }} /><span className="grow">JUGADOR</span><span>PTS</span></div>
      <div className="card" style={{ padding: 0 }}>
        {stats.ranking.map((r, i) => {
          const p = playerById(r.id);
          return (
            <button key={r.id} className="rank-row" onClick={() => onOpenPlayer(r.id)}>
              <div className={'rank-pos p' + (i + 1)}>{i + 1}</div>
              <Avatar id={r.id} />
              <div className="grow">
                <div className="rank-name">{p.name}</div>
                <div className="rank-sub">{r.pj} PJ · {r.pg} G · {r.pp} P{r.pj ? ` · ${Math.round((r.pg / r.pj) * 100)}%` : ''}{r.apj ? ` · ${(r.gf / r.apj).toFixed(1)} ⚽/PJ` : ''}</div>
              </div>
              <div className="rank-pts">{r.pts}<small>PUNTOS</small></div>
              <div className="rank-bar" style={{ width: `${(r.pts / max) * 100}%`, background: p.color }} />
            </button>
          );
        })}
      </div>

      <div className="section-title">Últimos partidos <small>{recent.length} cargados</small></div>
      {recent.length === 0 ? (
        <div className="card empty">
          Todavía no hay partidos {includeBaseline ? 'cargados en la app' : 'en esta temporada'}.<br />
          <button className="btn primary small" style={{ marginTop: 12 }} onClick={onNewMatch}>Cargar el primero</button>
        </div>
      ) : (
        <>
          {recent.slice(0, limit).map((m) => <MatchCard key={m.id} m={m} onClick={() => onOpenMatch(m)} />)}
          {recent.length > limit && (
            <button className="btn block" style={{ marginTop: 10 }} onClick={() => setLimit(limit + 20)}>Ver más</button>
          )}
        </>
      )}
    </>
  );
}

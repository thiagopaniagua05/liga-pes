import { useState } from 'react';
import { playerById } from '../seed.js';
import { Avatar, ClubBadge, FormDots, Confirm, Sheet, fmtDate } from '../components.jsx';
import { playerStats, norm, seasonChampion } from '../stats.js';

export default function Profile({ pid, me, store, stats, scopedMatches, allMatches, clubs, seasons, includeBaseline, notif, onLogout }) {
  const isMe = pid === me;
  const p = playerById(pid);
  const pos = stats.ranking.findIndex((r) => r.id === pid);
  const row = stats.ranking[pos];
  const ps = playerStats(pid, scopedMatches);
  const myClubs = clubs.filter((c) => c.owner === pid).sort((a, b) => (b.active - a.active) || a.name.localeCompare(b.name));

  const [clubName, setClubName] = useState('');
  const [err, setErr] = useState('');
  const [seasonSheet, setSeasonSheet] = useState(false);

  async function addClub() {
    const name = clubName.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const ex = clubs.find((c) => norm(c.name) === norm(name));
    if (ex) {
      if (ex.owner !== pid) return setErr(`"${ex.name}" ya es de ${playerById(ex.owner).name}.`);
      if (!ex.active) await store.update('clubs', ex.id, { active: true });
    } else {
      await store.set('clubs', store.newId('clubs'), { name, owner: pid, active: true, createdAt: Date.now(), createdBy: me });
    }
    setErr(''); setClubName('');
  }

  const streak = ps.current.type ? `${ps.current.n}${ps.current.type === 'G' ? '🔥' : ''}` : '—';
  const streakLabel = ps.current.type === 'G' ? 'Ganados seguidos' : ps.current.type === 'P' ? 'Perdidos seguidos' : 'Racha actual';
  const pct = row?.pj ? Math.round((row.pg / row.pj) * 100) : 0;

  return (
    <>
      <div className="card hero" style={{ marginTop: 6, background: `linear-gradient(135deg, ${p.color}33, var(--card) 60%)` }}>
        <Avatar id={pid} size="lg" />
        <div className="grow">
          <h1>{p.name}</h1>
          <div className="muted" style={{ fontSize: 13 }}>{pos + 1}º en la tabla · {includeBaseline ? 'histórico' : 'temporada'}</div>
        </div>
        <div className="rank-pts" style={{ fontSize: 44 }}>{row?.pts ?? 0}<small>PUNTOS</small></div>
      </div>

      <div className="stat-grid" style={{ marginTop: 10 }}>
        <div className="stat"><div className="v">{row?.pj ?? 0}</div><div className="k">Jugados</div></div>
        <div className="stat"><div className="v">{row?.pg ?? 0}</div><div className="k">Ganados</div></div>
        <div className="stat"><div className="v">{pct}%</div><div className="k">Efectividad</div></div>
        <div className="stat"><div className="v" style={{ color: ps.current.type === 'G' ? 'var(--accent)' : ps.current.type === 'P' ? 'var(--danger)' : undefined }}>{streak}</div><div className="k">{streakLabel}</div></div>
        <div className="stat"><div className="v">{ps.best}</div><div className="k">Mejor racha</div></div>
        <div className="stat"><div className="v">{ps.pj ? ps.ptsAvg.toFixed(2) : '—'}</div><div className="k">Puntos x partido</div></div>
      </div>

      <div className="section-title">En la app <small>{ps.pj} partidos</small></div>
      <div className="stat-grid">
        <div className="stat"><div className="v" style={{ color: 'var(--accent)' }}>{ps.pj ? ps.gfAvg.toFixed(2) : '—'}</div><div className="k">Goles a favor x PJ</div></div>
        <div className="stat"><div className="v" style={{ color: 'var(--danger)' }}>{ps.pj ? ps.gcAvg.toFixed(2) : '—'}</div><div className="k">Goles en contra x PJ</div></div>
        <div className="stat"><div className="v">{ps.gf}:{ps.gc}</div><div className="k">Goles totales</div></div>
        <div className="stat"><div className="v">{ps.clean}</div><div className="k">Vallas invictas</div></div>
        <div className="stat"><div className="v">{ps.hatTricks}</div><div className="k">Hat-tricks</div></div>
        <div className="stat"><div className="v">{ps.gf - ps.gc > 0 ? '+' : ''}{ps.gf - ps.gc}</div><div className="k">Diferencia</div></div>
      </div>
      {ps.pj > 0 && (
        <div className="card" style={{ marginTop: 10, padding: '4px 14px' }}>
          {ps.topScorer && <Fact icon="⚽" label="Su goleador" value={`${ps.topScorer.name} · ${ps.topScorer.goals}`} sub={ps.topScorer.club} />}
          {ps.biggestWin && <Fact icon="💪" label="Mayor victoria" value={`${ps.biggestWin.f}-${ps.biggestWin.c} a ${rivalName(ps.biggestWin.m, pid)}`} sub={fmtDate(ps.biggestWin.m.date)} />}
          {ps.worstLoss && <Fact icon="🤕" label="Peor derrota" value={`${ps.worstLoss.f}-${ps.worstLoss.c} con ${rivalName(ps.worstLoss.m, pid)}`} sub={fmtDate(ps.worstLoss.m.date)} />}
          {ps.victim && <Fact icon="😈" label="Su víctima" value={playerById(ps.victim.id).name} sub={`Le ganó ${ps.victim.pg} y perdió ${ps.victim.pp}`} />}
          {ps.nemesis && <Fact icon="👻" label="Su verdugo" value={playerById(ps.nemesis.id).name} sub={`Le ganó ${ps.nemesis.pp} y perdió ${ps.nemesis.pg}`} />}
        </div>
      )}

      <div className="card" style={{ marginTop: 10 }}>
        <div className="row">
          <div className="grow"><b>Últimos 5</b></div>
          {ps.form.length ? <FormDots form={ps.form} /> : <span className="muted">—</span>}
        </div>
        <div className="row muted" style={{ fontSize: 12, marginTop: 10, justifyContent: 'space-between' }}>
          <span>En 90': <b style={{ color: 'var(--text)' }}>{row?.w90 ?? 0}</b></span>
          <span>En alargue: <b style={{ color: 'var(--text)' }}>{row?.w120 ?? 0}</b></span>
          <span>Por penales: <b style={{ color: 'var(--text)' }}>{row?.wpen ?? 0}</b></span>
        </div>
        {ps.favorite && (
          <div className="row" style={{ marginTop: 12, fontSize: 13 }}>
            <ClubBadge name={ps.favorite.club} small />
            <span>Club más ganador: <b>{ps.favorite.club}</b> ({ps.favorite.pts} pts)</span>
          </div>
        )}
      </div>

      {ps.clubs.length > 0 && (
        <>
          <div className="section-title">Rendimiento por club <small>partidos en la app</small></div>
          <div className="card" style={{ padding: '4px 14px' }}>
            {ps.clubs.map((c) => (
              <div key={c.club} className="list-row">
                <ClubBadge name={c.club} small />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="ellipsis" style={{ fontWeight: 700 }}>{c.club}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{c.pj} PJ · {c.pg} G · {c.gf}:{c.gc}</div>
                </div>
                <div className="goals-num" style={{ fontSize: 24 }}>{c.pts}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">{isMe ? 'Mis clubes' : `Clubes de ${p.name}`} <small>{myClubs.filter((c) => c.active).length} activos</small></div>
      <div className="card" style={{ padding: '4px 14px' }}>
        {myClubs.length === 0 && <div className="empty">Sin clubes todavía.</div>}
        {myClubs.map((c) => (
          <div key={c.id} className="list-row" style={{ opacity: c.active ? 1 : 0.5 }}>
            <ClubBadge name={c.name} small />
            <div className="grow">
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{c.active ? 'En uso' : 'Retirado'}</div>
            </div>
            {isMe && (
              <button className="btn small" onClick={() => store.update('clubs', c.id, { active: !c.active })}>
                {c.active ? 'Retirar' : 'Reactivar'}
              </button>
            )}
          </div>
        ))}
        {isMe && (
          <div style={{ padding: '10px 0' }}>
            <div className="row">
              <input className="input grow" placeholder="Nuevo club (ej: Milan 2005)" value={clubName}
                onChange={(e) => setClubName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addClub()} />
              <button className="btn primary" onClick={addClub}>Agregar</button>
            </div>
            {err && <div className="error">{err}</div>}
            <p className="muted" style={{ fontSize: 11.5, margin: '8px 0 0' }}>Un club que ya usó otro jugador no se puede repetir. Los retirados quedan guardados con sus estadísticas.</p>
          </div>
        )}
      </div>

      {isMe && (
        <>
          <div className="section-title">Ajustes</div>
          <div className="card">
            <div className="row">
              <div className="grow">
                <b>Avisos de partidos nuevos</b>
                <div className="muted" style={{ fontSize: 12 }}>{notif.supported ? 'Te avisa cuando otro carga un partido' : 'Este navegador no permite avisos. En iPhone: instalá la app en la pantalla de inicio.'}</div>
              </div>
              <button className={'switch' + (notif.enabled ? ' on' : '')} onClick={notif.toggle} disabled={!notif.supported} aria-label="Avisos" />
            </div>
          </div>
          <div className="card">
            <button className="row" style={{ width: '100%', textAlign: 'left' }} onClick={() => setSeasonSheet(true)}>
              <div className="grow"><b>🏆 Temporadas</b><div className="muted" style={{ fontSize: 12 }}>Ver campeones y empezar una nueva</div></div>
              <span className="muted">›</span>
            </button>
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            {store.mode === 'demo' && <button className="btn grow" onClick={() => store.reset()}>Reiniciar demo</button>}
            <button className="btn danger grow" onClick={onLogout}>Cerrar sesión</button>
          </div>
        </>
      )}

      {seasonSheet && <Seasons store={store} me={me} seasons={seasons} allMatches={allMatches} onClose={() => setSeasonSheet(false)} />}
    </>
  );
}

function Seasons({ store, me, seasons, allMatches, onClose }) {
  const [confirm, setConfirm] = useState(false);
  const sorted = [...seasons].sort((a, b) => b.startedAt - a.startedAt);
  const active = sorted.find((s) => s.active);
  const nextName = `Temporada ${seasons.length + 1}`;
  const [name, setName] = useState(nextName);

  async function startNew() {
    const now = Date.now();
    if (active) await store.update('seasons', active.id, { active: false, endedAt: now });
    await store.set('seasons', store.newId('seasons'), { name: name.trim() || nextName, startedAt: now, active: true, createdBy: me });
    setConfirm(false);
  }

  return (
    <Sheet title="Temporadas" onClose={onClose}>
      <p className="muted" style={{ fontSize: 13 }}>Cada temporada arranca la tabla en cero. El histórico completo (con el saldo inicial) nunca se pierde.</p>
      {sorted.map((s) => {
        const ms = allMatches.filter((m) => m.seasonId === s.id);
        const champ = seasonChampion(ms);
        return (
          <div key={s.id} className="card">
            <div className="row">
              <div className="grow">
                <b>{s.name}</b> {s.active && <span className="tag t90">EN JUEGO</span>}
                <div className="muted" style={{ fontSize: 12 }}>{fmtDate(s.startedAt)}{s.endedAt ? ` → ${fmtDate(s.endedAt)}` : ''} · {ms.length} partidos</div>
              </div>
              {champ && champ.pts > 0 && (
                <div className="row" style={{ gap: 6 }}>
                  <span>{s.active ? '🥇' : '🏆'}</span>
                  <Avatar id={champ.id} size="sm" />
                  <b>{champ.pts}</b>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="field">
        <label className="label" htmlFor="sname">Nueva temporada</label>
        <input id="sname" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn primary block" style={{ marginTop: 10 }} onClick={() => setConfirm(true)}>Empezar nueva temporada</button>
      </div>
      {confirm && (
        <Confirm okText="Empezar" text={`Se cierra ${active?.name || 'la temporada actual'} y arranca "${name}" con la tabla en cero, para todos.`}
          onCancel={() => setConfirm(false)} onOk={startNew} />
      )}
    </Sheet>
  );
}

const rivalName = (m, pid) => playerById(m.p1 === pid ? m.p2 : m.p1).name;

function Fact({ icon, label, value, sub }) {
  return (
    <div className="list-row">
      <div style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{icon}</div>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="muted" style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
        <div className="ellipsis" style={{ fontWeight: 700 }}>{value}</div>
        {sub && <div className="muted ellipsis" style={{ fontSize: 12 }}>{sub}</div>}
      </div>
    </div>
  );
}

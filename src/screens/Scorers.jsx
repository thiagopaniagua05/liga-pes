import { useState } from 'react';
import { PLAYERS, playerById } from '../seed.js';
import { Avatar, ClubBadge, Seg, fmtDate } from '../components.jsx';
import { norm, leagueRecords } from '../stats.js';

export default function Scorers({ stats, clubs, includeBaseline, onOpenMatch }) {
  const [tab, setTab] = useState('goles');
  const [who, setWho] = useState('all');
  const [limit, setLimit] = useState(25);
  const ownerOf = (club) => clubs.find((c) => norm(c.name) === norm(club))?.owner || null;

  const scorers = stats.scorers
    .map((s) => ({ ...s, owner: ownerOf(s.club) || s.owner }))
    .filter((s) => who === 'all' || s.owner === who);
  const leader = stats.scorers[0] ? { ...stats.scorers[0], owner: ownerOf(stats.scorers[0].club) || stats.scorers[0].owner } : null;

  return (
    <>
      {leader && (
        <div className="golden-hero">
          <div className="gh-text">
            <div className="gh-kicker">🥇 Bota de oro · {includeBaseline ? 'histórico' : 'temporada'}</div>
            <div className="gh-name">{leader.name}</div>
            <div className="gh-sub">{leader.club}{leader.owner ? ` · ${playerById(leader.owner).name}` : ''}</div>
          </div>
          <div className="gh-goals">{leader.goals}<small>GOLES</small></div>
        </div>
      )}
      <div className="section-title" style={leader ? { marginTop: 8 } : undefined}>Estadísticas <small>{includeBaseline ? 'Histórico completo' : 'Esta temporada'}</small></div>
      <Seg value={tab} onChange={setTab} options={[{ value: 'goles', label: '⚽ Goleadores' }, { value: 'goleadas', label: '💥 Goleadas' }, { value: 'records', label: '🏅 Récords' }]} />

      {tab === 'records' ? (
        <Records matches={stats.matches} onOpenMatch={onOpenMatch} />
      ) : tab === 'goles' ? (
        <>
          <div className="chips" style={{ marginTop: 12 }}>
            <button className={'chip' + (who === 'all' ? ' on' : '')} onClick={() => setWho('all')}>Todos</button>
            {PLAYERS.map((p) => (
              <button key={p.id} className={'chip' + (who === p.id ? ' on' : '')} onClick={() => setWho(p.id)}>{p.name}</button>
            ))}
          </div>
          <div className="card" style={{ marginTop: 10, padding: '4px 14px' }}>
            {scorers.length === 0 && <div className="empty">Sin goles todavía.</div>}
            {scorers.slice(0, limit).map((s, i) => (
              <div key={s.name + s.club} className="list-row">
                <div className="pos-badge" style={{ color: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--silver)' : i === 2 ? 'var(--bronze)' : undefined }}>{i + 1}</div>
                <ClubBadge name={s.club} small />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="ellipsis" style={{ fontWeight: 700 }}>{s.name}</div>
                  <div className="muted ellipsis" style={{ fontSize: 12 }}>
                    {s.club}{s.owner ? ` · ${playerById(s.owner).name}` : ''}
                  </div>
                </div>
                <div className="goals-num">{s.goals}</div>
              </div>
            ))}
          </div>
          {scorers.length > limit && <button className="btn block" style={{ marginTop: 10 }} onClick={() => setLimit(limit + 50)}>Ver más</button>}
        </>
      ) : (
        <>
          <p className="muted" style={{ fontSize: 12, margin: '12px 2px' }}>Victorias por 5 goles o más de diferencia. Se agregan solas cuando cargás un partido.</p>
          <div className="card" style={{ padding: '4px 14px' }}>
            {stats.goleadas.length === 0 && <div className="empty">Ninguna goleada todavía.</div>}
            {stats.goleadas.map((g) => (
              <button key={g.id} className="list-row" style={{ width: '100%', textAlign: 'left' }}
                onClick={() => g.match && onOpenMatch(g.match)}>
                <div className="big-score">{g.gw}-{g.gl}</div>
                <Avatar id={g.w} size="sm" />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div><b>{playerById(g.w).name}</b> <span className="muted">vs</span> {playerById(g.l).name}</div>
                  <div className="muted ellipsis" style={{ fontSize: 12 }}>
                    {g.historic ? 'Registro histórico' : `${g.cw} vs ${g.cl} · ${fmtDate(g.date)}`}
                  </div>
                </div>
                <span className="tag" style={{ color: 'var(--danger)' }}>+{g.gw - g.gl}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Rec({ icon, title, who, value, sub, onClick }) {
  return (
    <button className="list-row" style={{ width: '100%', textAlign: 'left' }} onClick={onClick}>
      <div style={{ fontSize: 24, width: 32, textAlign: 'center' }}>{icon}</div>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="muted" style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</div>
        <div className="row" style={{ gap: 6, marginTop: 2 }}>
          {who && <Avatar id={who} size="sm" />}
          <div className="ellipsis" style={{ fontWeight: 700 }}>{sub}</div>
        </div>
      </div>
      <div className="goals-num" style={{ fontSize: 24, minWidth: 0 }}>{value}</div>
    </button>
  );
}

function Records({ matches, onOpenMatch }) {
  const r = leagueRecords(matches);
  if (!r) return <div className="card empty" style={{ marginTop: 12 }}>Los récords aparecen cuando carguen partidos en la app.</div>;
  const n = (id) => playerById(id).name;
  const score = (m) => `${n(m.p1)} ${m.g1}-${m.g2} ${n(m.p2)}`;
  return (
    <>
      <div className="stat-grid" style={{ marginTop: 12 }}>
        <div className="stat"><div className="v">{r.total}</div><div className="k">Partidos</div></div>
        <div className="stat"><div className="v">{r.goals}</div><div className="k">Goles</div></div>
        <div className="stat"><div className="v">{r.avgGoals.toFixed(2)}</div><div className="k">Goles x partido</div></div>
        <div className="stat"><div className="v">{r.extra}</div><div className="k">Al alargue</div></div>
        <div className="stat"><div className="v">{r.pens}</div><div className="k">A penales</div></div>
        <div className="stat"><div className="v">{r.total ? Math.round(((r.extra + r.pens) / r.total) * 100) : 0}%</div><div className="k">Sin definir en 90'</div></div>
      </div>

      <div className="section-title">Récords</div>
      <div className="card" style={{ padding: '4px 14px' }}>
        <Rec icon="💥" title="Mayor goleada" who={r.biggest.g1 > r.biggest.g2 ? r.biggest.p1 : r.biggest.p2} value={`+${Math.abs(r.biggest.g1 - r.biggest.g2)}`} sub={score(r.biggest)} onClick={() => onOpenMatch(r.biggest)} />
        <Rec icon="🎆" title="Partido con más goles" value={r.highest.g1 + r.highest.g2} sub={score(r.highest)} onClick={() => onOpenMatch(r.highest)} />
        {r.bestGame && <Rec icon="🎩" title="Más goles de un jugador en un partido" who={r.bestGame.owner} value={r.bestGame.goals} sub={`${r.bestGame.name} (${r.bestGame.club})`} onClick={() => onOpenMatch(r.bestGame.m)} />}
        {r.longestStreak && <Rec icon="🔥" title="Racha más larga de victorias" who={r.longestStreak.id} value={r.longestStreak.value} sub={n(r.longestStreak.id)} />}
        {r.bestAttack && <Rec icon="⚔️" title="Mejor ataque (goles x partido)" who={r.bestAttack.id} value={r.bestAttack.value.toFixed(2)} sub={n(r.bestAttack.id)} />}
        {r.bestDefense && <Rec icon="🧱" title="Mejor defensa (recibe x partido)" who={r.bestDefense.id} value={r.bestDefense.value.toFixed(2)} sub={n(r.bestDefense.id)} />}
        {r.mostClean && <Rec icon="🧤" title="Más vallas invictas" who={r.mostClean.id} value={r.mostClean.value} sub={n(r.mostClean.id)} />}
        {r.mostHatTricks && <Rec icon="🎩" title="Más hat-tricks" who={r.mostHatTricks.id} value={r.mostHatTricks.value} sub={n(r.mostHatTricks.id)} />}
        {r.bestPpm && <Rec icon="📈" title="Más puntos por partido" who={r.bestPpm.id} value={r.bestPpm.value.toFixed(2)} sub={n(r.bestPpm.id)} />}
        {r.penKing && <Rec icon="🎯" title="Rey de los penales" who={r.penKing.id} value={r.penKing.value} sub={`${n(r.penKing.id)} · victorias por penales`} />}
        {r.extraKing && <Rec icon="⏱️" title="Especialista en alargue" who={r.extraKing.id} value={r.extraKing.value} sub={`${n(r.extraKing.id)} · victorias en el 120'`} />}
        <Rec icon="🤝" title="Duelo más jugado" value={r.duel.n} sub={`${n(r.duel.a)} vs ${n(r.duel.b)}`} />
        {r.bestClub && <Rec icon="🏆" title="Club más ganador" who={r.bestClub.owner} value={`${r.bestClub.pts} pts`} sub={r.bestClub.club} />}
        {r.goalClub && <Rec icon="⚽" title="Club más goleador" who={r.goalClub.owner} value={r.goalClub.gf} sub={r.goalClub.club} />}
      </div>
    </>
  );
}

import { useMemo, useState } from 'react';
import { PLAYERS, POINTS, playerById } from '../seed.js';
import { Avatar, ClubBadge, Seg, Stepper, Icon } from '../components.jsx';
import { norm, validateMatch, winnerOf } from '../stats.js';
import { lineupOf } from '../squads.js';
import Pitch from '../Pitch.jsx';

const toLocalInput = (ts) => {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export async function compressImage(file, maxSide = 1100, quality = 0.6) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    let q = quality, side = maxSide, out;
    do {
      const k = Math.min(1, side / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      out = c.toDataURL('image/jpeg', q);
      q -= 0.1; side -= 150;
    } while (out.length > 700000 && q > 0.2);
    return out;
  } finally { URL.revokeObjectURL(url); }
}

export default function MatchForm({ store, me, clubs, allMatches, baseline, seasonId, editing, onDone, onCancel }) {
  const e = editing;
  const [p1, setP1] = useState(e?.p1 || me);
  const [p2, setP2] = useState(e?.p2 || null);
  const [c1, setC1] = useState(e?.c1 || null);
  const [c2, setC2] = useState(e?.c2 || null);
  const [g1, setG1] = useState(e?.g1 ?? 0);
  const [g2, setG2] = useState(e?.g2 ?? 0);
  const [end, setEnd] = useState(e?.end || '90');
  const [pen1, setPen1] = useState(e?.pen1 ?? 0);
  const [pen2, setPen2] = useState(e?.pen2 ?? 0);
  const [scorers, setScorers] = useState(e?.scorers || []);
  const [date, setDate] = useState(toLocalInput(e?.date || Date.now()));
  const [photo, setPhoto] = useState(null); // dataURL nuevo
  const [removePhoto, setRemovePhoto] = useState(false);
  const [newClub, setNewClub] = useState({ 1: '', 2: '' });
  const [addingClub, setAddingClub] = useState({ 1: false, 2: false });
  const [newScorer, setNewScorer] = useState({ 1: '', 2: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const clubsOf = (pid, selected) =>
    clubs.filter((c) => c.owner === pid && (c.active || norm(c.name) === norm(selected || '')))
      .sort((a, b) => a.name.localeCompare(b.name));

  // Jugadores conocidos por club (para sugerir goleadores)
  const knownScorers = useMemo(() => {
    const map = {};
    const add = (club, name, n) => {
      const k = norm(club);
      map[k] = map[k] || {};
      const nk = norm(name);
      map[k][nk] = map[k][nk] || { name, n: 0 };
      map[k][nk].n += n;
    };
    for (const s of baseline?.scorers || []) add(s.club, s.name, s.goals);
    for (const m of allMatches) for (const s of m.scorers || []) add(s.club, s.name, s.goals || 1);
    return map;
  }, [allMatches, baseline]);

  function choosePlayer(side, pid) {
    if (side === 1) { setP1(pid); setC1(null); if (p2 === pid) { setP2(null); setC2(null); } }
    else { setP2(pid); setC2(null); if (p1 === pid) { setP1(null); setC1(null); } }
    setScorers((s) => s.filter((x) => x.side !== side));
  }
  function chooseClub(side, name) {
    side === 1 ? setC1(name) : setC2(name);
    setScorers((s) => s.filter((x) => x.side !== side));
  }

  async function createClub(side) {
    const pid = side === 1 ? p1 : p2;
    const name = newClub[side].trim().replace(/\s+/g, ' ');
    if (!name) return;
    const existing = clubs.find((c) => norm(c.name) === norm(name));
    if (existing && existing.owner !== pid) {
      return setErr(`"${existing.name}" ya es de ${playerById(existing.owner).name}. No se pueden repetir clubes.`);
    }
    setErr('');
    if (existing) {
      if (!existing.active) await store.update('clubs', existing.id, { active: true });
      chooseClub(side, existing.name);
    } else {
      const id = store.newId('clubs');
      await store.set('clubs', id, { name, owner: pid, active: true, createdAt: Date.now(), createdBy: me });
      chooseClub(side, name);
    }
    setNewClub({ ...newClub, [side]: '' });
    setAddingClub({ ...addingClub, [side]: false });
  }

  const goalsOf = (side) => scorers.filter((s) => s.side === side).reduce((a, s) => a + s.goals, 0);
  function addGoal(side, name) {
    name = name.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const club = side === 1 ? c1 : c2;
    setScorers((list) => {
      const i = list.findIndex((s) => s.side === side && norm(s.name) === norm(name));
      if (i >= 0) return list.map((s, j) => (j === i ? { ...s, goals: s.goals + 1 } : s));
      return [...list, { side, name, club, goals: 1 }];
    });
  }
  function subGoal(side, name) {
    setScorers((list) => list.map((s) => (s.side === side && s.name === name ? { ...s, goals: s.goals - 1 } : s)).filter((s) => s.goals > 0));
  }

  async function onPhoto(ev) {
    const f = ev.target.files?.[0];
    if (!f) return;
    try { setPhoto(await compressImage(f)); setRemovePhoto(false); } catch { setErr('No se pudo leer la foto'); }
  }

  async function save() {
    const m = {
      p1, p2, c1, c2, g1, g2, end,
      pen1: end === 'pen' ? pen1 : null, pen2: end === 'pen' ? pen2 : null,
    };
    const v = validateMatch(m);
    if (v) return setErr(v);
    if (goalsOf(1) > g1 || goalsOf(2) > g2) return setErr('Hay más goleadores que goles. Revisá los goleadores.');
    setErr(''); setBusy(true);
    try {
      const id = e?.id || store.newId('matches');
      const now = Date.now();
      const hasPhoto = photo ? true : removePhoto ? false : !!e?.hasPhoto;
      const data = {
        ...m,
        scorers: scorers.map((s) => ({ side: s.side, name: s.name, club: s.side === 1 ? c1 : c2, goals: s.goals })),
        date: new Date(date).getTime() || now,
        seasonId: e?.seasonId || seasonId,
        hasPhoto,
        createdBy: e?.createdBy || me,
        createdAt: e?.createdAt || now,
        log: [...(e?.log || []), { by: me, at: now, action: e ? 'editó' : 'cargó' }].slice(-20),
      };
      if (photo) await store.set('photos', id, { data: photo, by: me, at: now });
      else if (removePhoto && e?.hasPhoto) await store.remove('photos', id);
      await store.set('matches', id, data);
      onDone({ id, ...data }, !e);
    } catch (ex) {
      console.error(ex);
      setErr('No se pudo guardar: ' + (ex.message || ex));
      setBusy(false);
    }
  }

  const draftWinner = (() => {
    if (!p1 || !p2) return null;
    if (end === 'pen') return g1 === g2 && pen1 !== pen2 ? winnerOf({ p1, p2, end, pen1, pen2 }) : null;
    return g1 !== g2 ? winnerOf({ p1, p2, g1, g2, end }) : null;
  })();

  const TeamCol = ({ side }) => {
    const pid = side === 1 ? p1 : p2;
    const club = side === 1 ? c1 : c2;
    const options = pid ? clubsOf(pid, club) : [];
    return (
      <div className="team-col">
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PLAYERS.map((p) => (
            <button type="button" key={p.id} onClick={() => choosePlayer(side, p.id)}
              style={{ opacity: pid === p.id ? 1 : 0.35, transform: pid === p.id ? 'scale(1.1)' : 'none', transition: '.15s' }}
              aria-label={p.name}>
              <Avatar id={p.id} size="sm" />
            </button>
          ))}
        </div>
        <div className="center" style={{ fontWeight: 700, marginTop: 6 }}>{pid ? playerById(pid).name : 'Elegí jugador'}</div>
        {pid && (
          <div className="club-list">
            {options.map((c) => (
              <button type="button" key={c.id} className={'club-opt' + (club === c.name ? ' on' : '')} onClick={() => chooseClub(side, c.name)}>
                <ClubBadge name={c.name} small /> <span>{c.name}</span>
              </button>
            ))}
            {addingClub[side] ? (
              <div>
                <input className="input" style={{ padding: '9px 10px', fontSize: 13 }} autoFocus placeholder="Ej: Milan 2005"
                  value={newClub[side]} onChange={(ev) => setNewClub({ ...newClub, [side]: ev.target.value })}
                  onKeyDown={(ev) => ev.key === 'Enter' && (ev.preventDefault(), createClub(side))} />
                <button type="button" className="btn small primary block" style={{ marginTop: 6 }} onClick={() => createClub(side)}>Agregar club</button>
              </div>
            ) : (
              <button type="button" className="club-opt" style={{ justifyContent: 'center', color: 'var(--muted)', borderStyle: 'dashed', borderColor: 'var(--line)' }}
                onClick={() => setAddingClub({ ...addingClub, [side]: true })}>+ Nuevo club</button>
            )}
          </div>
        )}
        <Stepper value={side === 1 ? g1 : g2} onChange={side === 1 ? setG1 : setG2} />
        {end === 'pen' && (
          <div className="center muted" style={{ fontSize: 12, marginTop: 8 }}>
            Penales
            <Stepper value={side === 1 ? pen1 : pen2} onChange={side === 1 ? setPen1 : setPen2} />
          </div>
        )}
      </div>
    );
  };

  const ScorerBox = ({ side }) => {
    const club = side === 1 ? c1 : c2;
    const pid = side === 1 ? p1 : p2;
    const goals = side === 1 ? g1 : g2;
    if (!club || !goals) return null;
    const mine = scorers.filter((s) => s.side === side);
    const lineup = lineupOf(club);
    const known = Object.values(knownScorers[norm(club)] || {}).sort((a, b) => b.n - a.n);
    const goalsBy = Object.fromEntries(mine.map((m) => [norm(m.name), m.goals]));
    // Club sin plantel cargado: sugerencias en lista
    const suggestions = known.filter((x) => !mine.some((m) => norm(m.name) === norm(x.name))).slice(0, 12);
    const left = goals - goalsOf(side);
    return (
      <div className="card" style={{ marginTop: 10 }}>
        <div className="row">
          <ClubBadge name={club} small />
          <div className="grow"><b>{playerById(pid).name}</b> <span className="muted">· {club}</span></div>
          <span className="tag" style={{ color: left ? 'var(--gold)' : 'var(--accent)' }}>{goalsOf(side)}/{goals}</span>
        </div>
        <div className="scorer-chips">
          {mine.map((s) => (
            <span key={s.name} className="scorer-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button type="button" onClick={() => subGoal(side, s.name)} aria-label="Restar gol">−</button>
              {s.name}<b>×{s.goals}</b>
              {left > 0 && <button type="button" onClick={() => addGoal(side, s.name)} aria-label="Sumar gol">+</button>}
            </span>
          ))}
        </div>
        {lineup ? (
          <div style={{ marginTop: 10 }}>
            <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>
              {left > 0 ? `Tocá al jugador que hizo el gol (faltan ${left})` : 'Goles completos ✓ — tocá − para corregir'}
            </p>
            <Pitch club={club} lineup={lineup} extras={[...known.map((k) => k.name), ...mine.map((m) => m.name)]}
              goalsBy={goalsBy} canAdd={left > 0} onTap={(name) => addGoal(side, name)} />
          </div>
        ) : left > 0 && (
          <div className="scorer-chips">
            {suggestions.map((x) => (
              <button type="button" key={x.name} className="scorer-chip add" onClick={() => addGoal(side, x.name)}>+ {x.name}</button>
            ))}
          </div>
        )}
        {left > 0 && (
          <>
            <div className="row" style={{ marginTop: 8 }}>
              <input className="input grow" style={{ padding: '9px 12px', fontSize: 13 }} placeholder="Otro goleador…"
                value={newScorer[side]} onChange={(ev) => setNewScorer({ ...newScorer, [side]: ev.target.value })}
                onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); addGoal(side, newScorer[side]); setNewScorer({ ...newScorer, [side]: '' }); } }} />
              <button type="button" className="btn small" onClick={() => { addGoal(side, newScorer[side]); setNewScorer({ ...newScorer, [side]: '' }); }}>Sumar</button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="versus">
        {TeamCol({ side: 1 })}
        <div className="vs-mark">VS</div>
        {TeamCol({ side: 2 })}
      </div>

      <div className="field">
        <span className="label">¿Cómo terminó?</span>
        <Seg value={end} onChange={setEnd} options={[
          { value: '90', label: '90 min', sub: `+${POINTS['90']} pts` },
          { value: '120', label: 'Alargue', sub: `+${POINTS['120']} pts` },
          { value: 'pen', label: 'Penales', sub: `+${POINTS.pen} pt` },
        ]} />
        {draftWinner && (
          <p className="center" style={{ marginTop: 10, fontSize: 13 }}>
            Gana <b style={{ color: playerById(draftWinner).color }}>{playerById(draftWinner).name}</b> y suma <b>{POINTS[end]}</b> {POINTS[end] === 1 ? 'punto' : 'puntos'}
          </p>
        )}
      </div>

      {(g1 > 0 || g2 > 0) && (c1 || c2) && (
        <div className="field">
          <span className="label">Goleadores <span style={{ textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></span>
          {ScorerBox({ side: 1 })}
          {ScorerBox({ side: 2 })}
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="fecha">Fecha</label>
        <input id="fecha" className="input" type="datetime-local" value={date} onChange={(ev) => setDate(ev.target.value)} />
      </div>

      <div className="field">
        <span className="label">Foto del resultado <span style={{ textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></span>
        {(photo || (e?.hasPhoto && !removePhoto)) ? (
          <div className="row">
            <span className="grow muted">{photo ? '📷 Foto nueva lista' : '📷 Tiene foto'}</span>
            <button type="button" className="btn small danger" onClick={() => { setPhoto(null); setRemovePhoto(true); }}>Quitar</button>
          </div>
        ) : (
          <label className="btn block" style={{ cursor: 'pointer' }}>
            <Icon.camera width="20" height="20" /> Sacar o subir foto
            <input type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {err && <div className="error">{err}</div>}
      <div className="row" style={{ marginTop: 20 }}>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn primary grow" onClick={save} disabled={busy}>
          {busy ? 'Guardando…' : e ? 'Guardar cambios' : 'Guardar partido'}
        </button>
      </div>
    </div>
  );
}

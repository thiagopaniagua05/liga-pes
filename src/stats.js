import { PLAYERS, POINTS } from './seed.js';

export const norm = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export function winnerOf(m) {
  if (m.end === 'pen') return m.pen1 > m.pen2 ? m.p1 : m.p2;
  return m.g1 > m.g2 ? m.p1 : m.p2;
}
export const loserOf = (m) => (winnerOf(m) === m.p1 ? m.p2 : m.p1);
export const pointsOf = (m) => POINTS[m.end] || 0;

/** Valida un partido. Devuelve un texto de error o null. */
export function validateMatch(m) {
  if (!m.p1 || !m.p2) return 'Elegí los dos jugadores';
  if (m.p1 === m.p2) return 'Un jugador no puede jugar contra sí mismo';
  if (!m.c1 || !m.c2) return 'Elegí los clubes de los dos';
  if (norm(m.c1) === norm(m.c2)) return 'Los clubes tienen que ser distintos';
  if (!Number.isInteger(m.g1) || !Number.isInteger(m.g2) || m.g1 < 0 || m.g2 < 0) return 'Resultado inválido';
  if (m.end === 'pen') {
    if (m.g1 !== m.g2) return 'Si fue a penales, el partido tuvo que terminar empatado';
    if (!Number.isInteger(m.pen1) || !Number.isInteger(m.pen2) || m.pen1 === m.pen2)
      return 'Los penales no pueden terminar empatados';
  } else if (m.g1 === m.g2) {
    return 'Siempre hay un ganador: si terminó empatado, fue a penales';
  }
  return null;
}

const sortByDate = (ms) => [...ms].sort((a, b) => (a.date || 0) - (b.date || 0) || (a.createdAt || 0) - (b.createdAt || 0));

/**
 * Calcula todas las estadísticas.
 * @param matches partidos (ya filtrados por temporada si corresponde)
 * @param baseline saldo inicial (null si no se incluye)
 */
export function computeStats(matches, baseline) {
  const ms = sortByDate(matches);
  const ids = PLAYERS.map((p) => p.id);
  const row = (id) => ({ id, pts: 0, pj: 0, apj: 0, pg: 0, gf: 0, gc: 0, w90: 0, w120: 0, wpen: 0 });
  const table = Object.fromEntries(ids.map((id) => [id, row(id)]));

  // Saldo inicial
  const baseWins = Object.fromEntries(ids.map((id) => [id, 0]));
  const pairs = {};
  const pairKey = (a, b) => [a, b].sort().join('|');
  const pair = (a, b) => {
    const k = pairKey(a, b);
    if (!pairs[k]) pairs[k] = { wins: {}, goals: {}, matches: [] };
    return pairs[k];
  };
  if (baseline) {
    for (const id of ids) {
      table[id].pts += baseline.points?.[id] || 0;
      table[id].pj += baseline.played?.[id] || 0;
    }
    for (const h of baseline.h2h || []) {
      const p = pair(h.a, h.b);
      p.wins[h.a] = (p.wins[h.a] || 0) + h.wa;
      p.wins[h.b] = (p.wins[h.b] || 0) + h.wb;
      baseWins[h.a] += h.wa;
      baseWins[h.b] += h.wb;
    }
    for (const id of ids) table[id].pg += baseWins[id];
  }

  // Partidos
  for (const m of ms) {
    const w = winnerOf(m);
    const l = loserOf(m);
    const pts = pointsOf(m);
    for (const [pid, gf, gc] of [[m.p1, m.g1, m.g2], [m.p2, m.g2, m.g1]]) {
      if (!table[pid]) continue;
      table[pid].pj += 1;
      table[pid].apj += 1;
      table[pid].gf += gf;
      table[pid].gc += gc;
    }
    if (table[w]) {
      table[w].pts += pts;
      table[w].pg += 1;
      table[w][m.end === '90' ? 'w90' : m.end === '120' ? 'w120' : 'wpen'] += 1;
    }
    const p = pair(m.p1, m.p2);
    p.wins[w] = (p.wins[w] || 0) + 1;
    p.goals[m.p1] = (p.goals[m.p1] || 0) + m.g1;
    p.goals[m.p2] = (p.goals[m.p2] || 0) + m.g2;
    p.matches.push(m);
    void l;
  }

  const ranking = Object.values(table)
    .map((r) => ({ ...r, pp: Math.max(0, r.pj - r.pg), dg: r.gf - r.gc }))
    .sort((a, b) => b.pts - a.pts || b.pg - a.pg || b.dg - a.dg);

  // Goleadas (diferencia >= 5)
  const goleadas = [
    ...(baseline?.goleadas || []).map((g, i) => ({ ...g, id: 'base-' + i, historic: true })),
    ...ms
      .filter((m) => Math.abs(m.g1 - m.g2) >= 5)
      .map((m) => {
        const p1w = m.g1 > m.g2;
        return {
          id: m.id, w: p1w ? m.p1 : m.p2, l: p1w ? m.p2 : m.p1,
          gw: Math.max(m.g1, m.g2), gl: Math.min(m.g1, m.g2),
          cw: p1w ? m.c1 : m.c2, cl: p1w ? m.c2 : m.c1, date: m.date, match: m,
        };
      }),
  ].sort((a, b) => b.gw - b.gl - (a.gw - a.gl) || b.gw - a.gw || (b.date || 0) - (a.date || 0));

  // Goleadores
  const sc = {};
  const addScorer = (name, club, goals, owner) => {
    const k = norm(name) + '|' + norm(club);
    if (!sc[k]) sc[k] = { name, club, goals: 0, owner: owner || null };
    sc[k].goals += goals;
    if (owner && !sc[k].owner) sc[k].owner = owner;
  };
  for (const s of baseline?.scorers || []) addScorer(s.name, s.club, s.goals);
  for (const m of ms)
    for (const s of m.scorers || []) addScorer(s.name, s.club || (s.side === 1 ? m.c1 : m.c2), s.goals || 1, s.side === 1 ? m.p1 : m.p2);
  const scorers = Object.values(sc).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));

  const h2h = (a, b) => {
    const p = pairs[pairKey(a, b)] || { wins: {}, goals: {}, matches: [] };
    return {
      winsA: p.wins[a] || 0, winsB: p.wins[b] || 0,
      goalsA: p.goals[a] || 0, goalsB: p.goals[b] || 0,
      matches: [...p.matches].reverse(),
    };
  };

  return { ranking, goleadas, scorers, h2h, matches: ms };
}

/** Estadísticas de un jugador en particular (solo partidos cargados en la app). */
export function playerStats(pid, matches) {
  const ms = sortByDate(matches).filter((m) => m.p1 === pid || m.p2 === pid);
  const results = ms.map((m) => ({ m, won: winnerOf(m) === pid }));

  let current = { type: null, n: 0 };
  for (const r of results) {
    const t = r.won ? 'G' : 'P';
    current = current.type === t ? { type: t, n: current.n + 1 } : { type: t, n: 1 };
  }
  let best = 0, run = 0;
  for (const r of results) { run = r.won ? run + 1 : 0; best = Math.max(best, run); }

  const clubs = {};
  for (const { m, won } of results) {
    const club = m.p1 === pid ? m.c1 : m.c2;
    const k = norm(club);
    if (!clubs[k]) clubs[k] = { club, pj: 0, pg: 0, pts: 0, gf: 0, gc: 0 };
    const c = clubs[k];
    c.pj++;
    c.gf += m.p1 === pid ? m.g1 : m.g2;
    c.gc += m.p1 === pid ? m.g2 : m.g1;
    if (won) { c.pg++; c.pts += pointsOf(m); }
  }
  const clubList = Object.values(clubs).sort((a, b) => b.pts - a.pts || b.pj - a.pj);

  const rivals = {};
  for (const { m, won } of results) {
    const r = m.p1 === pid ? m.p2 : m.p1;
    rivals[r] = rivals[r] || { id: r, pg: 0, pp: 0 };
    won ? rivals[r].pg++ : rivals[r].pp++;
  }

  // Goles, vallas invictas, mayor victoria / peor derrota, goleador personal, hat-tricks
  let gf = 0, gc = 0, clean = 0, pts = 0, hatTricks = 0;
  let biggestWin = null, worstLoss = null;
  const myScorers = {};
  for (const { m, won } of results) {
    const side = m.p1 === pid ? 1 : 2;
    const f = side === 1 ? m.g1 : m.g2;
    const c = side === 1 ? m.g2 : m.g1;
    gf += f; gc += c;
    if (c === 0) clean++;
    if (won) pts += pointsOf(m);
    const diff = f - c;
    if (won && (!biggestWin || diff > biggestWin.diff || (diff === biggestWin.diff && f > biggestWin.f))) biggestWin = { m, diff, f, c };
    if (!won && (!worstLoss || diff < worstLoss.diff || (diff === worstLoss.diff && c > worstLoss.c))) worstLoss = { m, diff, f, c };
    for (const sc of m.scorers || []) {
      if (sc.side !== side) continue;
      const k = norm(sc.name);
      myScorers[k] = myScorers[k] || { name: sc.name, club: sc.club, goals: 0 };
      myScorers[k].goals += sc.goals || 1;
      if ((sc.goals || 1) >= 3) hatTricks++;
    }
  }
  const rivalList = Object.values(rivals);
  const victim = [...rivalList].sort((a, b) => b.pg - a.pg || a.pp - b.pp)[0];
  const nemesis = [...rivalList].sort((a, b) => b.pp - a.pp || a.pg - b.pg)[0];
  const n = results.length || 1;

  return {
    pj: results.length,
    pg: results.filter((r) => r.won).length,
    form: results.slice(-5).map((r) => (r.won ? 'G' : 'P')),
    current, best,
    clubs: clubList,
    favorite: clubList[0] || null,
    rivals: rivalList,
    gf, gc, clean, hatTricks,
    gfAvg: gf / n, gcAvg: gc / n, ptsAvg: pts / n,
    biggestWin, worstLoss,
    topScorer: Object.values(myScorers).sort((a, b) => b.goals - a.goals)[0] || null,
    victim: victim && victim.pg > 0 ? victim : null,
    nemesis: nemesis && nemesis.pp > 0 ? nemesis : null,
  };
}

/** Récords y curiosidades de la liga (solo partidos cargados en la app). */
export function leagueRecords(matches) {
  const ms = sortByDate(matches);
  if (!ms.length) return null;
  const goals = ms.reduce((a, m) => a + m.g1 + m.g2, 0);
  const by = (fn) => [...ms].sort((a, b) => fn(b) - fn(a) || (b.date || 0) - (a.date || 0))[0];
  const biggest = by((m) => Math.abs(m.g1 - m.g2) * 100 + Math.max(m.g1, m.g2));
  const highest = by((m) => m.g1 + m.g2);

  // Mejor actuación individual de un goleador en un partido
  let bestGame = null;
  for (const m of ms) for (const sc of m.scorers || []) {
    const g = sc.goals || 1;
    if (!bestGame || g > bestGame.goals) bestGame = { ...sc, goals: g, owner: sc.side === 1 ? m.p1 : m.p2, m };
  }

  const per = PLAYERS.map((p) => ({ id: p.id, ...playerStats(p.id, ms) })).filter((x) => x.pj > 0);
  const top = (fn, asc = false) => {
    const arr = per.filter((x) => fn(x) != null).sort((a, b) => (asc ? fn(a) - fn(b) : fn(b) - fn(a)));
    return arr[0] ? { id: arr[0].id, value: fn(arr[0]), stats: arr[0] } : null;
  };
  const table = computeStats(ms, null).ranking;
  const topRow = (key) => {
    const r = [...table].sort((a, b) => b[key] - a[key])[0];
    return r && r[key] > 0 ? { id: r.id, value: r[key] } : null;
  };

  // Duelo más jugado
  const duels = {};
  for (const m of ms) {
    const k = [m.p1, m.p2].sort().join('|');
    duels[k] = (duels[k] || 0) + 1;
  }
  const [duelKey, duelN] = Object.entries(duels).sort((a, b) => b[1] - a[1])[0];

  // Clubes de la liga
  const clubs = {};
  for (const m of ms) {
    for (const [club, pid, f] of [[m.c1, m.p1, m.g1], [m.c2, m.p2, m.g2]]) {
      const k = norm(club);
      clubs[k] = clubs[k] || { club, owner: pid, pts: 0, gf: 0, pj: 0 };
      clubs[k].pj++; clubs[k].gf += f;
    }
    const w = winnerOf(m);
    const wc = w === m.p1 ? m.c1 : m.c2;
    clubs[norm(wc)].pts += pointsOf(m);
  }
  const clubList = Object.values(clubs);
  const bestClub = [...clubList].sort((a, b) => b.pts - a.pts || b.gf - a.gf)[0];
  const goalClub = [...clubList].sort((a, b) => b.gf - a.gf)[0];

  return {
    total: ms.length,
    goals,
    avgGoals: goals / ms.length,
    pens: ms.filter((m) => m.end === 'pen').length,
    extra: ms.filter((m) => m.end === '120').length,
    biggest, highest, bestGame,
    bestAttack: top((x) => x.gfAvg),
    bestDefense: top((x) => x.gcAvg, true),
    mostClean: top((x) => (x.clean > 0 ? x.clean : null)),
    longestStreak: top((x) => (x.best > 0 ? x.best : null)),
    mostHatTricks: top((x) => (x.hatTricks > 0 ? x.hatTricks : null)),
    bestPpm: top((x) => x.ptsAvg),
    penKing: topRow('wpen'),
    extraKing: topRow('w120'),
    duel: { a: duelKey.split('|')[0], b: duelKey.split('|')[1], n: duelN },
    bestClub, goalClub,
  };
}

/** Campeón de una temporada (más puntos). */
export function seasonChampion(matches) {
  if (!matches.length) return null;
  return computeStats(matches, null).ranking[0];
}

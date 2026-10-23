// Modo demo: todo queda guardado en este navegador. Sirve para probar la app sin Firebase.
import { BASELINE, FIRST_SEASON } from '../seed.js';
import { CLUB_SEED } from '../squads.js';

const KEY = 'liga-pes-demo-v3';
let mem = null;
const read = () => {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return mem; }
};
const write = (db) => {
  mem = db;
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* sin storage: queda en memoria */ }
};

const H = 3600e3;
function demoData() {
  const now = Date.now();
  const clubs = CLUB_SEED.map((c, i) => ({ id: 'c' + i, owner: c.owner, name: c.name, active: true, createdAt: now - 90 * 24 * H }));
  const mk = (i, p1, c1, g1, p2, c2, g2, end, scorers, extra = {}) => ({
    id: 'm' + i, seasonId: 't1', date: now - (10 - i) * 5 * H, p1, c1, g1, p2, c2, g2, end,
    pen1: null, pen2: null, scorers, createdBy: p1, createdAt: now - (10 - i) * 5 * H, log: [], ...extra,
  });
  const s = (side, name, club, goals = 1) => ({ side, name, club, goals });
  const matches = [
    mk(1, 'agus', 'Real Madrid actual', 3, 'valen', 'Chelsea actual', 1, '90',
      [s(1, 'Mbappé', 'Real Madrid actual', 2), s(1, 'Vinícius', 'Real Madrid actual'), s(2, 'João Pedro', 'Chelsea actual')]),
    mk(2, 'chris', 'PSG 2013', 2, 'titi', 'Inter 1998', 2, 'pen',
      [s(1, 'Ibrahimović', 'PSG 2013', 2), s(2, 'Ronaldo Nazário', 'Inter 1998', 2)], { pen1: 4, pen2: 3 }),
    mk(3, 'titi', 'Arsenal actual', 6, 'chris', 'Manchester City actual', 1, '90',
      [s(1, 'Havertz', 'Arsenal actual', 3), s(1, 'Saka', 'Arsenal actual', 3), s(2, 'Haaland', 'Manchester City actual')]),
    mk(4, 'valen', 'Juventus 2015', 2, 'agus', 'Barcelona 2006', 1, '120',
      [s(1, 'Tevez', 'Juventus 2015', 2), s(2, 'Ronaldinho', 'Barcelona 2006')]),
    mk(5, 'chris', 'Real Madrid 2015', 4, 'valen', 'Boca 2000', 2, '90',
      [s(1, 'Cristiano Ronaldo', 'Real Madrid 2015', 3), s(1, 'Karim Benzema', 'Real Madrid 2015'), s(2, 'Palermo', 'Boca 2000', 2)]),
  ];
  return {
    meta: { baseline: { id: 'baseline', ...BASELINE } },
    seasons: { t1: FIRST_SEASON },
    clubs: Object.fromEntries(clubs.map((c) => [c.id, c])),
    matches: Object.fromEntries(matches.map((m) => [m.id, m])),
    photos: {},
  };
}

export function createDemoStore() {
  let db = read() || demoData();
  write(db);
  const subs = new Set();
  let authCb = null;
  let user = null;
  try { user = JSON.parse(sessionStorage.getItem(KEY + '-user') || localStorage.getItem(KEY + '-user')); } catch { /* */ }

  const emit = () => subs.forEach((s) => s());
  const commit = () => { write(db); setTimeout(emit, 0); };
  const list = (col) => Object.entries(db[col] || {}).map(([id, d]) => ({ ...d, id }));
  const saveUser = (u) => { user = u; try { localStorage.setItem(KEY + '-user', JSON.stringify(u)); } catch { /* */ } authCb && authCb(u); };

  return {
    mode: 'demo',
    onAuth(cb) { authCb = cb; setTimeout(() => cb(user), 0); return () => { authCb = null; }; },
    async login(id) { saveUser({ uid: 'demo-' + id, playerId: id }); },
    async logout() { try { localStorage.removeItem(KEY + '-user'); } catch { /* */ } user = null; authCb && authCb(null); },
    subscribe(col, cb) {
      const f = () => cb(list(col));
      subs.add(f); setTimeout(f, 0);
      return () => subs.delete(f);
    },
    subscribeDoc(col, id, cb) {
      const f = () => cb(db[col]?.[id] ? { ...db[col][id], id } : null);
      subs.add(f); setTimeout(f, 0);
      return () => subs.delete(f);
    },
    newId() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
    async set(col, id, data) { db[col] = db[col] || {}; db[col][id] = data; commit(); },
    async update(col, id, data) { db[col][id] = { ...db[col][id], ...data }; commit(); },
    async remove(col, id) { delete db[col][id]; commit(); },
    async get(col, id) { return db[col]?.[id] ? { ...db[col][id], id } : null; },
    async ensureSeed() {},
    reset() { db = demoData(); commit(); },
  };
}

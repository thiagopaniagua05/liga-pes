// Jugadores fijos de la liga y datos históricos (saldo inicial al 11/10/2026)

export const PLAYERS = [
  { id: 'valen', name: 'Valen', color: '#38bdf8' },
  { id: 'titi', name: 'Titi', color: '#f59e0b' },
  { id: 'agus', name: 'Agus', color: '#f43f5e' },
  { id: 'chris', name: 'Chris', color: '#a78bfa' },
];

export const playerById = (id) => PLAYERS.find((p) => p.id === id) || { id, name: id, color: '#94a3b8' };

export const POINTS = { '90': 3, '120': 2, pen: 1 };
export const END_LABEL = { '90': '90 min', '120': 'Alargue', pen: 'Penales' };

export const SEED_VERSION = 3;

export const BASELINE = {
  seedVersion: SEED_VERSION,
  date: '2026-10-11',
  points: { valen: 254, titi: 193, agus: 237, chris: 176 },
  played: { agus: 162, valen: 179, chris: 161, titi: 134 },
  // wa = partidos ganados por a, wb = partidos ganados por b
  h2h: [
    { a: 'chris', b: 'agus', wa: 21, wb: 30 },
    { a: 'chris', b: 'valen', wa: 27, wb: 44 },
    { a: 'valen', b: 'agus', wa: 33, wb: 35 },
    { a: 'chris', b: 'titi', wa: 15, wb: 30 },
    { a: 'titi', b: 'agus', wa: 21, wb: 22 },
    { a: 'titi', b: 'valen', wa: 17, wb: 32 },
  ],
  // w = ganador, l = perdedor
  goleadas: [
    { w: 'agus', l: 'valen', gw: 7, gl: 0 },
    { w: 'chris', l: 'titi', gw: 7, gl: 2 },
    { w: 'titi', l: 'chris', gw: 5, gl: 0 },
    { w: 'chris', l: 'valen', gw: 7, gl: 1 },
    { w: 'chris', l: 'agus', gw: 7, gl: 2 },
    { w: 'agus', l: 'chris', gw: 6, gl: 1 },
    { w: 'titi', l: 'chris', gw: 6, gl: 1 },
    { w: 'agus', l: 'valen', gw: 7, gl: 2 },
    { w: 'chris', l: 'agus', gw: 7, gl: 1 },
    { w: 'valen', l: 'chris', gw: 6, gl: 1 },
    { w: 'valen', l: 'chris', gw: 9, gl: 4 },
    { w: 'titi', l: 'chris', gw: 6, gl: 1 },
    { w: 'valen', l: 'agus', gw: 7, gl: 2 },
  ],
  scorers: [
    { name: 'Mbappé', club: 'Real Madrid actual', goals: 85 },
    { name: 'Ronaldo Nazário', club: 'Inter 1998', goals: 70 },
    { name: 'Ibrahimović', club: 'PSG 2013', goals: 65 },
    { name: 'João Pedro', club: 'Chelsea actual', goals: 38 },
    { name: 'Havertz', club: 'Arsenal actual', goals: 34 },
    { name: 'Haaland', club: 'Manchester City actual', goals: 32 },
    { name: 'Vinícius', club: 'Real Madrid actual', goals: 32 },
    { name: 'Palermo', club: 'Boca 2000', goals: 28 },
    { name: 'Kanu', club: 'Inter 1998', goals: 22 },
    { name: 'Cole Palmer', club: 'Chelsea actual', goals: 21 },
    { name: 'Semenyo', club: 'Manchester City actual', goals: 13 },
    { name: 'Tevez', club: 'Juventus 2015', goals: 13 },
    { name: 'Llorente', club: 'Juventus 2015', goals: 13 },
    { name: 'Saka', club: 'Arsenal actual', goals: 12 },
  ],
};

export const FIRST_SEASON = { id: 't1', name: 'Temporada 1', startedAt: Date.parse('2026-10-11T00:00:00-03:00'), active: true };

// Nombres de clubes que cambiaron (para corregir datos ya guardados)
export const CLUB_RENAMES = { 'man city actual': 'Manchester City actual', 'boca 2002': 'Boca 2000' };

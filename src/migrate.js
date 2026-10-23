import { BASELINE, FIRST_SEASON, SEED_VERSION, CLUB_RENAMES } from './seed.js';
import { CLUB_SEED } from './squads.js';
import { norm } from './stats.js';

const clubDoc = (c, now) => ({ name: c.name, owner: c.owner, active: true, createdAt: now, createdBy: 'sistema' });
const rename = (club) => CLUB_RENAMES[norm(club)] || club;

/** Datos para ensureSeed: carga inicial + migración de versiones anteriores. */
export function seedPackage() {
  const now = Date.now();
  return {
    version: SEED_VERSION,
    baseline: BASELINE,
    seasons: [FIRST_SEASON],
    clubs: CLUB_SEED.map((c) => clubDoc(c, now)),
    migrate(baseline, clubs, matches = []) {
      const clubUpdates = clubs
        .filter((c) => CLUB_RENAMES[norm(c.name)])
        .map((c) => ({ id: c.id, data: { name: rename(c.name) } }));
      const names = new Set(clubs.map((c) => norm(rename(c.name))));
      const newClubs = CLUB_SEED.filter((c) => !names.has(norm(c.name))).map((c) => clubDoc(c, now));
      // Partidos ya cargados con un nombre viejo de club
      const matchUpdates = matches
        .filter((m) => CLUB_RENAMES[norm(m.c1)] || CLUB_RENAMES[norm(m.c2)] || (m.scorers || []).some((s) => CLUB_RENAMES[norm(s.club)]))
        .map((m) => ({ id: m.id, data: { c1: rename(m.c1), c2: rename(m.c2), scorers: (m.scorers || []).map((s) => ({ ...s, club: rename(s.club) })) } }));
      return {
        clubUpdates,
        matchUpdates,
        newClubs,
        baseline: {
          seedVersion: SEED_VERSION,
          scorers: (baseline.scorers || []).map((s) => ({ ...s, club: rename(s.club) })),
        },
      };
    },
  };
}

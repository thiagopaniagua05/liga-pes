import { shortName, kitOf } from './squads.js';
import { clubColors } from './components.jsx';
import { norm } from './stats.js';

// Marcas de la cancha (vertical, ataca hacia arriba)
const Markings = () => (
  <svg className="pitch-lines" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.6">
      <rect x="10" y="10" width="280" height="380" />
      <line x1="10" y1="200" x2="290" y2="200" />
      <circle cx="150" cy="200" r="34" />
      <rect x="75" y="10" width="150" height="58" /><rect x="112" y="10" width="76" height="22" />
      <path d="M124 68 A34 34 0 0 0 176 68" />
      <rect x="75" y="332" width="150" height="58" /><rect x="112" y="368" width="76" height="22" />
      <path d="M124 332 A34 34 0 0 1 176 332" />
      <path d="M10 18 A8 8 0 0 0 18 10 M282 10 A8 8 0 0 0 290 18 M10 382 A8 8 0 0 1 18 390 M282 390 A8 8 0 0 1 290 382" />
    </g>
    <g fill="rgba(255,255,255,.9)">
      <circle cx="150" cy="200" r="2.5" /><circle cx="150" cy="50" r="2" /><circle cx="150" cy="350" r="2" />
    </g>
  </svg>
);

function Token({ name, goals, disabled, kit, onTap, style, gk }) {
  return (
    <button type="button" className={'token' + (goals ? ' scored' : '')} style={style} disabled={disabled}
      onClick={() => onTap(name)} aria-label={`Gol de ${name}`}>
      <span className="shirt" style={{ background: gk ? 'linear-gradient(135deg,#f6c945,#b8860b)' : kit }}>
        {goals > 0 && <span className="goal-badge">⚽{goals > 1 ? goals : ''}</span>}
      </span>
      <span className="tname">{shortName(name)}</span>
    </button>
  );
}

/**
 * Minicampo con el 11 titular y el banco. Tocar un jugador le suma un gol.
 * @param lineup  { lines: [[arquero],[def...],...], bench: [...] }
 * @param extras  otros jugadores (goleadores anteriores que no están en el plantel)
 * @param goalsBy { nombreNormalizado: goles en este partido }
 */
export default function Pitch({ club, lineup, extras = [], goalsBy, canAdd, onTap }) {
  const [a, b] = clubColors(club);
  const kit = kitOf(club) || `linear-gradient(135deg, ${a}, ${b})`;
  const L = lineup.lines.length;
  const inSquad = new Set([...lineup.lines.flat(), ...lineup.bench].map(norm));
  const bench = [...lineup.bench, ...extras.filter((x) => !inSquad.has(norm(x)))];

  return (
    <div>
      <div className="pitch">
        <Markings />
        {lineup.lines.map((line, i) => {
          const y = 91 - (i * (91 - 12)) / (L - 1);
          return line.map((name, j) => {
            const n = line.length;
            const x = n === 1 ? 50 : n === 2 ? 32 + 36 * j : 11 + (78 * j) / (n - 1);
            return (
              <Token key={name} name={name} gk={i === 0} kit={kit} goals={goalsBy[norm(name)] || 0}
                disabled={!canAdd} onTap={onTap} style={{ left: `${x}%`, top: `${y}%` }} />
            );
          });
        })}
      </div>
      {bench.length > 0 && (
        <>
          <div className="label" style={{ marginTop: 10, marginBottom: 6 }}>Suplentes</div>
          <div className="bench">
            {bench.map((name) => (
              <Token key={name} name={name} kit={kit} goals={goalsBy[norm(name)] || 0} disabled={!canAdd} onTap={onTap} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

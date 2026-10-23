import { useState } from 'react';
import { PLAYERS } from '../seed.js';
import { authErrorText } from '../store/firebase.js';

export default function Login({ store }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const demo = store.mode === 'demo';

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const u = user.trim().toLowerCase();
    const player = PLAYERS.find((p) => p.id === u);
    if (!player || (!demo && !pass)) return setErr('Usuario o contraseña incorrectos.');
    setBusy(true);
    try {
      await store.login(player.id, pass);
    } catch (ex) {
      setErr(authErrorText(ex));
      setBusy(false);
    }
  }

  return (
    <form className="login with-bg" onSubmit={submit}>
      <div className="login-photo">
        <div className="login-hero"><h1>LIGA <b>PES</b> 21</h1></div>
      </div>

      <div className="login-form">
        <input className="input" aria-label="Usuario" placeholder="Usuario" autoComplete="username" autoCapitalize="none"
          autoCorrect="off" spellCheck="false" value={user} onChange={(e) => setUser(e.target.value)} />
        <input className="input" aria-label="Contraseña" placeholder="Contraseña" type="password" autoComplete="current-password"
          value={pass} onChange={(e) => setPass(e.target.value)} />
        {err && <div className="error" style={{ marginTop: 0 }}>{err}</div>}
        <button className="btn primary block" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        {demo && (
          <p className="muted center" style={{ fontSize: 12, margin: '4px 0 0' }}>
            <b style={{ color: 'var(--gold)' }}>Modo demo</b>: entrá con el nombre de cualquier jugador (sin contraseña).
          </p>
        )}
      </div>
    </form>
  );
}

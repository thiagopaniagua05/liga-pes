import { useEffect, useMemo, useRef, useState } from 'react';
import { BASELINE, FIRST_SEASON, playerById } from './seed.js';
import { computeStats, winnerOf } from './stats.js';
import { seedPackage } from './migrate.js';
import { Ball, Icon, Sheet } from './components.jsx';
import Login from './screens/Login.jsx';
import Home from './screens/Home.jsx';
import MatchForm from './screens/MatchForm.jsx';
import MatchDetail from './screens/MatchDetail.jsx';
import H2H from './screens/H2H.jsx';
import Scorers from './screens/Scorers.jsx';
import Profile from './screens/Profile.jsx';

const NOTIF_KEY = 'liga-pes-notif';
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* */ } };

export default function App({ store }) {
  const [user, setUser] = useState(undefined);
  const [clubs, setClubs] = useState([]);
  const [matches, setMatches] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [scope, setScope] = useState(lsGet('liga-pes-scope') || 'all');
  const [tab, setTab] = useState('home');
  const [sheet, setSheet] = useState(null); // {type:'new'|'edit'|'match'|'player', ...}
  const [toast, setToast] = useState(null);
  const [notifOn, setNotifOn] = useState(lsGet(NOTIF_KEY) === '1');
  const seen = useRef(null);
  const me = user?.playerId;

  useEffect(() => store.onAuth(setUser), [store]);

  useEffect(() => {
    if (!user) return;
    store.ensureSeed(seedPackage());
    const unsubs = [
      store.subscribe('clubs', setClubs),
      store.subscribe('matches', setMatches),
      store.subscribe('seasons', setSeasons),
      store.subscribeDoc('meta', 'baseline', setBaseline),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, [user, store]);

  // Avisos cuando otro carga un partido
  useEffect(() => {
    if (!matches) return;
    if (seen.current === null) { seen.current = new Set(matches.map((m) => m.id)); return; }
    for (const m of matches) {
      if (seen.current.has(m.id)) continue;
      seen.current.add(m.id);
      if (m.createdBy === me) continue;
      const w = playerById(winnerOf(m)).name;
      const text = `${playerById(m.createdBy).name} cargó: ${playerById(m.p1).name} ${m.g1}-${m.g2} ${playerById(m.p2).name}`;
      showToast('⚽ ' + text);
      if (notifOn && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker?.ready
          .then((r) => r.showNotification('Liga PES 21', { body: `${text} · ganó ${w}`, icon: 'icons/icon-192.png', tag: m.id }))
          .catch(() => { try { new Notification('Liga PES 21', { body: text }); } catch { /* */ } });
      }
    }
  }, [matches]);

  function showToast(t) {
    setToast(t);
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => setToast(null), 3500);
  }

  const notif = {
    supported: typeof window !== 'undefined' && 'Notification' in window,
    enabled: notifOn,
    async toggle() {
      if (notifOn) { setNotifOn(false); lsSet(NOTIF_KEY, '0'); return; }
      const perm = await Notification.requestPermission();
      if (perm === 'granted') { setNotifOn(true); lsSet(NOTIF_KEY, '1'); showToast('🔔 Avisos activados'); }
      else showToast('El navegador bloqueó los avisos');
    },
  };

  const activeSeason = seasons.find((s) => s.active) || seasons[0] || FIRST_SEASON;
  const validScope = scope === 'all' || seasons.some((s) => s.id === scope) ? scope : 'all';
  const includeBaseline = validScope === 'all';
  const scoped = useMemo(
    () => (matches || []).filter((m) => includeBaseline || m.seasonId === validScope),
    [matches, validScope, includeBaseline]
  );
  const stats = useMemo(() => computeStats(scoped, includeBaseline ? baseline : null), [scoped, baseline, includeBaseline]);

  if (user === undefined) return <div className="splash"><Ball /></div>;
  if (!user) return <div className="app"><Login store={store} /></div>;

  const setScopeSaved = (s) => { setScope(s); lsSet('liga-pes-scope', s); };
  const openMatch = (m) => setSheet({ type: 'match', m });
  const openPlayer = (id) => (id === me ? (setTab('me'), window.scrollTo(0, 0)) : setSheet({ type: 'player', id }));
  const go = (t) => { setTab(t); window.scrollTo(0, 0); };
  const seasonList = [...seasons].sort((a, b) => b.startedAt - a.startedAt);

  const commonProfile = { me, store, stats, scopedMatches: scoped, allMatches: matches || [], clubs, seasons, includeBaseline, notif, onLogout: () => store.logout() };

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo"><Ball /> LIGA <b>PES</b></div>
        <div className="spacer" />
        {store.mode === 'demo' && <span className="chip demo-badge">DEMO</span>}
      </header>

      <div style={{ padding: '0 16px' }}>
        <div className="chips">
          <button className={'chip' + (validScope === 'all' ? ' on' : '')} onClick={() => setScopeSaved('all')}>📜 Histórico</button>
          {seasonList.map((s) => (
            <button key={s.id} className={'chip' + (validScope === s.id ? ' on' : '')} onClick={() => setScopeSaved(s.id)}>
              {s.active ? '🟢 ' : ''}{s.name}
            </button>
          ))}
        </div>
      </div>

      <main className="content">
        {matches === null ? (
          <div className="splash" style={{ minHeight: '50dvh' }}><Ball /></div>
        ) : tab === 'home' ? (
          <Home stats={stats} includeBaseline={includeBaseline} onOpenMatch={openMatch} onOpenPlayer={openPlayer} onNewMatch={() => setSheet({ type: 'new' })} />
        ) : tab === 'h2h' ? (
          <H2H stats={stats} me={me} includeBaseline={includeBaseline} onOpenMatch={openMatch} />
        ) : tab === 'goals' ? (
          <Scorers stats={stats} clubs={clubs} includeBaseline={includeBaseline} onOpenMatch={openMatch} />
        ) : (
          <Profile pid={me} {...commonProfile} />
        )}
      </main>

      <nav className="nav">
        <button className={tab === 'home' ? 'on' : ''} onClick={() => go('home')}><Icon.home />Inicio</button>
        <button className={tab === 'h2h' ? 'on' : ''} onClick={() => go('h2h')}><Icon.vs />Cara a cara</button>
        <button onClick={() => setSheet({ type: 'new' })} aria-label="Cargar partido"><div className="plus"><Icon.plus /></div></button>
        <button className={tab === 'goals' ? 'on' : ''} onClick={() => go('goals')}><Icon.boot />Stats</button>
        <button className={tab === 'me' ? 'on' : ''} onClick={() => go('me')}><Icon.user />Yo</button>
      </nav>

      {sheet && (sheet.type === 'new' || sheet.type === 'edit') && (
        <Sheet title={sheet.type === 'new' ? 'Cargar partido' : 'Editar partido'} onClose={() => setSheet(null)}>
          <MatchForm store={store} me={me} clubs={clubs} allMatches={matches || []} baseline={baseline}
            seasonId={activeSeason.id} editing={sheet.m}
            onCancel={() => setSheet(null)}
            onDone={(m, isNew) => {
              setSheet(null);
              const w = playerById(winnerOf(m)).name;
              showToast(isNew ? `✅ Partido guardado · ganó ${w}` : '✅ Cambios guardados');
            }} />
        </Sheet>
      )}
      {sheet?.type === 'match' && (
        <Sheet title="Partido" onClose={() => setSheet(null)}>
          <MatchDetail store={store} m={(matches || []).find((x) => x.id === sheet.m.id) || sheet.m}
            onEdit={() => setSheet({ type: 'edit', m: (matches || []).find((x) => x.id === sheet.m.id) || sheet.m })}
            onDeleted={() => { setSheet(null); showToast('🗑 Partido borrado'); }} />
        </Sheet>
      )}
      {sheet?.type === 'player' && (
        <Sheet title={playerById(sheet.id).name} onClose={() => setSheet(null)}>
          <Profile pid={sheet.id} {...commonProfile} />
        </Sheet>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

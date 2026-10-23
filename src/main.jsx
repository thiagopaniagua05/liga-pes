import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { createDemoStore } from './store/demo.js';
import { createFirebaseStore } from './store/firebase.js';
import { Ball } from './components.jsx';
import './styles.css';

const root = createRoot(document.getElementById('root'));

async function start() {
  const cfg = window.LIGA_CONFIG?.firebase;
  const forceDemo = new URLSearchParams(location.search).has('demo');
  root.render(<div className="splash"><Ball /></div>);
  try {
    const store = cfg && !forceDemo ? await createFirebaseStore(cfg) : createDemoStore();
    root.render(<App store={store} />);
  } catch (e) {
    console.error(e);
    root.render(
      <div className="login">
        <div className="login-hero"><Ball /><h1>SIN <b>CONEXIÓN</b></h1>
          <p>No se pudo conectar con el servidor. Revisá internet.</p></div>
        <button className="btn primary block" onClick={() => location.reload()}>Reintentar</button>
      </div>
    );
  }
}
start();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Adaptador Firebase (Auth + Firestore). Se carga desde el CDN oficial de Google,
// así no hace falta compilar nada.
const V = '10.14.1';
const BASE = `https://www.gstatic.com/firebasejs/${V}/`;
export const EMAIL_DOMAIN = 'liga-pes.app';

// Si estás offline, Firestore guarda el cambio y lo sube cuando vuelve la conexión.
// No dejamos la UI trabada esperando la confirmación del servidor.
const soft = (p, ms = 4000) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);

export async function createFirebaseStore(config) {
  const [appM, authM, fsM] = await Promise.all([
    import(/* @vite-ignore */ BASE + 'firebase-app.js'),
    import(/* @vite-ignore */ BASE + 'firebase-auth.js'),
    import(/* @vite-ignore */ BASE + 'firebase-firestore.js'),
  ]);
  const app = appM.initializeApp(config);
  const auth = authM.getAuth(app);
  let db;
  try {
    db = fsM.initializeFirestore(app, {
      localCache: fsM.persistentLocalCache({ tabManager: fsM.persistentMultipleTabManager() }),
    });
  } catch (e) {
    db = fsM.getFirestore(app);
  }
  const email = (id) => `${id}@${EMAIL_DOMAIN}`;
  const ref = (col, id) => fsM.doc(db, col, id);

  return {
    mode: 'firebase',
    onAuth(cb) {
      return authM.onAuthStateChanged(auth, (u) =>
        cb(u ? { uid: u.uid, playerId: (u.email || '').split('@')[0] } : null)
      );
    },
    async login(id, pass) { await authM.signInWithEmailAndPassword(auth, email(id), pass); },
    logout() { return authM.signOut(auth); },

    subscribe(col, cb, onErr) {
      return fsM.onSnapshot(
        fsM.collection(db, col),
        (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (e) => { console.error(col, e); onErr && onErr(e); }
      );
    },
    subscribeDoc(col, id, cb) {
      return fsM.onSnapshot(ref(col, id), (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null),
        (e) => console.error(col, id, e));
    },
    newId(col) { return fsM.doc(fsM.collection(db, col)).id; },
    set(col, id, data) { return soft(fsM.setDoc(ref(col, id), data)); },
    update(col, id, data) { return soft(fsM.updateDoc(ref(col, id), data)); },
    remove(col, id) { return soft(fsM.deleteDoc(ref(col, id))); },
    async get(col, id) {
      const s = await fsM.getDoc(ref(col, id));
      return s.exists() ? { id: s.id, ...s.data() } : null;
    },
    // Crea los datos iniciales solo si el servidor confirma que no existen,
    // y aplica las actualizaciones de datos (clubes nuevos, nombres corregidos).
    async ensureSeed(seed) {
      try {
        const s = await fsM.getDocFromServer(ref('meta', 'baseline'));
        const batch = fsM.writeBatch(db);
        if (!s.exists()) {
          batch.set(ref('meta', 'baseline'), seed.baseline);
          for (const season of seed.seasons) batch.set(ref('seasons', season.id), season);
          for (const c of seed.clubs) batch.set(fsM.doc(fsM.collection(db, 'clubs')), c);
          await batch.commit();
          return;
        }
        const data = s.data();
        if ((data.seedVersion || 1) >= seed.version) return;
        const existing = await fsM.getDocsFromServer(fsM.collection(db, 'clubs'));
        const matches = await fsM.getDocsFromServer(fsM.collection(db, 'matches'));
        const migration = seed.migrate(data, existing.docs.map((d) => ({ id: d.id, ...d.data() })),
          matches.docs.map((d) => ({ id: d.id, ...d.data() })));
        for (const u of migration.matchUpdates) batch.update(ref('matches', u.id), u.data);
        for (const c of migration.newClubs) batch.set(fsM.doc(fsM.collection(db, 'clubs')), c);
        for (const u of migration.clubUpdates) batch.update(ref('clubs', u.id), u.data);
        batch.update(ref('meta', 'baseline'), migration.baseline);
        await batch.commit();
      } catch (e) {
        console.warn('No se pudo verificar la carga inicial', e);
      }
    },
  };
}

export function authErrorText(e) {
  const c = e?.code || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') || c.includes('invalid-email'))
    return 'Usuario o contraseña incorrectos.';
  if (c.includes('user-disabled')) return 'Este usuario está deshabilitado.';
  if (c.includes('too-many-requests')) return 'Demasiados intentos. Esperá un rato y probá de nuevo.';
  if (c.includes('network')) return 'Sin conexión. Revisá internet.';
  if (c.includes('operation-not-allowed')) return 'Falta activar "Correo electrónico/contraseña" en Firebase Authentication.';
  return e?.message || 'Algo salió mal';
}

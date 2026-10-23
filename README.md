# ⚽ Liga PES 21

PWA para llevar una liga de PES 2021 entre amigos: partidos, tabla, goleadores, historial cara a cara, estadísticas y planteles por club con mini cancha.

## Funcionalidades

- Tabla en tiempo real (victoria en 90' = 3 pts, en alargue = 2, por penales = 1)
- Carga de partidos con goleadores elegidos desde el plantel
- Historial cara a cara, rachas, goleadas y récords
- Tabla de goleadores
- Planteles por club con formación titular y suplentes
- Instalable en Android e iOS (Agregar a pantalla de inicio)

Los jugadores de la liga y los datos iniciales se definen en `src/seed.js`; los usuarios se loguean con `usuario@EMAIL_DOMAIN` (ver `src/store/firebase.js`). En `firestore.rules` reemplazá los correos de ejemplo por los reales al publicar las reglas.

## Requisitos

- Node.js 18 o superior
- Un proyecto de [Firebase](https://console.firebase.google.com) con **Authentication (correo/contraseña)** y **Cloud Firestore**

## Puesta en marcha

```bash
npm install
cp public/config.example.js public/config.js   # completá con la config de tu proyecto de Firebase
npm run build                                  # genera la carpeta dist/
```

Sin `public/config.js` (o con `firebase: null`) la app arranca en **modo demo**, con datos de ejemplo guardados solo en el navegador.

`npm run preview` genera `preview.html`, una versión de un solo archivo en modo demo.

## Despliegue

La carpeta `dist/` es un sitio estático: se puede publicar en cualquier hosting estático (Firebase Hosting, Netlify, GitHub Pages, etc.).
Acordate de agregar el dominio final en *Firebase → Authentication → Configuración → Dominios autorizados*.

## Seguridad

- `public/config.js` y `dist/` están en `.gitignore`: **no subas tu configuración** al repositorio.
- Publicá las reglas de `firestore.rules` en *Firestore → Reglas*.
- Las cuentas se crean a mano desde la consola de Firebase (la app no tiene registro público).
- Recomendado: restringir la API key a tu dominio en Google Cloud Console → *Credenciales*.

## Stack

React 19 · esbuild · Firebase (Auth + Firestore) · PWA (manifest + service worker)

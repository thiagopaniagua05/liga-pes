// Clubes de cada jugador: formación, 11 titular y suplentes.
// xi: líneas separadas por "|", desde el arquero hacia adelante; cada línea de izquierda a derecha.
// Si en el Dream Patch falta alguien, se agrega desde la app con "Otro goleador" (queda en el banco).
const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

export const CLUB_SEED = [
  // ---------- VALEN ----------
  { name: 'Boca 2000', kit: 'linear-gradient(180deg,#0a2a7a 0 38%,#f5c400 38% 62%,#0a2a7a 62%)', owner: 'valen', formation: '4-3-1-2',
    xi: 'Óscar Córdoba | Rodolfo Arruabarrena, Walter Samuel, Jorge Bermúdez, Hugo Ibarra | José Basualdo, Mauricio Serna, Sebastián Battaglia | Juan Román Riquelme | Palermo, Guillermo Barros Schelotto',
    bench: 'Roberto Abbondanzieri, Aníbal Matellán, Cristian Traverso, Diego Cagna, Gustavo Barros Schelotto, Marcelo Delgado, Antonio Barijho, Walter Gaitán' },
  { name: 'Chelsea actual', kit: 'linear-gradient(135deg,#0a3fa8,#05286e)', owner: 'valen', formation: '5-3-2',
    xi: "Emiliano Martínez | Jorrel Hato, Levi Colwill, Wesley Fofana, Maxence Lacroix, Reece James | Morgan Rogers, Roméo Lavia, Cole Palmer | Pedro Neto, João Pedro",
    bench: "Gabriel Słonina, Marco Palestra, Malo Gusto, Pep Chavarría, Aarón Anselmino, Josh Acheampong, Moisés Caicedo, Valentín Barco, Jordan Henderson, Estêvão, Geovany Quenda, Jamie Gittens, Danny Welbeck, Emmanuel Emegha" },
  { name: 'Manchester United 2008', kit: 'linear-gradient(135deg,#e01b22,#a3070d)', owner: 'valen', formation: '4-4-2',
    xi: 'Edwin van der Sar | Patrice Evra, Nemanja Vidić, Rio Ferdinand, Wes Brown | Ryan Giggs, Paul Scholes, Michael Carrick, Cristiano Ronaldo | Carlos Tevez, Wayne Rooney',
    bench: "Tomasz Kuszczak, Gary Neville, John O'Shea, Gerard Piqué, Owen Hargreaves, Anderson, Darren Fletcher, Nani, Park Ji-sung, Louis Saha" },
  { name: 'Juventus 2015', kit: 'repeating-linear-gradient(90deg,#111 0 6px,#f4f4f4 6px 12px)', owner: 'valen', formation: '4-3-1-2',
    xi: 'Gianluigi Buffon | Patrice Evra, Giorgio Chiellini, Leonardo Bonucci, Stephan Lichtsteiner | Paul Pogba, Andrea Pirlo, Claudio Marchisio | Arturo Vidal | Tevez, Álvaro Morata',
    bench: 'Marco Storari, Andrea Barzagli, Angelo Ogbonna, Simone Padoin, Roberto Pereyra, Stefano Sturaro, Simone Pepe, Llorente, Kingsley Coman, Alessandro Matri' },

  // ---------- CHRIS ----------
  { name: 'PSG 2013', kit: 'linear-gradient(90deg,#0b1d4a 0 38%,#d6142a 38% 62%,#0b1d4a 62%)', owner: 'chris', formation: '4-4-2',
    xi: 'Salvatore Sirigu | Maxwell, Mamadou Sakho, Thiago Silva, Christophe Jallet | Javier Pastore, Blaise Matuidi, Marco Verratti, Lucas Moura | Ezequiel Lavezzi, Ibrahimović',
    bench: 'Alex, Gregory van der Wiel, Thiago Motta, David Beckham, Clément Chantôme, Jérémy Ménez, Kevin Gameiro' },
  { name: 'Manchester City actual', kit: 'linear-gradient(135deg,#7cc4f2,#4a9fd8)', owner: 'chris', formation: '4-4-2',
    xi: "Gianluigi Donnarumma | Joško Gvardiol, Marc Guéhi, Rúben Dias, Abdukodir Khusanov | Phil Foden, Enzo Fernández, Elliot Anderson, Rayan Cherki | Semenyo, Haaland",
    bench: "Gerónimo Rulli, Rayan Aït-Nouri, Vitor Reis, Rico Lewis, Nico O'Reilly, Matheus Nunes, Mateo Kovačić, Ayyoub Bouaddi, Jérémy Doku, Iliman Ndiaye" },
  { name: 'Real Madrid 2015', kit: 'linear-gradient(135deg,#ffffff,#d9dde3)', owner: 'chris', formation: '4-3-3',
    xi: 'Iker Casillas | Marcelo, Sergio Ramos, Pepe, Dani Carvajal | James Rodríguez, Toni Kroos, Luka Modrić | Cristiano Ronaldo, Karim Benzema, Gareth Bale',
    bench: 'Keylor Navas, Raphaël Varane, Álvaro Arbeloa, Fábio Coentrão, Isco, Asier Illarramendi, Sami Khedira, Javier Hernández, Jesé' },

  // ---------- AGUS ----------
  { name: 'Real Madrid actual', kit: 'linear-gradient(135deg,#ffffff,#d9dde3)', owner: 'agus', formation: '4-2-3-1',
    xi: "Thibaut Courtois | Álvaro Carreras, Dean Huijsen, Ibrahima Konaté, Denzel Dumfries | Aurélien Tchouaméni, Federico Valverde | Vinícius, Jude Bellingham, Arda Güler | Mbappé",
    bench: "Andriy Lunin, Éder Militão, Trent Alexander-Arnold, Antonio Rüdiger, Raúl Asencio, Marc Cucurella, Ferland Mendy, Eduardo Camavinga, Bernardo Silva, Brahim Díaz, Rodrygo, Endrick, Gonzalo García" },
  { name: 'Estudiantes 2006', kit: 'repeating-linear-gradient(90deg,#d0101e 0 6px,#ffffff 6px 12px)', owner: 'agus', formation: '4-4-2',
    xi: 'Mariano Andújar | Germán Ré, Agustín Alayes, Leandro Desábato, Marcos Angeleri | José Sosa, Juan Sebastián Verón, Rodrigo Braña, Leandro Benítez | José Luis Calderón, Mariano Pavone',
    bench: 'Christian Cellay, Enzo Pérez, Diego Galván, Pablo Lugüercio' },
  { name: 'Barcelona 2006', kit: 'repeating-linear-gradient(90deg,#a50044 0 7px,#004d98 7px 14px)', owner: 'agus', formation: '4-3-3',
    xi: "Víctor Valdés | Giovanni van Bronckhorst, Carles Puyol, Rafael Márquez, Oleguer | Andrés Iniesta, Edmílson, Deco | Ronaldinho, Samuel Eto'o, Lionel Messi",
    bench: 'Juliano Belletti, Sylvinho, Xavi, Mark van Bommel, Thiago Motta, Gabri, Ludovic Giuly, Henrik Larsson, Maxi López' },
  { name: 'Manchester City 2012', kit: 'linear-gradient(135deg,#7cc4f2,#4a9fd8)', owner: 'agus', formation: '4-4-2',
    xi: 'Joe Hart | Gaël Clichy, Joleon Lescott, Vincent Kompany, Micah Richards | Samir Nasri, Yaya Touré, Gareth Barry, David Silva | Sergio Agüero, Edin Džeko',
    bench: 'Pablo Zabaleta, Aleksandar Kolarov, Nigel de Jong, James Milner, Adam Johnson, Mario Balotelli, Carlos Tevez' },

  // ---------- TITI ----------
  { name: 'Inter 1998', kit: 'repeating-linear-gradient(90deg,#0a3c9c 0 6px,#111 6px 12px)', owner: 'titi', formation: '4-3-1-2',
    xi: 'Gianluca Pagliuca | Javier Zanetti, Taribo West, Francesco Colonnese, Giuseppe Bergomi | Aron Winter, Diego Simeone, Francesco Moriero | Youri Djorkaeff | Ronaldo Nazário, Iván Zamorano',
    bench: 'Fabio Galante, Salvatore Fresi, Luigi Sartor, Zé Elias, Benoît Cauet, Álvaro Recoba, Kanu' },
  { name: 'Barcelona 2015', kit: 'repeating-linear-gradient(90deg,#a50044 0 7px,#004d98 7px 14px)', owner: 'titi', formation: '4-3-3',
    xi: 'Marc-André ter Stegen | Jordi Alba, Jérémy Mathieu, Gerard Piqué, Dani Alves | Andrés Iniesta, Sergio Busquets, Ivan Rakitić | Neymar, Luis Suárez, Lionel Messi',
    bench: 'Claudio Bravo, Javier Mascherano, Marc Bartra, Adriano, Thomas Vermaelen, Xavi, Sergi Roberto, Rafinha, Pedro, Munir' },
  { name: 'Arsenal actual', kit: 'linear-gradient(90deg,#ffffff 0 22%,#db0007 22% 78%,#ffffff 78%)', owner: 'titi', formation: '4-3-3',
    xi: "David Raya | Riccardo Calafiori, Gabriel Magalhães, Ezri Konsa, Ben White | Myles Lewis-Skelly, Declan Rice, Martin Ødegaard | Christos Tzolis, Havertz, Saka",
    bench: "Kepa Arrizabalaga, Illan Meslier, William Saliba, Cristhian Mosquera, Piero Hincapié, Jurriën Timber, Martín Zubimendi, Mikel Merino, Eberechi Eze, Bruno Guimarães, Max Dowman, Viktor Gyökeres, Noni Madueke" },
];

const strip = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Formación de un club: { formation, lines: [[arquero],[defensores]...], bench: [...] } o null. */
export function lineupOf(clubName) {
  const c = CLUB_SEED.find((x) => strip(x.name) === strip(clubName));
  if (!c) return null;
  return { formation: c.formation, lines: c.xi.split('|').map(list), bench: list(c.bench) };
}

/** Camiseta del club (CSS background) o null. */
export function kitOf(clubName) {
  return CLUB_SEED.find((x) => strip(x.name) === strip(clubName))?.kit || null;
}

/** Todos los jugadores del plantel (titulares + suplentes). */
export function squadOf(clubName) {
  const l = lineupOf(clubName);
  return l ? [...l.lines.flat(), ...l.bench] : [];
}

// Nombre corto para mostrar en la cancha
const ALIAS = {
  'cristiano ronaldo': 'C. Ronaldo', 'ronaldo nazario': 'Ronaldo', 'joao pedro': 'João Pedro', 'gabriel magalhaes': 'Gabriel',
  'guillermo barros schelotto': 'Guillermo', 'gustavo barros schelotto': 'Gustavo', 'park ji-sung': 'Park',
  'javier hernandez': 'Chicharito', 'juan roman riquelme': 'Riquelme', 'thiago silva': 'T. Silva', 'thiago motta': 'T. Motta',
  'bernardo silva': 'Bernardo', 'james rodriguez': 'James', 'lucas moura': 'Lucas', 'dani alves': 'Dani Alves',
  'jordi alba': 'Jordi Alba', 'sergio ramos': 'Ramos', 'yaya toure': 'Yaya Touré', 'luis suarez': 'Suárez',
  'nico gonzalez': 'N. González', 'enzo fernandez': 'Enzo', 'emiliano martinez': 'Dibu', 'elliot anderson': 'Anderson', 'morgan rogers': 'Rogers', 'marc guehi': 'Guéhi', 'gonzalo garcia': 'Gonzalo', 'fran garcia': 'Fran García', 'andrey santos': 'A. Santos',
  'brahim diaz': 'Brahim', 'sergi roberto': 'Sergi Roberto', 'pedro neto': 'Neto', 'rico lewis': 'Rico Lewis',
  'jose luis calderon': 'Calderón', 'kepa arrizabalaga': 'Kepa', 'roberto abbondanzieri': 'Abbondanzieri', 'rodolfo arruabarrena': 'Arruabarrena', 'leandro benitez': 'L. Benítez', 'juan sebastian veron': 'Verón', 'samuel eto\'o': "Eto'o",
};
const PARTICLES = new Set(['van', 'der', 'de', 'da', 'di', 'ter', 'dos', 'del', 'la']);
export function shortName(name = '') {
  const a = ALIAS[strip(name)];
  if (a) return a;
  const w = name.trim().split(/\s+/);
  if (w.length === 1) return w[0];
  let i = w.length - 1;
  while (i > 1 && PARTICLES.has(w[i - 1].toLowerCase())) i--;
  return w.slice(i).join(' ');
}

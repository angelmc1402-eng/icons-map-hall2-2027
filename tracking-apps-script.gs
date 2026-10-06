/* ICONS 2027 · Recuento de clics en sponsors (web / Instagram) de los mapas interactivos.
   Va pegado en el Apps Script de la hoja «ICONS 2027 · Clics sponsors» (Extensiones → Apps Script).
   Es el mismo para los dos pabellones: cada clic trae su pabellón.

   1. Ejecuta setup() una vez (crea las pestañas Clics, Resumen y Por día con sus fórmulas).
   2. Implementar → Nueva implementación → Aplicación web · Ejecutar como: yo · Acceso: cualquier usuario.
   3. Copia la URL que acaba en /exec y pégala en config.js → tracking.endpoint de los dos repos.

   No guarda cookies, IP ni identificadores: solo fecha, pabellón, sponsor, tipo, página, dispositivo e idioma. */

const TIPOS = ['web', 'instagram'];
const PAGINAS = ['map', 'internal'];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const limpio = (v, n) => String(v || '').replace(/[\r\n\t]/g, ' ').slice(0, n);
    if (!TIPOS.includes(d.type) || !d.sponsor) return out('ignored');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      hoja('Clics').appendRow([
        new Date(),
        limpio(d.hall, 20),
        limpio(d.sponsor, 80),
        d.type,
        PAGINAS.includes(d.page) ? d.page : 'map',
        d.device === 'mobile' ? 'mobile' : 'desktop',
        limpio(d.lang, 5)
      ]);
    } finally { lock.releaseLock(); }
    return out('ok');
  } catch (err) {
    return out('error');
  }
}

/* para comprobar que la URL funciona: abrirla en el navegador devuelve «ok» */
function doGet() { return out('ok'); }

function out(t) { return ContentService.createTextOutput(t); }

function hoja(nombre) {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(nombre) || ss.insertSheet(nombre);
}

/* Ejecutar UNA vez. Crea las pestañas y las fórmulas; todo se actualiza solo con cada clic.
   El Resumen y Por día solo cuentan el mapa público (página «map»), no la versión interna filters.html. */
function setup() {
  const c = hoja('Clics');
  if (c.getLastRow() === 0) {
    c.appendRow(['Fecha', 'Pabellón', 'Sponsor', 'Tipo', 'Página', 'Dispositivo', 'Idioma']);
    c.setFrozenRows(1);
    c.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
    c.getRange('1:1').setFontWeight('bold');
  }

  const r = hoja('Resumen');
  r.clear();
  r.getRange('A1:F1').setValues([['Sponsor', 'Pabellón', 'Clics web', 'Clics Instagram', 'Total', 'Móvil %']])
    .setFontWeight('bold');
  r.setFrozenRows(1);
  r.getRange('A2').setFormula('=IFERROR(SORT(UNIQUE(FILTER(Clics!C2:C, Clics!E2:E="map"))), "")');
  r.getRange('B2').setFormula('=ARRAYFORMULA(IF(A2:A="",, IFERROR(VLOOKUP(A2:A, {Clics!C2:C, Clics!B2:B}, 2, FALSE))))');
  r.getRange('C2').setFormula('=ARRAYFORMULA(IF(A2:A="",, COUNTIFS(Clics!C2:C, A2:A, Clics!D2:D, "web", Clics!E2:E, "map")))');
  r.getRange('D2').setFormula('=ARRAYFORMULA(IF(A2:A="",, COUNTIFS(Clics!C2:C, A2:A, Clics!D2:D, "instagram", Clics!E2:E, "map")))');
  r.getRange('E2').setFormula('=ARRAYFORMULA(IF(A2:A="",, C2:C + D2:D))');
  r.getRange('F2').setFormula('=ARRAYFORMULA(IF(A2:A="",, IFERROR(COUNTIFS(Clics!C2:C, A2:A, Clics!F2:F, "mobile", Clics!E2:E, "map") / E2:E, 0)))');
  r.getRange('F:F').setNumberFormat('0%');
  r.getRange('H1').setValue('Total clics').setFontWeight('bold');
  r.getRange('H2').setFormula('=COUNTIFS(Clics!E2:E, "map")');

  const p = hoja('Por día');
  p.clear();
  p.getRange('A1').setFormula(
    '=IFERROR(QUERY(Clics!A2:E, "select toDate(A), count(A) where E = \'map\' group by toDate(A) ' +
    'label toDate(A) \'Día\', count(A) \'Clics\'", 0), "Sin clics todavía")');
  p.getRange('A:A').setNumberFormat('dd/mm/yyyy');
}

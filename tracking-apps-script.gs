/* ICONS 2027 · Recuento de clics en sponsors (web / Instagram) de los mapas interactivos.
   Va pegado en el Apps Script de la hoja «ICONS 2027 · Clics sponsors» (Extensiones → Apps Script).
   Es el mismo para los dos pabellones: cada clic trae su pabellón.

   0. Tras pegar el código, recarga la hoja: aparece el menú «ICONS» (Rehacer Panel / Borrar clics).
   1. Ejecuta setup() (crea/rehace las pestañas Resumen y Panel con sus fórmulas, gráficos y formato).
      Se puede volver a ejecutar cuando se quiera: NO borra los clics.
   2. Implementar → Nueva implementación → Aplicación web · Ejecutar como: yo · Acceso: cualquier usuario.
      (Si ya está implementado y solo cambias setup(), no hace falta volver a implementar.)
   3. La URL que acaba en /exec va en config.js → tracking.endpoint de los dos repos.

   No guarda cookies, IP ni identificadores: solo fecha, pabellón, sponsor, tipo, página, dispositivo e idioma.
   Página «map» = mapa público. «internal» = filters.html (pruebas del equipo): no entra en las cifras. */

const TIPOS = ['web', 'instagram'];
const PAGINAS = ['map', 'internal'];

/* colores ICONS */
const COL = {
  ink: '#0f172a', ink2: '#475569', ink3: '#94a3b8',
  purple: '#7c3aed', purpleSoft: '#f5f3ff', purpleLine: '#ddd6fe',
  web: '#3b82f6', ig: '#e1306c', line: '#e2e8f0', paper: '#ffffff', soft: '#f8fafc'
};

/* ---------------- recepción de clics ---------------- */

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

/* ---------------- fórmulas según la configuración regional ---------------- */

/* Las fórmulas se escriben con comas (formato inglés). Si la hoja está en configuración regional
   española (coma decimal), Sheets espera punto y coma: se detecta y se convierten solas. */
function separador_() {
  const t = hoja('Clics').getRange('Z1');
  t.setFormula('=SUM(1,2)');
  SpreadsheetApp.flush();
  const ok = t.getDisplayValue() === '3';
  t.clear();
  return ok ? ',' : ';';
}
function f_(formula, sep) {
  if (sep === ',') return formula;
  let out = '', enComillas = false;
  for (const ch of formula) {
    if (ch === '"') enComillas = !enComillas;
    out += (ch === ',' && !enComillas) ? ';' : ch;
  }
  return out;
}

/* Rangos con nombre para que las fórmulas se lean solas */
const R = {
  F: 'Clics!$A$2:$A', H: 'Clics!$B$2:$B', S: 'Clics!$C$2:$C', T: 'Clics!$D$2:$D',
  P: 'Clics!$E$2:$E', D: 'Clics!$F$2:$F', L: 'Clics!$G$2:$G'
};
function x_(s) { return s.replace(/\{(\w)\}/g, (m, k) => R[k]); }

/* ---------------- menú ICONS en la hoja ---------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('ICONS')
    .addItem('Rehacer Panel y Resumen', 'setup')
    .addSeparator()
    .addItem('Borrar todos los clics (empezar de cero)…', 'borrarClics')
    .addToUi();
}

/* Deja Clics vacía (solo la cabecera). Para quitar las pruebas antes de abrir el mapa al público.
   No deja rastro: Panel y Resumen vuelven a cero solos. Pide confirmación. */
function borrarClics() {
  const ui = SpreadsheetApp.getUi();
  const c = hoja('Clics');
  const n = Math.max(0, c.getLastRow() - 1);
  if (!n) { ui.alert('Clics ya está vacía.'); return; }
  const r = ui.alert('Borrar ' + n + ' clics', 'Se borran TODOS los clics registrados y no se pueden recuperar. ¿Seguro?',
                     ui.ButtonSet.YES_NO);
  if (r !== ui.Button.YES) return;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { c.getRange(2, 1, n, 7).clearContent(); } finally { lock.releaseLock(); }
  ui.alert('Listo: Clics vacía. Los clics nuevos empiezan a contar desde ahora.');
}

/* ---------------- setup ---------------- */

function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone('Europe/Madrid');

  const c = hoja('Clics');
  if (c.getLastRow() === 0) c.appendRow(['Fecha', 'Pabellón', 'Sponsor', 'Tipo', 'Página', 'Dispositivo', 'Idioma']);
  c.setFrozenRows(1);
  c.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm:ss');
  c.getRange('A1:G1').setFontWeight('bold').setBackground(COL.ink).setFontColor('#ffffff');
  c.setColumnWidths(1, 7, 120);

  const sep = separador_();
  resumen_(sep);
  panel_(sep);

  /* fuera la pestaña antigua y la Hoja 1 vacía si sigue ahí */
  ['Por día', 'Hoja 1', 'Sheet1'].forEach(n => {
    const s = ss.getSheetByName(n);
    if (s && ss.getSheets().length > 1 && (n === 'Por día' || s.getLastRow() === 0)) ss.deleteSheet(s);
  });
  ss.setActiveSheet(hoja('Panel'));
  ss.moveActiveSheet(1);
  ss.setActiveSheet(hoja('Resumen'));
  ss.moveActiveSheet(2);
}

/* ---- Resumen: una fila por sponsor, ordenado de más a menos clics ---- */
function resumen_(sep) {
  const r = hoja('Resumen');
  r.clear(); r.clearConditionalFormatRules();
  r.getCharts().forEach(ch => r.removeChart(ch));
  r.setHiddenGridlines(true);

  r.getRange('A1').setValue('Clics por sponsor · mapa público').setFontSize(16).setFontWeight('bold').setFontColor(COL.ink);
  r.getRange('A2').setValue('Se actualiza solo con cada clic. No incluye las pruebas desde filters.html.')
    .setFontColor(COL.ink3).setFontSize(9);

  const head = ['Sponsor', 'Pabellón', 'Web', 'Instagram', 'Total', '% del total', 'Móvil', 'Escritorio', '% móvil', 'Último clic', 'Peso'];
  r.getRange(4, 1, 1, head.length).setValues([head])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground(COL.purple).setVerticalAlignment('middle');
  r.setRowHeight(4, 30);
  r.setFrozenRows(4);

  const F = s => r.getRange(s);
  /* lista de sponsors ordenada por total de clics (desc) */
  F('A5').setFormula(f_(x_('=IFERROR(LET(s, UNIQUE(FILTER({S}, {P}="map")), SORT(s, COUNTIFS({S}, s, {P}, "map"), FALSE)), "")'), sep));
  const col = (letra, expr) => F(letra + '5').setFormula(f_(x_('=ARRAYFORMULA(IF(A5:A="",, ' + expr + '))'), sep));
  col('B', 'IFERROR(XLOOKUP(A5:A, {S}, {H}, ""), "")');
  col('C', 'COUNTIFS({S}, A5:A, {T}, "web", {P}, "map")');
  col('D', 'COUNTIFS({S}, A5:A, {T}, "instagram", {P}, "map")');
  col('E', 'C5:C + D5:D');
  col('F', 'IFERROR(E5:E / COUNTIFS({P}, "map"), 0)');
  col('G', 'COUNTIFS({S}, A5:A, {D}, "mobile", {P}, "map")');
  col('H', 'COUNTIFS({S}, A5:A, {D}, "desktop", {P}, "map")');
  col('I', 'IFERROR(G5:G / E5:E, 0)');
  F('J5').setFormula(f_(x_('=MAP(A5:A200, LAMBDA(s, IF(s="",, IFERROR(MAXIFS({F}, {S}, s, {P}, "map"), ""))))'), sep));
  col('K', 'REPT("█", ROUND(IFERROR(E5:E / MAX(E5:E), 0) * 20))');

  /* formato */
  F('C5:E').setNumberFormat('#,##0');
  F('G5:H').setNumberFormat('#,##0');
  F('F5:F').setNumberFormat('0.0%');
  F('I5:I').setNumberFormat('0%');
  F('J5:J').setNumberFormat('dd/mm hh:mm');
  F('A5:A').setFontWeight('bold').setFontColor(COL.ink);
  F('C5:C').setFontColor(COL.web);
  F('D5:D').setFontColor(COL.ig);
  F('E5:E').setFontWeight('bold');
  F('K5:K').setFontColor(COL.purple).setFontFamily('Arial');
  F('C4:J').setHorizontalAlignment('center');
  r.setColumnWidth(1, 200); r.setColumnWidth(2, 80);
  r.setColumnWidths(3, 7, 82); r.setColumnWidth(10, 110); r.setColumnWidth(11, 170);

  /* filas alternas suaves y línea bajo cada sponsor */
  const banda = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(f_('=AND($A5<>"", ISEVEN(ROW()))', sep)).setBackground(COL.purpleSoft)
    .setRanges([F('A5:K200')]).build();
  r.setConditionalFormatRules([banda]);
}

/* ---- Panel: cifras clave, por día, por hora, por pabellón e idioma, y gráficos ---- */
function panel_(sep) {
  const p = hoja('Panel');
  p.clear(); p.clearConditionalFormatRules();
  p.getCharts().forEach(ch => p.removeChart(ch));
  p.setHiddenGridlines(true);
  const F = s => p.getRange(s);
  const set = (a1, f) => F(a1).setFormula(f_(x_(f), sep));

  p.setColumnWidths(1, 14, 92);
  F('A1').setValue('ICONS 2027 · Clics a sponsors desde el mapa').setFontSize(18).setFontWeight('bold').setFontColor(COL.ink);
  F('A2').setValue('Cifras del mapa público (sin pruebas internas). Todo se actualiza solo.').setFontColor(COL.ink3).setFontSize(9);

  /* tarjetas de cifras: etiqueta arriba, número grande abajo, cada una en 2 columnas */
  const tarjetas = [
    ['Clics totales', '=COUNTIFS({P}, "map")', '#,##0', COL.ink],
    ['A webs', '=COUNTIFS({P}, "map", {T}, "web")', '#,##0', COL.web],
    ['A Instagram', '=COUNTIFS({P}, "map", {T}, "instagram")', '#,##0', COL.ig],
    ['Desde móvil', '=IFERROR(COUNTIFS({P}, "map", {D}, "mobile") / COUNTIFS({P}, "map"), 0)', '0%', COL.ink],
    ['Sponsors con clics', '=IFERROR(ROWS(UNIQUE(FILTER({S}, {P}="map"))), 0)', '0', COL.purple],
    ['Último clic', '=IFERROR(MAX(FILTER({F}, {P}="map")), "—")', 'dd/mm hh:mm', COL.ink]
  ];
  tarjetas.forEach((t, i) => {
    const c0 = 1 + i * 2;
    p.getRange(4, c0, 1, 2).merge();
    p.getRange(5, c0, 1, 2).merge();
    p.getRange(4, c0).setValue(t[0]).setFontSize(9).setFontColor(COL.ink2).setFontWeight('bold');
    p.getRange(5, c0).setFormula(f_(x_(t[1]), sep)).setFontSize(22).setFontWeight('bold').setFontColor(t[3]).setNumberFormat(t[2]);
    p.getRange(4, c0, 2, 2).setBackground(COL.soft).setHorizontalAlignment('left')
      .setBorder(true, true, true, true, false, false, COL.line, SpreadsheetApp.BorderStyle.SOLID);
  });
  p.setRowHeight(5, 44);
  F('A6').setValue('Pruebas internas (filters.html), no incluidas:').setFontSize(9).setFontColor(COL.ink3);
  set('E6', '=COUNTIFS({P}, "internal")');
  F('E6').setFontSize(9).setFontColor(COL.ink3).setHorizontalAlignment('left');

  const cabecera = (rango) => F(rango).setFontWeight('bold').setFontColor('#ffffff').setBackground(COL.purple).setHorizontalAlignment('center');
  const titulo = (a1, txt) => F(a1).setValue(txt).setFontSize(12).setFontWeight('bold').setFontColor(COL.ink);

  /* POR DÍA (A:G, desde la fila 9) */
  titulo('A8', 'Por día');
  F('A9:G9').setValues([['Día', 'Web', 'Instagram', 'Total', 'Móvil', 'Escritorio', 'Sponsors']]);
  cabecera('A9:G9');
  set('A10', '=IFERROR(SORT(UNIQUE(FILTER(INT({F}), {P}="map", {F}<>""))), "")');
  const dia = (letra, expr) => set(letra + '10', '=ARRAYFORMULA(IF(A10:A="",, ' + expr + '))');
  const enDia = '{F}, ">="&A10:A, {F}, "<"&(A10:A+1), {P}, "map"';
  dia('B', 'COUNTIFS(' + enDia + ', {T}, "web")');
  dia('C', 'COUNTIFS(' + enDia + ', {T}, "instagram")');
  dia('D', 'B10:B + C10:C');
  dia('E', 'COUNTIFS(' + enDia + ', {D}, "mobile")');
  dia('F', 'COUNTIFS(' + enDia + ', {D}, "desktop")');
  F('G10').setFormula(f_(x_('=MAP(A10:A60, LAMBDA(d, IF(d="",, IFERROR(ROWS(UNIQUE(FILTER({S}, INT({F})=d, {P}="map"))), 0))))'), sep));
  F('A10:A').setNumberFormat('ddd dd/mm/yyyy');
  F('B10:G').setHorizontalAlignment('center');
  F('B10:B').setFontColor(COL.web); F('C10:C').setFontColor(COL.ig); F('D10:D').setFontWeight('bold');
  p.setColumnWidth(1, 130);

  /* POR HORA (I:J) — para ver las horas punta del evento */
  titulo('I8', 'Por hora');
  F('I9:J9').setValues([['Hora', 'Clics']]);
  cabecera('I9:J9');
  F('I10').setFormula(f_('=ARRAYFORMULA(TEXT(SEQUENCE(24, 1, 0), "00") & ":00")', sep));
  set('J10', '=MAP(SEQUENCE(24, 1, 0), LAMBDA(h, SUMPRODUCT(({F}<>"") * (HOUR({F})=h) * ({P}="map"))))');
  F('I10:J33').setHorizontalAlignment('center');
  const calor = rango => SpreadsheetApp.newConditionalFormatRule()
    .setGradientMinpointWithValue('#ffffff', SpreadsheetApp.InterpolationType.NUMBER, '0')
    .setGradientMaxpoint('#c4b5fd').setRanges([rango]).build();   /* lila claro: el número se sigue leyendo */
  p.setConditionalFormatRules([calor(F('J10:J33')), calor(F('D10:D60'))]);

  /* POR PABELLÓN (L:M) e IDIOMA (L:M más abajo) */
  titulo('L8', 'Por pabellón');
  F('L9:M9').setValues([['Pabellón', 'Clics']]);
  cabecera('L9:M9');
  set('L10', '=IFERROR(QUERY(FILTER({H}, {P}="map"), "select Col1, count(Col1) group by Col1 label Col1 \'\', count(Col1) \'\'", 0), "")');

  titulo('L15', 'Por idioma del navegador');
  F('L16:M16').setValues([['Idioma', 'Clics']]);
  cabecera('L16:M16');
  set('L17', '=IFERROR(QUERY(FILTER(LEFT({L}, 2), {P}="map"), "select Col1, count(Col1) group by Col1 order by count(Col1) desc label Col1 \'\', count(Col1) \'\'", 0), "")');
  F('L10:M30').setHorizontalAlignment('center');

  /* REPARTO (O:P) — datos de los gráficos de porcentajes */
  titulo('O8', 'Reparto');
  F('O9:P9').setValues([['Destino', 'Clics']]);
  cabecera('O9:P9');
  F('O10:O11').setValues([['Web'], ['Instagram']]);
  set('P10', '=COUNTIFS({P}, "map", {T}, "web")');
  set('P11', '=COUNTIFS({P}, "map", {T}, "instagram")');
  F('O13:P13').setValues([['Dispositivo', 'Clics']]);
  cabecera('O13:P13');
  F('O14:O15').setValues([['Móvil'], ['Escritorio']]);
  set('P14', '=COUNTIFS({P}, "map", {D}, "mobile")');
  set('P15', '=COUNTIFS({P}, "map", {D}, "desktop")');
  F('O10:P15').setHorizontalAlignment('center');
  p.setColumnWidth(15, 110);

  /* gráficos */
  const graf = (rangos, tipo, fila, col, titulo, opciones) => {
    let b = p.newChart().setChartType(tipo).setPosition(fila, col, 0, 0)
      .setOption('title', titulo).setOption('legend', { position: 'top' })
      .setOption('width', 560).setOption('height', 300)
      .setOption('backgroundColor', COL.paper).setOption('titleTextStyle', { color: COL.ink, fontSize: 13, bold: true });
    rangos.forEach(rg => { b = b.addRange(rg); });
    b = b.setNumHeaders(1);
    Object.keys(opciones || {}).forEach(k => { b = b.setOption(k, opciones[k]); });
    p.insertChart(b.build());
  };
  /* donuts con porcentajes: un dato de un vistazo */
  const donut = (rangos, col, titulo, colores, fila) => graf(rangos, Charts.ChartType.PIE, fila || 36, col, titulo, {
    /* solo opciones que los gráficos de Sheets entienden: otras (chartArea, textStyle…) los dejan en blanco */
    pieHole: 0.5, pieSliceText: 'percentage', colors: colores, width: 380, height: 280,
    legend: { position: 'right' }
  });
  donut([F('O9:P11')], 1, 'Web vs Instagram', [COL.web, COL.ig]);
  donut([F('O13:P15')], 5, 'Móvil vs escritorio', [COL.purple, COL.ink3]);
  donut([F('L9:M12')], 9, 'Por pabellón', ['#0ea5e9', '#f59e0b', COL.purple]);

  graf([F('A9:C60')], Charts.ChartType.COLUMN, 52, 1, 'Clics por día (web / Instagram)',
       { isStacked: true, colors: [COL.web, COL.ig] });
  graf([F('I9:J33')], Charts.ChartType.COLUMN, 52, 8, 'Clics por hora del día',
       { colors: [COL.purple], legend: { position: 'none' } });

  const res = hoja('Resumen');
  donut([res.getRange('A4:A40'), res.getRange('E4:E40')], 1, 'Cuota de clics por sponsor',
        [COL.purple, COL.web, COL.ig, '#f59e0b', '#10b981', '#0ea5e9', '#ef4444', '#64748b', '#a855f7', '#14b8a6'], 69);
  graf([res.getRange('A4:A40'), res.getRange('C4:D40')], Charts.ChartType.BAR, 69, 6, 'Clics por sponsor',
       { isStacked: true, colors: [COL.web, COL.ig], height: 360, width: 620 });
}

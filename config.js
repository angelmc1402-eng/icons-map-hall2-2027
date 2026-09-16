/* ICONS 2027 · HALL 2 · configuración única.
   La leen index.html, filters.html, builder.html y builder-sellers.html.
   Es el único fichero que hay que tocar para precios, colores o categorías. */

window.ICONS_CONFIG = {

    hallName:  'HALL 2',
    hallLabel: 'Pabellón 2 · TCG, Sport Cards',
    mapImage:  'Hall 2.png',

    /* Google Sheets como CSV. La URL de /edit NO sirve, tiene que devolver CSV:
         compartida como lector -> .../d/ID_LIBRO/gviz/tq?tqx=out:csv&gid=NNN
         publicada en la web    -> .../d/e/2PACX-.../pub?gid=NNN&single=true&output=csv
       Columnas (fila 1 = cabecera, se ignora):
         A libre · B estado (VENDIDA/SOLD = agotada) · C id de mesa · D expositor (opcional) */
    csvUrl: 'https://docs.google.com/spreadsheets/d/1b9mT5RqDehK0-28XoN2LCMg80D7Yv8uHFVDbofPK0gw/gviz/tq?tqx=out:csv&gid=672655889',
    csvRefreshMs: 120000,

    /* key = prefijo del id (DIECAST-A-1) · label = lo que ve el público */
    categories: [
        { key: 'TCG',   label: 'TCG' },
        { key: 'SPORT', label: 'Sport Cards' }
    ],

    /* price = tarifa; se muestra tachada y al lado el precio con descuento */
    types: {
        collector: {
            label: 'Collector Table',
            price: 100,
            palette: { light: '#6ee7b7', base: '#10b981', dark: '#047857' }
        },
        commercial: {
            label: 'Commercial Table',
            price: 250,
            palette: { light: '#93c5fd', base: '#3b82f6', dark: '#1d4ed8' }
        }
    },

    /* active:false -> solo se muestra la tarifa. label = solo la leyenda de filters.html */
    earlyBird: { active: true, discount: 0.15, label: 'EARLY BIRD −15%' },

    soldColor: '#e11d48',
    soldLabel: 'SOLD OUT',

    /* size y border en px de pantalla · zoom = aumento sobre la vista completa
       enabled:false -> sin lupa, y en ×1 vuelven las fichas de mesa */
    loupe: { enabled: true, size: 280, zoom: 3, border: 3 },

    tones: [
        { key: 'light', label: 'Claro' },
        { key: 'base',  label: 'Base' },
        { key: 'dark',  label: 'Oscuro' }
    ],

    /* medidas del builder, en % del plano. Mesa real de HALL 2: 86x26 px sobre 7686x5372 */
    defaults: {
        horizontal: { w: 1.1189, h: 0.4840 },
        vertical:   { w: 0.3383, h: 1.6194 },
        gapX: 0.04,
        gapY: 0.07,
        cloneGap: 0.30,
        /* hueco máximo en px del plano para que el builder considere dos mesas
           de la misma isla: mayor que el hueco interior del anillo (~79 px) y
           menor que la separación entre anillos (>165 px) */
        islandGapPx: 110,
        ring: { top: 2, side: 8, bottom: 2 }
    }
};

/* ---- helpers compartidos · no hace falta tocar nada de aquí abajo ---- */
(function () {
    const C = window.ICONS_CONFIG;

    /* color de una mesa: tipo + tono, o color propio si lo trae */
    C.colorFor = function (type, tone, custom) {
        if (custom) return custom;
        const t = C.types[type] || C.types.collector;
        return (t.palette && t.palette[tone]) || t.palette.base;
    };

    /* hex -> rgba con alpha */
    C.rgba = function (hex, alpha) {
        const h = String(hex || '#2ecc71').replace('#', '');
        const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const n = parseInt(full, 16);
        const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    };

    /* oscurece un hex un % (0-1) */
    C.shade = function (hex, amount) {
        const h = String(hex || '#2ecc71').replace('#', '');
        const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const n = parseInt(full, 16);
        let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        r = Math.max(0, Math.min(255, Math.round(r * (1 - amount))));
        g = Math.max(0, Math.min(255, Math.round(g * (1 - amount))));
        b = Math.max(0, Math.min(255, Math.round(b * (1 - amount))));
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    };

    /* "DIECAST-A-1" -> "DIECAST-A" */
    C.groupKey = function (id) {
        id = String(id || '').trim();
        if (!id) return 'SIN-ID';
        return id.replace(/-\d+$/, '');
    };

    /* "DIECAST-A-1" -> 1 */
    C.tableNumber = function (id) {
        const m = String(id || '').match(/-(\d+)$/);
        return m ? parseInt(m[1], 10) : null;
    };

    /* "DIECAST-A-1" -> { cat, catLabel, zone, num } */
    C.parseId = function (id) {
        const parts = String(id || '').split('-');
        const catKey = (parts[0] || '').toUpperCase();
        const found = C.categories.find(c => c.key === catKey);
        return {
            cat: catKey,
            catLabel: found ? found.label : (catKey || '—'),
            zone: parts.length >= 3 ? parts[1] : '—',
            num: parts.length >= 3 ? parts[2] : (parts[1] || '—')
        };
    };

    /* 100 -> "100,00 €" */
    C.euro = function (value) {
        return value.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' €';
    };

    /* -> { base:'100,00 €', early:'85,00 €'|null }
       units = nº de mesas (las esquinas van de dos en dos) */
    C.priceFor = function (type, units) {
        const t = C.types[type] || C.types.collector;
        const n = units > 0 ? units : 1;
        const total = t.price * n;
        const base = C.euro(total);
        if (!C.earlyBird.active) return { base, early: null };
        return { base, early: C.euro(total * (1 - C.earlyBird.discount)) };
    };

    /* ---- ESQUINAS ---------------------------------------------------
       Las mesas que hacen esquina se contratan juntas, nunca sueltas.
       Una esquina son dos mesas de la misma isla, una horizontal y una
       vertical, que se tocan por un extremo y comparten el borde de
       arriba o el de abajo. Se detecta sobre la geometría real del
       plano, así que si se redibuja no hay que tocar nada de aquí. */
    C.corner = {
        tol: 0.14,          /* % del plano; menor que el ancho de una mesa (0.33) */
        pairs: new Map(),   /* id de mesa -> id de su pareja */

        /* recibe los nodos .mesa ya insertados y rellena el mapa.
           Hay dos formas de montar una esquina y las dos cuentan:
             A) la mesa horizontal va AL LADO de la vertical (se tocan en X
                y comparten el borde de arriba o el de abajo)
             B) la mesa horizontal va ENCIMA o DEBAJO de la vertical (se
                tocan en Y y comparten el borde izquierdo o el derecho)
           Los candidatos se ordenan por cercanía y se asignan de uno en uno,
           así que ninguna mesa puede acabar en dos parejas. */
        build: function (nodes) {
            const caja = function (el) {
                const x = parseFloat(el.style.left), y = parseFloat(el.style.top);
                const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
                return { id: el.dataset.info || '', x: x, y: y, x2: x + w, y2: y + h,
                         isla: String(el.dataset.info || '').replace(/-\d+$/, ''),
                         horiz: w > h, ok: isFinite(x) && isFinite(y) && isFinite(w) && isFinite(h) };
            };
            const todas = Array.prototype.map.call(nodes, caja).filter(function (b) { return b.id && b.ok; });
            const H = todas.filter(function (b) { return b.horiz; });
            const V = todas.filter(function (b) { return !b.horiz; });
            const t = C.corner.tol, cand = [];

            H.forEach(function (h) {
                V.forEach(function (v) {
                    if (h.isla !== v.isla) return;
                    const dxA = Math.min(Math.abs(v.x2 - h.x), Math.abs(h.x2 - v.x));
                    const dyA = Math.min(Math.abs(h.y  - v.y), Math.abs(h.y2 - v.y2));
                    if (dxA < t && dyA < t) cand.push([dxA + dyA, h.id, v.id]);

                    const dyB = Math.min(Math.abs(v.y2 - h.y), Math.abs(h.y2 - v.y));
                    const dxB = Math.min(Math.abs(h.x  - v.x), Math.abs(h.x2 - v.x2));
                    if (dyB < t && dxB < t) cand.push([dyB + dxB, h.id, v.id]);
                });
            });

            cand.sort(function (a, b) { return a[0] - b[0]; });
            const pares = new Map();
            cand.forEach(function (c) {
                if (pares.has(c[1]) || pares.has(c[2])) return;
                pares.set(c[1], c[2]);
                pares.set(c[2], c[1]);
            });
            C.corner.pairs = pares;
            return pares.size / 2;
        },
        partner: function (id) { return C.corner.pairs.get(id) || null; },
        is:      function (id) { return C.corner.pairs.has(id); }
    };
})();

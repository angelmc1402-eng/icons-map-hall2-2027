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

    /* RECUENTO DE CLICS en las fichas de sponsors (web / Instagram).
       endpoint = URL /exec del Apps Script de la hoja «ICONS 2027 · Clics sponsors».
       Vacío = no se cuenta nada. Las UTM se añaden solas a las webs (no a Instagram);
       si un enlace ya trae sus propias utm_, se respeta. */
    tracking: {
        endpoint: 'https://script.google.com/macros/s/AKfycbyCYgCFn9OIzmw4MzK5EHW34pGYBkW3jRATBKQVbL_AQ3AlnWHuzEuSuQ8La1S0BeuE/exec',
        utm: { utm_source: 'iconscollectibles', utm_medium: 'floor_map', utm_campaign: 'icons2027' }
    },

    /* size y border en px de pantalla · zoom = aumento sobre la vista completa
       enabled:false -> sin lupa, y en ×1 vuelven las fichas de mesa */
    loupe: { enabled: true, size: 280, zoom: 3, border: 3 },

    /* CUARTOS DE ISLA · zonas que solo se venden por bloques fijos.
       Cada bloque = la mesa vertical de la esquina + las 2 horizontales anexas.
       Precio = suma de las mesas del bloque (3 x tarifa del tipo).
       Basta con que una mesa del bloque esté vendida para que salga todo el bloque SOLD OUT. */
    blocks: {
        label: 'Quarter island',
        list: [
            ['TCG-R-1',  'TCG-R-12', 'TCG-R-11'], ['TCG-R-2',  'TCG-R-3',  'TCG-R-4'],
            ['TCG-R-7',  'TCG-R-5',  'TCG-R-6'],  ['TCG-R-8',  'TCG-R-9',  'TCG-R-10'],
            ['TCG-R-13', 'TCG-R-24', 'TCG-R-23'], ['TCG-R-14', 'TCG-R-15', 'TCG-R-16'],
            ['TCG-R-19', 'TCG-R-17', 'TCG-R-18'], ['TCG-R-20', 'TCG-R-21', 'TCG-R-22'],
            ['TCG-S-1',  'TCG-S-12', 'TCG-S-11'], ['TCG-S-2',  'TCG-S-3',  'TCG-S-4'],
            ['TCG-S-7',  'TCG-S-5',  'TCG-S-6'],  ['TCG-S-8',  'TCG-S-9',  'TCG-S-10'],
            ['TCG-S-13', 'TCG-S-24', 'TCG-S-23'], ['TCG-S-14', 'TCG-S-15', 'TCG-S-16'],
            ['TCG-S-19', 'TCG-S-17', 'TCG-S-18'], ['TCG-S-20', 'TCG-S-21', 'TCG-S-22']
        ]
    },

    tones: [
        { key: 'light', label: 'Claro' },
        { key: 'base',  label: 'Base' },
        { key: 'dark',  label: 'Oscuro' }
    ],

    /* STANDS · huecos verdes del plano (relleno #8BEDC3, borde #00857C), en px del PNG.
       Los usa builder-sellers.html para crear sellers encajados al milímetro, y el mapa
       público para el redondeo del logo. Si cambia el PNG, se regeneran con el script de detección.
       r = radio de esquina en px del plano. */
    stands: {
        imageW: 7686, imageH: 5372,
        freeRadius: 14,
        list: [
            { id:'S01', group:'TCG Stands', x:3011, y:565, w:233, h:381, r:27 },
            { id:'S02', group:'TCG Stands', x:3452, y:565, w:232, h:381, r:27 },
            { id:'S03', group:'TCG Stands', x:3849, y:566, w:233, h:380, r:27 },
            { id:'S04', group:'TCG Stands', x:2967, y:1346, w:321, h:618, r:27 },
            { id:'S05', group:'TCG Stands', x:3452, y:1348, w:232, h:618, r:27 },
            { id:'S06', group:'TCG Stands', x:3849, y:1347, w:233, h:618, r:27 },
            { id:'S07', group:'Sports Card Stands', x:4422, y:1424, w:321, h:618, r:27 },
            { id:'S08', group:'TCG Stands', x:2967, y:2209, w:321, h:795, r:27 },
            { id:'S09', group:'TCG Stands', x:3452, y:2209, w:232, h:795, r:27 },
            { id:'S10', group:'TCG Stands', x:3849, y:2208, w:233, h:795, r:27 },
            { id:'S11', group:'Sports Card Stands', x:4422, y:2318, w:321, h:795, r:27 },
            { id:'S12', group:'TCG Stands', x:3011, y:3215, w:381, h:233, r:27 },
            { id:'S13', group:'TCG Stands', x:3658, y:3215, w:381, h:233, r:27 },
            { id:'S14', group:'Sports Card Stands', x:4392, y:3274, w:381, h:232, r:27 },
            { id:'S15', group:'Stands TCG', x:879, y:3504, w:354, h:337, r:27 },
            { id:'S16', group:'Stands TCG', x:1246, y:3504, w:354, h:337, r:27 },
            { id:'S17', group:'Stands TCG', x:1614, y:3504, w:354, h:337, r:27 },
            { id:'S18', group:'Stands TCG', x:2268, y:3504, w:354, h:337, r:27 },
            { id:'S19', group:'TCG Stands', x:3011, y:3623, w:381, h:233, r:27 },
            { id:'S20', group:'TCG Stands', x:3658, y:3623, w:381, h:233, r:27 },
            { id:'S21', group:'Sports Card Stands', x:4392, y:3682, w:381, h:232, r:27 }
        ]
    },

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

    /* ---- STANDS (huecos verdes) ------------------------------------ */
    /* slot en px del plano -> caja en % del plano + radio en % de la propia caja */
    C.standBox = function (s) {
        const W = C.stands.imageW, H = C.stands.imageH;
        return { id: s.id, group: s.group, r: s.r,
                 l: s.x / W * 100, t: s.y / H * 100, w: s.w / W * 100, h: s.h / H * 100 };
    };
    C.standById = function (id) {
        const s = ((C.stands && C.stands.list) || []).find(function (x) { return x.id === id; });
        return s ? C.standBox(s) : null;
    };
    /* stand cuyo marco contiene el punto (x, y en % del plano) */
    C.standAt = function (x, y) {
        const l = (C.stands && C.stands.list) || [];
        for (let i = 0; i < l.length; i++) {
            const b = C.standBox(l[i]);
            if (x >= b.l && x <= b.l + b.w && y >= b.t && y <= b.t + b.h) return b;
        }
        return null;
    };
    /* border-radius CSS para una caja de wPct x hPct (% del plano) con radio rPx (px del plano).
       En % de la propia caja, así escala con el zoom y nunca se sale del marco. */
    C.radiusCss = function (wPct, hPct, rPx) {
        const W = (C.stands && C.stands.imageW) || 1, H = (C.stands && C.stands.imageH) || 1;
        const wpx = wPct / 100 * W, hpx = hPct / 100 * H;
        if (!(wpx > 0 && hpx > 0)) return '';
        const r = Math.min(rPx, wpx / 2, hpx / 2);
        return (r / wpx * 100).toFixed(3) + '% / ' + (r / hpx * 100).toFixed(3) + '%';
    };

    /* encaja un .sponsor-zone del mapa público: si trae data-slot (o cae dentro de un
       stand verde con tamaño parecido) toma la geometría exacta del stand, y le pone el
       mismo redondeo. Devuelve false si el seller no tiene ni nombre ni logo (no se pinta). */
    C.fitSeller = function (el) {
        if (!(el.dataset.name || '').trim() && !(el.dataset.logo || '').trim()) return false;
        const p = function (v) { return parseFloat(String(v || '').replace('%', '')) || 0; };
        let w = p(el.style.width), h = p(el.style.height);
        let b = el.dataset.slot ? C.standById(el.dataset.slot) : null;
        if (!b && C.stands) {
            const c = C.standAt(p(el.style.left) + w / 2, p(el.style.top) + h / 2);
            if (c && (w * h) / (c.w * c.h) >= 0.4) b = c;
        }
        let r = parseFloat(el.dataset.r) || (C.stands && C.stands.freeRadius) || 14;
        if (b) {
            el.style.left = b.l + '%'; el.style.top = b.t + '%';
            el.style.width = b.w + '%'; el.style.height = b.h + '%';
            w = b.w; h = b.h; r = b.r;
        }
        const css = C.radiusCss(w, h, r);
        if (css) el.style.borderRadius = css;
        return true;
    };

    /* añade las UTM de tracking.utm a una web (no a Instagram ni a enlaces que ya traen utm_) */
    C.withUtm = function (url) {
        const utm = C.tracking && C.tracking.utm;
        if (!url || !utm || /instagram\.com/i.test(url) || /[?&]utm_/i.test(url)) return url;
        try {
            const u = new URL(url);
            Object.keys(utm).forEach(function (k) { u.searchParams.set(k, utm[k]); });
            return u.toString();
        } catch (e) { return url; }
    };

    /* cuenta un clic en la hoja (sin cookies ni identificadores: solo sponsor, tipo, pabellón y dispositivo) */
    C.trackClick = (function () {
        let last = '', lastT = 0;
        return function (data) {
            const ep = C.tracking && C.tracking.endpoint;
            if (!ep) return;
            const key = data.sponsor + '|' + data.type;
            if (key === last && Date.now() - lastT < 3000) return;   /* doble clic = 1 */
            last = key; lastT = Date.now();
            const body = JSON.stringify(Object.assign({
                hall: C.hallName,
                device: window.matchMedia('(hover: none)').matches ? 'mobile' : 'desktop',
                lang: (navigator.language || '').slice(0, 5)
            }, data));
            try {
                if (navigator.sendBeacon && navigator.sendBeacon(ep, body)) return;
            } catch (e) {}
            try { fetch(ep, { method: 'POST', body: body, mode: 'no-cors', keepalive: true }); } catch (e) {}
        };
    })();

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
            /* las mesas de un bloque fijo (cuartos de isla) no entran en el emparejado de esquinas */
            const enBloque = new Map();
            ((C.blocks && C.blocks.list) || []).forEach(function (bl) {
                bl.forEach(function (id) { enBloque.set(id, bl.slice()); });
            });
            C.corner.blocks = enBloque;
            const todas = Array.prototype.map.call(nodes, caja)
                .filter(function (b) { return b.id && b.ok && !enBloque.has(b.id); });
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
        blocks:  new Map(),  /* id de mesa -> ids del cuarto de isla */
        partner: function (id) { return C.corner.pairs.get(id) || null; },
        is:      function (id) { return C.corner.pairs.has(id) || C.corner.blocks.has(id); },
        isBlock: function (id) { return C.corner.blocks.has(id); },
        /* todas las mesas que se contratan con esta (ella incluida), ordenadas por número;
           null si se vende suelta */
        group:   function (id) {
            let ids = C.corner.blocks.get(id);
            if (!ids) { const m = C.corner.pairs.get(id); ids = m ? [id, m] : null; }
            if (!ids) return null;
            return ids.slice().sort(function (a, b) { return C.tableNumber(a) - C.tableNumber(b); });
        }
    };
})();

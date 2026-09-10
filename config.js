/* ============================================================
   ICONS 2027 · HALL 2 · CONFIGURACIÓN ÚNICA
   Este es el ÚNICO archivo que tocas para cambiar precios,
   colores, categorías o la hoja de cálculo.
   Lo usan index.html, filters.html, builder.html y builder-sellers.html.
   ============================================================ */

window.ICONS_CONFIG = {

    /* --- Identidad del pabellón ------------------------------ */
    hallName: 'HALL 2',
    hallLabel: 'Pabellón 2 · TCG, Sport Cards',
    mapImage: 'Hall 2.png',

    csvUrl: 'https://docs.google.com/spreadsheets/d/1b9mT5RqDehK0-28XoN2LCMg80D7Yv8uHFVDbofPK0gw/gviz/tq?tqx=out:csv&gid=672655889',
    csvRefreshMs: 120000,

    categories: [
        { key: 'TCG',   label: 'TCG' },
        { key: 'SPORT', label: 'Sport Cards' }
    ],

    /* --- Tipos de mesa --------------------------------------
       price     = precio de tarifa (se muestra TACHADO)
       earlyBird = descuento aplicado sobre el precio de tarifa
    ---------------------------------------------------------- */
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

    /* --- Early bird ------------------------------------------
       active:false  -> el tooltip muestra solo el precio de tarifa
    ---------------------------------------------------------- */
    earlyBird: {
        active: true,
        discount: 0.15,
        label: 'EARLY BIRD −15%'
    },

    /* --- Color de mesa vendida ------------------------------ */
    soldColor: '#e11d48',
    soldLabel: 'SOLD OUT',

    /* --- Lupa de la vista completa ---------------------------
       size   = diámetro en píxeles de pantalla
       zoom   = cuánto amplía respecto a la vista completa
       border = grosor del aro blanco
       enabled:false -> se desactiva y en ×1 vuelven las fichas de mesa
    ---------------------------------------------------------- */
    loupe: {
        enabled: true,
        size: 280,
        zoom: 3,
        border: 3
    },

    /* --- Tonos disponibles ---------------------------------- */
    tones: [
        { key: 'light', label: 'Claro' },
        { key: 'base',  label: 'Base' },
        { key: 'dark',  label: 'Oscuro' }
    ],

    /* --- Tamaños por defecto al crear mesas (en % del plano) - */
    defaults: {
        /* medidas reales de las mesas del plano de Hall 2 (86x26 px sobre 7686x5372) */
        horizontal: { w: 1.1189, h: 0.4840 },
        vertical:   { w: 0.3383, h: 1.6194 },
        gapX: 0.04,
        gapY: 0.07,
        cloneGap: 0.30,
        /* Hueco máximo, en píxeles del plano, para que el builder considere que
           dos mesas son de la misma isla. Tiene que ser mayor que el hueco
           interior de un anillo y menor que la separación entre anillos.
           En Hall 2: hueco interior hasta ~79 px, separación entre anillos >165 px. */
        islandGapPx: 110,
        /* el anillo típico de este pabellón: 2 arriba, 8 por lado, 2 abajo = 20 mesas */
        ring: { top: 2, side: 8, bottom: 2 }
    }
};

/* ============================================================
   HELPERS COMPARTIDOS — no hace falta tocar nada de aquí abajo
   ============================================================ */
(function () {
    const C = window.ICONS_CONFIG;

    /* Devuelve el color de una mesa según tipo + tono (+ color propio) */
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

    /* Oscurece un hex un % (0-1) para el borde */
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

    /* "DIECAST-A-1" -> "DIECAST-A"  (prefijo de isla) */
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

    /* "DIECAST-A-1" -> { cat:'DIECAST', catLabel:'Diecast', zone:'A', num:'1' } */
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

    /* Precio formateado en euros españoles */
    C.euro = function (value) {
        return value.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' €';
    };

    /* Devuelve { base:'100,00 €', early:'85,00 €'|null } */
    C.priceFor = function (type) {
        const t = C.types[type] || C.types.collector;
        const base = C.euro(t.price);
        if (!C.earlyBird.active) return { base, early: null };
        return { base, early: C.euro(t.price * (1 - C.earlyBird.discount)) };
    };
})();

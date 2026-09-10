# ICONS 2027 · Mapa interactivo · PABELLÓN 2

TCG · Sport Cards. 412 mesas en 23 anillos de 12 a 22 mesas.
El Pabellón 1 va en su propio repositorio con la misma estructura.

## Ficheros

| Fichero | Función |
|---|---|
| `index.html` | Mapa público. Solo plano + lupa + fichas + 4 niveles de zoom. Es el que se publica y se embebe. |
| `filters.html` | Versión interna: leyenda con recuento y filtros, buscador, zoom continuo con deslizador. |
| `config.js` | Único fichero a editar: precios, colores, categorías, lupa, URL del CSV. Lo leen los 4 HTML. |
| `mesas.html` | Las mesas. Generado por el builder. Ya relleno. |
| `seller.html` | Logos de expositores. Vacío; lo genera `builder-sellers.html`. |
| `builder.html` | Tables Builder Pro. |
| `builder-sellers.html` | Sellers Builder. |
| ``Hall 2.png`` | Plano (7686 × 5372 px). Si se cambia, mismo nombre y misma proporción. |
| `CNAME` | Dominio de GitHub Pages: `hall2.iconscollectibles.com`. |

## Arranque

```bash
python3 -m http.server 8000      # dentro de la carpeta del repo
# http://localhost:8000/index.html
```

`fetch` de `mesas.html` y `seller.html` está bloqueado en `file://`, así que con doble clic no carga.
Alternativa sin servidor: abrir el builder y usar «Pegar mesas.html a mano».

GitHub Pages: Settings → Pages → Deploy from branch → `main` / root. Los ficheros van en la RAÍZ del repo.

## Hoja de cálculo (estado vendida/disponible)

`config.js` → `csvUrl`. La URL del navegador (`/edit`) NO sirve: tiene que devolver CSV.

```
compartida como lector -> https://docs.google.com/spreadsheets/d/ID_LIBRO/gviz/tq?tqx=out:csv&gid=NNN
publicada en la web    -> https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=NNN&single=true&output=csv
```

Contrato de columnas (fila 1 = cabecera, se ignora):

| Columna | Contenido |
|---|---|
| A | libre |
| B | estado — si contiene `VENDIDA` o `SOLD`, la mesa sale roja con `SOLD OUT` |
| C | ID de mesa — tiene que coincidir exactamente con `data-info` (`TCG-A-1`) |
| D | opcional: expositor, sale en la ficha de la mesa |
| E+ | libres, se ignoran |

Relectura cada `csvRefreshMs` (120 s). Si la URL devuelve HTML en vez de CSV, sale un aviso en la consola.

## Mapa público (`index.html`)

- 4 niveles de zoom: botonera `×1 ×2 ×3 ×4` + BACK, clic en el plano sube un nivel, rueda, teclas `1`-`4`, `+`, `−`, `Esc`.
- Arrastre siempre que el plano no quepa entero.
- Lupa en ×1 (solo escritorio, en ×1 no hay fichas de mesa). Se configura en `config.js` → `loupe`.
- Ficha de mesa: hover de ×2 en adelante en escritorio, toque en móvil. Overlay de tamaño fijo.
- Hover: halo difuso del color de la mesa, sin escalado (escalar descubría el borde impreso del plano).
- Precio: tarifa tachada + precio early bird + `−15%` en rojo (sale de `earlyBird.discount`).

### Zoom por niveles, no libre (no tocar sin leer esto)

`transform: scale()` sobre un PNG de ~7500 px supera el límite de rasterizado del navegador y el plano
**sale en gris**, sobre todo en móvil al alejar. Dos medidas:

1. La animación usa `transform`, pero al terminar la escala se hornea en el layout: el contenedor pasa a
   medir los píxeles reales y el `transform` vuelve a ser solo `translate()`.
2. `MAX_RASTER` recorta el nivel más cercano según pantalla y densidad. Portátil ×1 ×2,2 ×4 ×6 · móvil
   ×1 ×2,8 ×5 ×8 · 2K retina baja el último.

`resize` solo recalcula el ajuste si cambia el **ancho** (en móvil la barra de URL dispara resize al scrollear).

## Builder (`builder.html`)

Dos modos de selección (islas por proximidad / mesas suelta), shift+clic acumulativo, marco con
shift+arrastrar. Tamaño en tiempo real con sliders y tirador de esquina, girar W↔H, igualar, escalar desde
el centro. Tipo y tono por desplegable, color propio para excepciones. Clonado con la lógica del plano:
a los lados → siguiente letra libre con los mismos números; arriba/abajo → misma letra y siguiente bloque
libre. Deshacer/rehacer 120 pasos, autoguardado en localStorage cada 8 s. Export a `mesas.html` y JSON.

| Tecla | Acción |
|---|---|
| Flechas | mover 0,005 % |
| Shift + flechas | mover 0,05 % |
| Alt + flechas | mover 0,5 % |
| Ctrl+D | clonar a la derecha |
| Ctrl+Z / Ctrl+Y | deshacer / rehacer |
| Ctrl+A | seleccionar todo |
| Supr | borrar selección |
| Esc | deseleccionar |
| Rueda | zoom |
| 0 | encajar el plano |

`defaults.islandGapPx` (110 px del plano) es lo que decide si dos mesas son de la misma isla: tiene que ser
mayor que el hueco interior del anillo (~79 px) y menor que la separación entre anillos (>165 px).

## Precios

`config.js` → `types.*.price` (tarifa, se muestra tachada) y `earlyBird.discount`.
Hoy: collector 100 € → 85 € · commercial 250 € → 212,50 €. `earlyBird.active: false` deja solo la tarifa.

## Numeración del plano

**La letra es la columna y el número la fila**, de abajo arriba. Aquí los anillos no son todos de 12:

| Zona | Letra | Mesas | Anillos |
|---|---|---|---|
| TCG | A | 40 | 1-20 · 21-40 |
| TCG | B | 40 | 1-20 · 21-40 |
| TCG | C | 44 | 1-22 · 23-44 |
| TCG | D | 40 | 1-20 · 21-40 |
| TCG | E | 40 | 1-20 · 21-40 |
| TCG | R | 24 | 1-12 · 13-24 |
| TCG | S | 24 | 1-12 · 13-24 |
| Sport Cards | J | 52 | 1-20 · 21-36 · 37-52 |
| Sport Cards | K | 52 | 1-20 · 21-36 · 37-52 |
| Sport Cards | L | 56 | 1-22 · 23-40 · 41-56 |
| **Total** | | **412** | **23 anillos** |

`mesas.html` se generó leyendo el PNG con la misma receta que el Pabellón 1 (relleno `#E6ECFF`, borde
`#3E6FFF`, OCR con votación por anillo, geometría normalizada a 86 × 26 px). Ojo con el fondo
`#DBF3FF` de SPORTS CARD STANDS: está a distancia 18 del relleno de mesa, por eso la tolerancia de color
está en ≤ 10.

## Diferencias con el Pabellón 1

| | Pabellón 1 | Pabellón 2 |
|---|---|---|
| Plano | 7499 × 5675 | 7686 × 5372 |
| Mesas | 336 en 28 islas de 12 | 412 en 23 anillos de 12 a 22 |
| Mesa horizontal | 85 × 25 px | 86 × 26 px |
| `defaults.ring` | 2 / 4 / 2 | 2 / 8 / 2 |

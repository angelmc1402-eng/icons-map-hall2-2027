# ICONS 2027 · Mapa interactivo · PABELLÓN 1

Diecast · Figures & Dolls · Comics · Arcade. 336 mesas en 28 islas de 12.
El Pabellón 2 va en su propio repositorio con la misma estructura.

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
| ``Hall 1.png`` | Plano (7499 × 5675 px). Si se cambia, mismo nombre y misma proporción. |
| `CNAME` | Dominio de GitHub Pages: `hall1.iconscollectibles.com`. |

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
| C | ID de mesa — tiene que coincidir exactamente con `data-info` (`DIECAST-A-37`) |
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

**La letra es la columna y el número la fila**, de abajo arriba y en bloques de 12. Por eso `DIECAST-A` no
es una isla: son tres. Dentro de cada isla (2 arriba, 4 por lado, 2 abajo) la numeración arranca en la 3.ª
mesa de la columna izquierda y va en sentido antihorario.

| Categoría | Islas | Mesas | Letras | Bloques |
|---|---|---|---|---|
| DIECAST | 9 | 108 | A, B, C | 13-24 · 25-36 · 37-48 |
| FIGURES | 10 | 120 | D–J | 25-36 · 37-48 |
| COMICS | 6 | 72 | K, L, M | 25-36 · 37-48 |
| ARCADE | 3 | 36 | K, L, M | 49-60 |
| **Total** | **28** | **336** | | |

`mesas.html` se generó leyendo el PNG: detección de rectángulos por color (relleno `#E6ECFF`, borde
`#3E5CFA`), islas por contigüidad, número por OCR de la etiqueta impresa con votación por isla, tipo por
color de la etiqueta (rosa collector, verde commercial, ámbar artist valley) y geometría normalizada a
85 × 25 px con ejes compartidos. Verificado mesa a mesa.

## Pendiente

`COMICS-M-25..36` y `COMICS-M-37..48` son Artist Valley en el plano. Están como collector en tono claro.
Si necesitan tipo y precio propios, se añade una entrada en `types` de `config.js`.

## Mesas de esquina

Las mesas que hacen esquina se contratan por parejas: una mesa horizontal y
una vertical de la misma isla que se tocan por un extremo. Al pasar el ratón
por una de las dos se iluminan las dos, el tooltip muestra los dos números
(`K50 + K51`) y el precio ya viene multiplicado por dos. Si una de las dos
está vendida, la pareja entera sale como `SOLD OUT`.

La detección está en `config.js`, en `C.corner`, y se calcula sobre la
geometría real de `mesas.html` al cargar. Si se redibuja un plano no hay que
tocar nada: las parejas se recalculan solas. La tolerancia (`C.corner.tol`,
0.14 % del plano) es menor que el ancho de una mesa y mayor que el hueco
entre dos mesas contiguas.

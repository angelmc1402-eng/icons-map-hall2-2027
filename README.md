# ICONS 2027 · Mapa interactivo · PABELLÓN 2

TCG · Sport Cards. 412 mesas en 23 anillos de 12 a 22 mesas. TCG R y S: solo cuartos de isla (ver abajo).
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

## Mesas de esquina

Las mesas que hacen esquina se contratan por parejas: una mesa horizontal y
una vertical de la misma isla que se tocan por un extremo. Hay dos formas de
montar esa esquina y las dos cuentan: la horizontal al lado de la vertical
(islas de Diecast, Figures, Comics, Arcade, Sport Cards y TCG A-E) o la
horizontal encima o debajo (islas TCG R y S del Pabellón 2). Al pasar el ratón
por una de las dos se iluminan las dos, el tooltip muestra los dos números
(`K50 + K51`) y el precio ya viene multiplicado por dos. Si una de las dos
está vendida, la pareja entera sale como `SOLD OUT`.

La detección está en `config.js`, en `C.corner`, y se calcula sobre la
geometría real de `mesas.html` al cargar. Si se redibuja un plano no hay que
tocar nada: las parejas se recalculan solas. La tolerancia (`C.corner.tol`,
0.14 % del plano) es menor que el ancho de una mesa y mayor que el hueco
entre dos mesas contiguas.

## Cuartos de isla (TCG R y S)

Los cuatro anillos pequeños de abajo a la derecha (`TCG-R`, `TCG-S`) son **commercial** y solo se venden
por **cuartos de isla**: la vertical de la esquina + las 2 horizontales anexas (p. ej. `R14+R15+R16`,
`S13+S24+S23`). 16 bloques de 3 mesas. Se definen en `config.js` → `blocks.list`.

- Hover: se iluminan las 3 mesas a la vez (también en la lupa).
- Ficha: `R14 + R15 + R16`, aviso «Quarter island», precio = 3 × tarifa commercial (750 € → 637,50 € early bird).
- Hoja: basta con marcar VENDIDA **una** de las 3 mesas para que el bloque entero salga SOLD OUT
  (recomendable marcar las 3 igualmente).
- Estas mesas no entran en la detección automática de esquinas de 2.

## Stands verdes y Sellers Builder

`config.js` → `stands.list` tiene todos los huecos verdes del plano (relleno `#8BEDC3`, borde `#00857C`) en px
del PNG, con su radio de esquina. Se sacaron con `detect-stands.py`; si cambia el plano, se regeneran.

- **Builder**: los huecos salen marcados con línea discontinua. Clic en uno → se crea el seller ya encajado
  (misma caja y mismo redondeo) y solo hay que poner nombre, logo, IG y web. Si un seller se arrastra y se
  suelta encima de un stand libre, se encaja solo. «Encajar en stand» / «Soltar (libre)» en el panel derecho.
- Un seller sin nombre ni logo **no se exporta** y no sale en el mapa.
- `seller.html` lleva `data-slot` (id del stand) y `data-r` (radio en px). El mapa público toma la geometría
  del stand desde `config.js`, así que siempre coincide con el marco verde.
- **Mapa público**: el logo ocupa exactamente el marco verde; el hover no escala, se dibuja hacia dentro.
  El tooltip del seller ya no lleva la etiqueta «Exhibitor».
- **Invisible** (casilla en la ficha → `data-invisible="true"`): para marcas ya impresas en el plano. No pinta caja ni logo, solo la zona de hover y la ficha con IG y web.
- `config.js` se carga como `config.js?v=AAAAMMDD`: al cambiar config.js, sube también la fecha en los HTML (index, filters, builder, builder-sellers) para que nadie se quede con una versión en caché.
- «Nuevo seller libre» tiene tamaños predefinidos (uno por cada medida de stand del plano) para logos fuera
  de los huecos.

## Vista general y rendimiento

- En la vista general (×1 en `index.html`, 100 % en `filters.html`) no hay fichas: ni de mesas ni de sellers. Manda la lupa,
  que pasa por encima de los logos sin cortarse. Las fichas aparecen al hacer zoom.
- La lupa se dibuja como mucho una vez por fotograma y solo con `transform` (sin `left/top`), y su copia del plano se
  prepara en un momento libre al cargar, no en el primer movimiento del ratón.
- Los logos se decodifican en segundo plano (`decoding="async"`).
- Hover de sellers: el anillo morado va en una capa propia que solo cambia de opacidad, así el logo no se repinta.
  La ficha se prepara una vez por seller y no se rehace si vuelves al mismo.
- Logos alojados en `cdn.shopify.com`: el mapa pide automáticamente una versión reducida (`&width=…`, entre 200 y 1000 px
  según el tamaño del stand) en vez del original. Se pueden subir logos grandes sin que el mapa se resienta.

## Recuento de clics en sponsors

- Al pulsar «Instagram» o «Visit website» en la ficha de un sponsor, el mapa manda un aviso a una hoja de Google
  (`config.js` → `tracking.endpoint`). Sin cookies ni datos personales: fecha, pabellón, sponsor, tipo, página
  (`map` = index.html, `internal` = filters.html), dispositivo e idioma. Dos clics iguales en 3 s cuentan como uno.
- Con `endpoint` vacío no se cuenta nada (el mapa funciona igual).
- Las webs (no Instagram) llevan solas `?utm_source=iconscollectibles&utm_medium=floor_map&utm_campaign=icons2027`,
  para que cada sponsor vea las visitas en su Analytics. Se cambian en `tracking.utm`. `seller.html` y el builder no cambian.
- `tracking-apps-script.gs`: el código de la hoja (pestañas Clics, Resumen y Por día, todo con fórmulas automáticas).
  Instrucciones dentro del fichero. El Resumen solo cuenta el mapa público, no la versión interna.

## Logos junto a las mesas commercial (Sellers Builder)

- `seller-slots.js`: un hueco de logo por cada mesa **commercial**, pegado a su lado exterior de la isla
  (izquierda, derecha, arriba o abajo). Todos del mismo tamaño (68 px en Hall 1, 70 px en Hall 2), sin tocar
  mesas, otros huecos ni nada impreso en el plano. Lo genera `detect-seller-slots.py` (`python3 detect-seller-slots.py 2 70`);
  si cambia `mesas.html` o el PNG, se regenera.
- En el builder salen con línea morada discontinua y el número de mesa. **Clic** → seller de esa mesa.
- **Extender** (panel derecho): suma la mesa siguiente de la misma fila, arriba/abajo en los laterales e
  izquierda/derecha arriba y abajo de la isla. «Quitar» hace lo contrario. En esquinas, **«Otro lado de la esquina»**
  pasa el logo del hueco de la mesa vertical al de la horizontal (o al revés).
- **Colisiones**: un seller no puede quedar encima de una mesa ni de otro seller. Si al arrastrar o
  redimensionar se monta, vuelve a su sitio; si alguno choca, sale con borde rojo. Soltarlo encima de un hueco
  libre lo encaja solo.
- **Logo comprimido**: «Subir imagen» o arrastrar la imagen encima del seller. Se reduce al tamaño máximo al que
  se verá y se guarda en WebP dentro de `seller.html` (normalmente 3-15 KB). Los logos de Shopify se piden ya
  reducidos con `&width=`.
- `seller.html` guarda las mesas del vendedor: `data-tables` (las que tienen el logo al lado) y `data-also`
  (el resto, p. ej. la otra mitad de la esquina). En el mapa público, al pasar por el logo se iluminan sus mesas
  y la ficha de cada mesa dice «Exhibitor · nombre».

## Propuesta de vendors

- «📥 Cargar propuesta…» en el builder lee `propuesta-vendors-hall1.json` / `-hall2.json` (no van en el repo:
  llevan datos de clientes y el repo es público).
- Coloca cada vendedor commercial que dio permiso («Yes, include my store») en el hueco de su mesa, con borde
  naranja hasta que se revisa («✓ Dar por buena»). El informe separa: colocados, mesa reclamada por otro pedido,
  hueco ya ocupado, sin mesa (clic → clic en el hueco), collector y los que no quieren salir.
- Los vendedores de la propuesta no se exportan hasta descargar `seller.html`, como el resto.

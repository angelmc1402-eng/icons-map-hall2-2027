# ICONS 2027 · Mapa interactivo · PABELLÓN 2

Repositorio independiente del mapa del Pabellón 2 (TCG · Sport Cards).
El Pabellón 1 (Diecast · Figures & Dolls · Comics · Arcade) va en su propio repositorio, con la misma
estructura y el mismo código: lo único que cambia entre los dos es `config.js`, `mesas.html` y el PNG.

---

## Ficheros

| Fichero | Para qué sirve |
|---|---|
| `index.html` | **El mapa público**, limpio: solo el plano, las fichas de mesa y 4 niveles de zoom. Es lo que se publica, lo que se embebe en un listing y lo que se ve en móvil. |
| `filters.html` | La versión con herramientas: leyenda con recuento y filtros, buscador de mesas y zoom continuo con deslizador. Para uso interno o para quien quiera hurgar. |
| `config.js` | **El único fichero que tocas** para precios, colores, categorías y la URL de la hoja de cálculo. Lo leen los cuatro HTML. |
| `mesas.html` | Las mesas. Lo genera el builder. **Ya viene relleno con las 412 mesas del plano.** |
| `seller.html` | Los expositores con logo. Vacío por ahora; lo genera el sellers builder. |
| `builder.html` | Tables Builder Pro: crear, mover, redimensionar, colorear, clonar y numerar mesas. |
| `builder-sellers.html` | Sellers Builder: colocar logos de expositores encima del plano. |
| `Hall 2.png` | El plano (7686 × 5372 px). Si lo cambias, mantén el mismo nombre y proporción. |

---

## Cómo se abre

Los tres HTML cargan `mesas.html` y `seller.html` con `fetch`, y Chrome bloquea eso al abrir con doble clic
(`file://`). Dos formas de trabajar:

**Servidor local** (recomendado, todo funciona solo):

```bash
cd icons-map-hall2-2027
python3 -m http.server 8000
# abre http://localhost:8000/builder.html
```

**Sin servidor**: abre el builder con doble clic y usa *«Pegar mesas.html a mano»* → pegas el contenido del
fichero y sigues trabajando igual.

En **GitHub Pages** funciona directamente: Settings → Pages → Deploy from branch → `main` / root.

---

## Las mesas ya están puestas, con los números del plano

`mesas.html` está generado leyendo el propio PNG, no inventado:

1. Se detectan los rectángulos de mesa por color (relleno `#E6ECFF`, borde `#3E6FFF`).
2. **Se descarta lo que no se vende**: las 70 mesas de la zona de torneos y todo lo que no cae sobre el
   fondo de TCG (`#FFEDD6`) o de Sport Cards (`#FFFBCA`). De 482 rectángulos detectados quedan 412 mesas.
3. Se agrupan en los 23 anillos, por proximidad (hueco máximo 110 px: más que el pasillo interior de un
   anillo, menos que la separación entre anillos).
4. **Se lee por OCR el número impreso en cada mesa** (`A1`, `C44`, `L56`…), girando las etiquetas de las
   columnas laterales, y se decide letra y número base de cada anillo por votación de todas sus mesas: un
   fallo puntual de lectura no puede descolocar la numeración.
5. El tipo sale del color de la etiqueta del anillo: rosa `COLLECTOR`, verde `COMMERCIAL`.
6. La geometría se normaliza: todas las horizontales a 86 × 26 px y todas las verticales a 26 × 87 px, con
   las columnas y filas de cada anillo compartiendo eje.

**Comprobación**: los números de cada letra salen en una serie continua de 1 a N, sin huecos ni duplicados.
Eso solo cuadra si la lectura es correcta de punta a punta.

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

216 collector y 196 commercial. Las letras R y S son los cuatro anillos pequeños de la zona TCG de abajo
a la derecha.

**Ojo con la forma de los anillos**: aquí no son todos iguales como en el Pabellón 1. Hay de 12, 16, 18, 20
y 22 mesas. La numeración de cada uno arranca en la primera mesa del grupo inferior de la columna izquierda
y va en sentido antihorario: izquierda hacia abajo, abajo de izquierda a derecha, derecha de abajo arriba,
arriba de derecha a izquierda, y por último el grupo superior de la columna izquierda.

**Nomenclatura del ID**: `ZONA-LETRA-Nº` → `TCG-C-44`, `SPORT-L-56`. El tooltip muestra `Zone C · Table 44`,
que es exactamente lo que se lee en el plano.

**Lo que NO está incluido**: los stands. Las cajas verdes grandes de *TCG Stands* y *Sports Card Stands*
son un producto distinto (stands, no mesas) y no se han metido en `mesas.html`. Lo mismo con *Stands TCG*
abajo a la izquierda. Si los quieres clicables, se añaden con el builder como mesas con su propio tipo, o
se les pone un logo de expositor encima con el sellers builder.

---

## Tables Builder Pro (`builder.html`)

**Dos modos de selección**

- **Islas**: al pulsar una mesa seleccionas el anillo completo. Agrupa por **proximidad en el plano**, no
  por prefijo, porque en este plano `TCG-C` son dos anillos distintos (1-22 y 23-44). El hueco que separa
  un anillo de otro se ajusta con `islandGapPx` en `config.js`.
- **Mesas**: solo la que pulsas.
- `Shift + clic` suma o resta de la selección. `Shift + arrastrar` sobre el plano hace un marco de selección.
- Arrastrar sobre una zona vacía mueve el plano. Rueda = zoom. Tecla `0` = encajar.

**Tamaño en tiempo real**

Sliders de ancho y alto que se aplican mientras arrastras, a toda la selección a la vez. Debajo, el valor
exacto en % y su equivalente en píxeles del plano. También:

- **Tirador naranja** en la esquina de la selección: redimensiona sobre el plano arrastrando.
- **Girar (W↔H)**: convierte mesas horizontales en verticales y al revés.
- **Igualar tamaños**: pone todas las seleccionadas al tamaño de la primera.
- **−5 % / +5 % / +20 %**: escalado desde el centro.

**Tipo y color**

- Desplegable **Tipo de mesa**: Collector / Commercial. Cambia el color y el precio del tooltip.
- Desplegable **Tono**: Claro / Base / Oscuro, para pintar unas comerciales más claras y otras más oscuras
  sin salirte de la paleta.
- **Color propio** (selector de color) solo para excepciones puntuales.

Los tonos salen de `config.js`, así que el builder y el mapa público pintan exactamente igual.

**Clonar**

Botones **← ↑ ↓ →**: el clon es idéntico (tamaño, tipo, tono) y se coloca pegado al original con el hueco
que marques en la casilla de al lado. Y **replica la lógica del plano**:

- **a los lados** → letra libre siguiente con los mismos números (`TCG-C-23..44` → `TCG-F-23..44`)
- **arriba / abajo** → misma letra y el siguiente bloque de números libre (`TCG-C-23..44` → `TCG-C-45..66`)

En modo mesas simplemente continúa la numeración. `Ctrl+D` clona a la derecha.

**Deshacer**

`Ctrl+Z` deshacer, `Ctrl+Y` (o `Ctrl+Shift+Z`) rehacer, hasta 120 pasos. El contador del botón te dice
cuántos pasos tienes guardados. Además autoguarda en el navegador cada 8 segundos:
**Restaurar sesión** recupera lo último si cierras la pestaña sin exportar.

**Crear mesas**

Cinco formas: mesa individual, fila horizontal, columna vertical, rejilla e **isla perimetral**
(arriba / lados / abajo, con los lados en vertical automáticamente; por defecto 2/8/2 = 20 mesas, que es
el anillo típico de este pabellón). Se crea en el centro de la vista y la
letra de zona avanza sola para el siguiente bloque.

**Otras herramientas**

- Alinear (izquierda, centro, derecha, arriba, medio, abajo) y distribuir en horizontal / vertical.
- **Renumerar 1→n** reordena la numeración de la selección de arriba a abajo y de izquierda a derecha.
- **Ir a una isla**: desplegable que salta y centra cualquier isla.
- Recuento por categoría y por tipo, con el precio aplicado.
- Botón `123` para ocultar los números y ver mejor el plano.

**Atajos**

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

Y en la barra inferior hay un **deslizador de zoom** con − / + y botón de encajar.

**Al acabar**: *Descargar mesas.html* (también lo copia al portapapeles) y reemplazas el `mesas.html` del
repositorio. *Exportar JSON* deja una copia de seguridad legible por si acaso.

---

## Sellers Builder (`builder-sellers.html`)

Colocas la caja del logo de cada expositor encima de sus mesas. Por seller: nombre, URL del logo, Instagram
y web, todo en vivo. **Repetición del logo** (1, 2 en horizontal, 2, 3 o 4 en vertical) para cuando ocupa
varias mesas seguidas. **Ver mesas** dibuja las mesas de fondo como referencia y **Ajustar a la mesa** copia
la posición y el tamaño exactos de la mesa que tiene debajo. Mismo deshacer y mismo autoguardado.

Exporta `seller.html`.

---

## Hoja de cálculo

En `config.js`, `csvUrl`. La hoja se publica en Google Sheets con
**Archivo → Compartir → Publicar en la web → CSV**.

Columnas (la fila 1 es cabecera y se ignora):

| Columna | Contenido |
|---|---|
| A | libre (notas, referencia de pedido…) |
| B | **estado** — si contiene `VENDIDA` o `SOLD`, la mesa sale roja y con `SOLD OUT` |
| C | **ID de mesa** — tiene que coincidir exactamente con `data-info` (`TCG-A-1`) |
| D | *(opcional)* nombre del expositor, y sale en el tooltip de la mesa |

La columna D es nueva: si la rellenas, el tooltip muestra el nombre del expositor sin tener que tocar
`seller.html`. Si la dejas vacía no aparece nada.

El mapa refresca solo cada 2 minutos (`csvRefreshMs`).

Para sacar la lista de IDs y pegarla en la hoja limpia:

```bash
grep -o 'data-info="[^"]*"' mesas.html | sed 's/data-info="//;s/"//' > ids.txt
```

---

## El mapa público (`index.html`)

Deliberadamente desnudo: **sin título, sin leyenda y sin buscador**, para que se vea el plano y nada más.
Todo eso vive en `filters.html`.

- **4 niveles de zoom** con la botonera `×1 ×2 ×3 ×4` abajo a la derecha (centrada en móvil), botón
  **BACK** para volver a la vista completa, clic en el plano para subir un nivel (y volver al principio
  tras el último), rueda del ratón, y teclas `1`-`4`, `+`, `−` y `Esc`. Con zoom se arrastra para moverse.
- **Ficha de mesa** al pasar por encima en escritorio y **al tocarla en móvil**: tarjeta blanca con una
  línea del color del tipo arriba, el ID grande (`A45`), la etiqueta del tipo, categoría / zona / mesa y el
  precio con la tarifa tachada más el early bird. Es un overlay de tamaño fijo, así que se lee igual de
  bien en la vista completa que en el nivel más cercano.
- **Estado agotado**: la mesa pasa a rojo y la ficha muestra `SOLD OUT`, con el nombre del expositor si lo
  has puesto en la columna D de la hoja.

### Por qué 4 niveles y no un zoom libre

Escalar con `transform: scale()` una imagen de 7499 px obliga al navegador a mantener una capa compositada
enorme. Pasado cierto punto no la puede rasterizar y **el plano se queda gris**, sobre todo en móvil al
alejar después de un zoom fuerte. Dos medidas contra eso:

1. La animación usa `transform`, pero **en cuanto termina la escala se aplica al layout**: el contenedor
   pasa a medir los píxeles reales y el `transform` vuelve a ser solo un desplazamiento. Así el navegador
   trata la imagen como una imagen normal y la pinta en mosaico.
2. El nivel más cercano se **recorta automáticamente** si con esa pantalla y densidad de píxeles pediría
   más resolución de la que el navegador puede pintar (`MAX_RASTER` en `index.html`). En un portátil normal
   los niveles son ×1 ×2,2 ×4 ×6; en móvil ×1 ×2,8 ×5 ×8; en un 2K retina el último baja solo.

Una nota de geometría: el plano es 4:3 tumbado, así que en un móvil vertical (9:19) llena el ancho y deja
franjas arriba y abajo por mucho que se ajuste. Se ve entero, que es lo que se quiere de un plano, y con
un toque ya se entra al nivel que llena la pantalla.

## La versión con filtros (`filters.html`)

Lo mismo más las herramientas, para quien las quiera:

- **Zoom continuo** del 100 % al 800 % con deslizador vertical, botones − / +, encajar, rueda (hace zoom
  donde apunta el cursor), doble clic, teclas y pinza en móvil.
- **Buscador**: escribes `A37`, `K59` o solo `A` y te enfoca y resalta las mesas.
- **Leyenda con recuento** que además filtra: pulsas *Collector*, *Commercial* o *Sold out* y atenúa el
  resto.
- Enlace de vuelta al mapa simple.

Lleva la misma protección contra el gris y el tope en 800 % por el mismo motivo.

## Precios

En `config.js`:

```js
types: {
  collector:  { price: 100, ... },
  commercial: { price: 250, ... }
},
earlyBird: { active: true, discount: 0.15, label: 'EARLY BIRD −15%' }
```

Con `earlyBird.active: true` el tooltip muestra **100,00 € tachado y 85,00 €** al lado, con la píldora
`EARLY BIRD −15%`. Cuando acabe la promoción, `active: false` y vuelve a salir solo el precio de tarifa.
No hay que tocar nada más.

---

## Flujo de trabajo típico

1. Abres `builder.html` con el servidor local.
2. Retocas mesas: tamaño, tipo, tono, clones.
3. *Descargar mesas.html* y reemplazas el del repositorio.
4. Sacas los IDs con el `grep` de arriba y los pegas en la hoja de cálculo.
5. `builder-sellers.html` para los logos → *Descargar seller.html*.
6. `git commit` + `push`. GitHub Pages publica el mapa: `index.html` en la raíz y `filters.html` en
   `/filters.html`.

## Relación con el Pabellón 1

El código es el mismo fichero a fichero. Lo que cambia:

| | Pabellón 1 | Pabellón 2 |
|---|---|---|
| Plano | `Hall 1.png` 7499 × 5675 | `Hall 2.png` 7686 × 5372 |
| Categorías | Diecast, Figures & Dolls, Comics, Arcade | TCG, Sport Cards |
| Mesas | 336 en 28 islas de 12 | 412 en 23 anillos de 12 a 22 |
| Mesa horizontal | 85 × 25 px | 86 × 26 px |
| Borde de mesa | `#3E5CFA` | `#3E6FFF` |

Los IDs no chocan entre pabellones (`DIECAST-A-1` vs `TCG-A-1`), así que **puedes usar una sola hoja de
cálculo para los dos mapas** si te resulta más cómodo que dos pestañas.

El autoguardado del navegador usa una clave por pabellón (`icons-hall2-builder-v1`), así que puedes tener
los dos builders abiertos sin que se pisen.

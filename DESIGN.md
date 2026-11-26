# DESIGN — Nonio

> Contrato visual del sistema. Dirección elegida por Guille el 18/11/2026.
> Si una pantalla nueva contradice este documento, gana el documento.
> Implementación de referencia: `src/styles/tokens.css`, `src/views/PosView.module.css`.

## 1. Premisa

El sistema se ve como el **instrumento de medición de un taller**, no como un panel de administración.
Papel de especificación, acero, tinta de trazar. Las distancias se leen; no se decoran.

Consecuencia práctica: el único lugar donde hay color es donde hay una **excepción** (stock bajo, sin
stock) o donde hay **algo vivo** (la variante elegida, el cursor del sistema). Todo lo demás es tinta
sobre papel.

## 2. Reglas que no se negocian

1. **Sin cromo.** No hay tarjetas flotantes, ni sombras, ni degradados, ni vidrio. La jerarquía se hace
   con reglas de 1 px, espacio y peso tipográfico.
2. **Bordes compartidos.** Dos paneles contiguos comparten una sola línea. Nunca hay gutter entre
   catálogo y ticket, ni doble borde entre filas.
3. **El estado se dice con forma, no con color.** Activo = marca más ancha y tinta; pendiente = línea
   punteada; fuera de stock = tachado. El color solo confirma.
4. **Cada banda decide una cosa.** Banda de búsqueda: buscar. Banda de guía: orientar. Pie del ticket:
   cobrar. Nada compite dentro de una banda.
5. **Los números son monumentales.** El total es la cifra más grande de la pantalla y no se comparte
   con nada. Las medidas y códigos van siempre en monoespaciada y con cifras tabulares.

## 3. Paleta

| Token | Valor | Rol | Contraste |
|---|---|---|---|
| `--paper` | `#F6F3EC` | fondo del sistema | — |
| `--paper-raised` | `#FFFDF8` | banda de guía, fila activa, ticket | — |
| `--paper-sunken` | `#EEE8DC` | riel, barra de atajos | — |
| `--ink` | `#17181A` | texto y reglas fuertes | 16.0:1 |
| `--ink-soft` | `#565A5F` | texto secundario | 6.3:1 |
| `--ink-faint` | `#6B7075` | rótulos de 10–11 px | 4.5:1 |
| `--line` | `#D7D1C3` | separación entre filas | decorativo |
| `--line-strong` | `#B0A998` | bordes de control | decorativo |
| `--steel` | `#8B9197` | marcas de la regla | decorativo |
| `--live` | `#C2401D` | variante elegida, foco, selección | 4.7:1 |
| `--warn` | `#8A5C0A` | bajo mínimo | 5.2:1 |
| `--danger` | `#A32017` | sin stock | 6.8:1 |
| `--ok` | `#2F6B45` | confirmación puntual | reservado |

Regla de uso: `--live` no rellena superficies grandes. Aparece en marcas de 1–2 px, texto de la
variante activa y el botón de cobrar en hover. Si hay dos rojos en la misma fila, uno está de más.

## 4. Tipografía

- **UI: Bahnschrift** (variable, viene con Windows). Sin descargas: el requisito de correr offline
  prohíbe depender de Google Fonts. Fallback: Segoe UI Variable, Segoe UI.
- **Medidas y códigos: Consolas / Cascadia Mono.** Todo lo que se mide o se numera va acá: `1 1/2"`,
  `FIJ-CLA-001`, `$ 9.300,00`, cantidades, comprobante.
- Escala (px): 10 rótulos de riel · 11 versalitas y metadatos · 12 datos · 14 interfaz · 15 lectura ·
  18 · 24 · 32 total · 44 cifra protagonista.
- Versalitas de 10–11 px: `letter-spacing` 0.08–0.12 em, peso 600, siempre en `--ink-soft` o
  `--ink-faint`. Nunca en `--ink` (competiría con el nombre del producto).
- `font-variant-numeric: tabular-nums` en todo el documento: las columnas de precio se alinean solas.
- El nombre del producto es lo único en 15 px y peso normal. Si no entra en una línea, se recorta
  con puntos suspensivos. Única excepción: entre 1201 y 1266 px el catálogo queda angosto y el
  nombre se envuelve en dos líneas antes que perder la última palabra.

## 5. Estructura y ritmo

- Unidad de ritmo: **`--tick` = 4 px**. Todos los espacios son múltiplos. No se usan valores sueltos.
- Riel de secciones: 72 px fijos, siempre visible.
- Banda de guía: 52 px. Dice dónde está parado el usuario en palabras ("1 producto · Clavo cabeza
  plana · 1\" a 3\"") y a la derecha la fecha y el usuario. No repite el título de la pantalla.
- Ticket: 524 px por encima de 1439; 466 px desde 1439 para abajo.
- Radio de borde: 2–3 px. Es una pieza mecanizada, no una burbuja.

## 6. Primera vista

Al abrir, el catálogo ya tiene contenido: los productos que el mostrador pide todo el tiempo, sin
escribir nada. El buscador tiene el foco. El ticket está vacío y lo dice en una frase, no con un
dibujo.

Arranque: `BootDial` alinea un nonio contra la regla en 620 ms y se retira. No bloquea la carga, se
descarta con un clic y **no se muestra si el sistema tiene el movimiento reducido**. En la PC de
Guille las animaciones de Windows están desactivadas, así que ahí no se ve.

## 7. Interacción firma: la escala de medidas

La fila activa se abre y muestra **una regla**: cada variante es una marca sobre la línea de acero.
La marca de la variante elegida es la única en `--live` y su etiqueta pasa a tinta plena. La regla
vive en una segunda banda de la fila, alineada con el nombre: no se superpone con las columnas de
medida, stock ni precio.

- La medida de la fila ocupa **94 px**, el ancho que necesita `5/16" × 1 1/2"` completa.
- `↓` / `↑` recorren productos. `←` / `→` recorren medidas. `Enter` agrega. `Ctrl+Enter` cobra.
- Al recorrer, la fila activa se mantiene entera a la vista: el catálogo hace el scroll justo
  (`block: 'nearest'`) y la página no se mueve.
- Las variantes sin stock siguen visibles pero tachadas: el vendedor necesita saber que existen.
- Si el producto **no tiene orden** (color, terminación), la regla no se dibuja: se usan fichas.
  Una regla que no mide nada es una mentira.

Se probó una rueda de una medida por vez y se descartó: no deja comparar la escalera completa ni
volver a una medida anterior sin recorrer las intermedias.

### Cantidad en el ticket

La cantidad de cada línea es un campo editable, no solo `−` / `+`. Al enfocar se selecciona el
número, así escribir `10` reemplaza el `1` en vez de agregarle un dígito. Escribe en vivo (el total
y el cobro nunca quedan atrás), recorta al stock mientras se escribe y `Escape` devuelve la cantidad
que había al enfocar. `Enter` confirma y sale.

## 8. Ferrobot

Panel de consulta, no un chat de personaje. Se abre con `F5` o con el riel **IA**; se cierra con
`Escape` desde cualquier control o con el mismo atajo, y el foco vuelve al buscador. Al abrir, el foco
cae en el campo de consulta.

- **No modal.** Desde 1201 px vive a la derecha del catálogo y a la izquierda del ticket: la nota de
  venta y el botón de cobrar siguen visibles. Entre 901 y 1200 px el POS se apila y Ferrobot recibe una
  **columna propia de 380 px**, para no tapar la nota. Hasta 900 px ocupa el ancho del POS; el riel
  sigue a la vista.
- **Registro, no burbujas.** Cada turno se rotula `VOS` / `FERROBOT` con la tipografía de medidas. Sin
  avatar, sin emojis, sin "escribiendo…". El indicador de consulta son tres ticks de 2 px durante
  320 ms; con movimiento reducido quedan quietos. No es un skeleton: los datos son locales y no hay una
  espera real que disfrazar.
- **Anclaje.** Toda respuesta termina en un dato del catálogo: una variante concreta con medida, precio
  y estado de stock, o una pregunta de precisión. "Ver en el catálogo" abre esa variante exacta, cierra
  el panel y devuelve el foco al buscador.
- **Límites del prototipo.** El motor es determinístico y local (`src/lib/ferrobot.ts`): no hay modelo,
  red ni embeddings. Responde solo con el catálogo; no modifica el ticket, no muestra costo ni margen
  (D-28) ni ventas o reportes (D-04), y no inventa precios ni stock. Si la consulta cae fuera de
  alcance, lo dice y ofrece volver al catálogo. El alcance definitivo y el nombre quedan en D-33 y D-34.
- **Estados.** "Bajo mínimo" y "sin stock" usan `--warn` y `--danger`, igual que la tabla; el resto de
  la tarjeta es tinta y papel. Una variante sin stock no se agrega, pero se puede mirar.
- **Accesibilidad.** El registro es `role="log"` con `aria-live="polite"`; las sugerencias y las
  tarjetas son botones reales; el panel cerrado no recibe foco.

## 9. Gramática de movimiento

| Duración | Uso |
|---|---|
| 110 ms | hover, cambio de color |
| 170 ms | apertura de la fila activa, ancho de la marca |
| 380 ms | arranque del nonio |

- Una sola curva: `cubic-bezier(0.2, 0, 0, 1)`. Sin rebote, sin elástico, sin `ease-in-out`.
- Se animan opacidad, color, ancho y transform. Nunca `height`, nunca `box-shadow`.
- Todo el movimiento respeta `prefers-reduced-motion`: en ese modo la interfaz aparece resuelta y
  el arranque se ve como un cuadro fijo.

## 10. Estados y excepciones

- **Stock**: número + medidor de 40 px + marca de mínimo. El mínimo es una marca sobre el medidor, no
  un número más. Bajo mínimo = número en `--warn`; sin stock = barra vacía, número en `--danger` y
  botón deshabilitado. El estado se lee en el medidor: sin rótulo "bajo mín." que reserve ancho en
  todas las filas.
- **Activo**: `::before` de 2 px en `--live` + fondo elevado. No se usa una caja con borde.
- **Pendiente** (módulos sin construir): marca punteada y texto al 45 % — nunca un botón que no hace
  nada y parece que sí.
- **Vacío**: una frase que dice qué hacer, con la tecla entre `kbd`. Sin ilustraciones.

## 11. El comprobante

Es la única superficie con borde completo y la única que se imprime. Se lee como una lámina de
papel: monoespaciada, regla doble sobre el total, filetes punteados entre ítems.

- Declara "Documento no válido como factura": el informe no incluye facturación fiscal.
- El precio unitario se congela al agregar la línea. El diagrama de clases no guarda precio en
  `DetalleVenta` (D-20); esto es lo que el backend debería persistir.
- Diálogo con trampa de foco, `Escape` cierra y el foco vuelve al buscador.
- Al imprimir, todo lo demás desaparece (`@media print` en `base.css`).

## 12. Adaptación

| Ancho | Cambio |
|---|---|
| ≤ 1439 | ticket 466 px (524 px por encima) |
| 1201–1266 | el nombre más largo se envuelve en dos líneas (fila de 72 px) |
| 901–1200 | se apila el POS: catálogo arriba, ticket abajo al 54 %. Ferrobot se lleva una columna propia de 380 px |
| ≤ 1200 | el pie se vuelve barra: total + pago a la izquierda, cobrar a la derecha |
| ≤ 900 | Ferrobot ocupa el ancho del POS; el riel sigue visible |
| ≤ 720 | los datos de la fila pasan a dos líneas |

Medido a 1366×768, 1296×904, 1200×760 y 700×760: sin desborde de documento y sin scroll horizontal.
Entre 1201 y 1266 px el nombre más largo ocupa dos líneas; desde 1267 vuelve a una y la fila a 57 px.
A 700 px se recortan con elipsis dos nombres largos porque la columna de datos se queda con el ancho.

Ferrobot se verificó a 1447×904 (panel de 420 px con la nota visible), 1200×820 (columna de 380 px
sin tapar la nota ni el cobro) y 700×820 (ancho completo del POS), sin desborde y con la consola limpia.

## 13. Qué no hacer

- No agregar sombras, desenfoques ni bordes redondeados grandes "para suavizar".
- No usar rojo para decorar: `--live` es un cursor, no un acento de marca.
- No meter íconos donde alcanza una palabra. El sistema tiene 5 secciones y se leen.
- No poner el costo ni el margen en el POS: la pantalla está a la vista del cliente (D-28).
- No mostrar una barra de progreso, un spinner o un esqueleto de carga: con datos locales no hay
  espera que justifique mentir.
- No convertir a Ferrobot en un personaje con avatar, burbujas o respuestas inventadas: es una
  herramienta de consulta del catálogo, no un chatbot decorativo.

## 14. Abierto — pendiente del grupo

- **D-09** Nombre y logo del sistema. Hoy el comprobante dice "Ferretería" como marcador.
- **D-13** Formas de pago: las tres del POS son propuesta.
- **D-06** CSS Modules + tokens: si el grupo elige Tailwind, se traducen los tokens; la dirección
  visual no cambia.
- **D-19** Dispositivo principal de la demo. El diseño asume 1366×768; el modo apilado existe pero no
  está pensado para tacto.
- **D-33** Alcance del asistente: si puede modificar la nota de venta y si el Vendedor puede ver bajo
  mínimo o métricas. Hoy el prototipo solo consulta.
- **D-34** "Ferrobot" es nombre de trabajo del prototipo; no reemplaza a D-09 (nombre del sistema).

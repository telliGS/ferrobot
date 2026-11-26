# CONTEXT — Ferretería POS (Taller de Integración)

> Documento de contexto para retomar el proyecto en cualquier sesión. Actualizado: 24/11/2026.

## Visión general

Sistema de **gestión de inventario y punto de venta (POS) para ferretería**, con un **asistente de IA conversacional** como diferencial. Materia: Taller de Integración (Analista en Sistemas, UADER). Etapa actual: **diseño de frontend / identidad visual**. Backend, BD y autenticación **no iniciados**.

Problema que resuelve (informe, §2.2):
1. Variantes difíciles de controlar (medidas, materiales, diámetros) → planillas manuales.
2. Stock mínimo sin control → reposición por revisión visual.
3. Trazabilidad difusa entre stock físico y digital.
4. Búsqueda lenta de precios/equivalencias en el mostrador.

## Equipo y roles (informe §8.2)

| Integrante | Rol |
|---|---|
| Valentino Martin | PM / Backend (API REST, MySQL, IA) |
| Francisco Restano | Frontend / UI-UX (SPA, POS, chat) |
| Guillermo Telli (usuario) | QA / Full Stack & Analytics (reportes, documentación) |

Regularidad: **aprobada**. Falta la instancia de **evaluación final del software**.

## Módulos (informe §5)

| Módulo | Caso de uso | Actor | Depende de |
|---|---|---|---|
| Punto de Venta (POS) | CU-01 | Vendedor | Catálogo e Inventario |
| Asistente de IA | CU-02 | Vendedor | Catálogo e Inventario |
| Reportes y Alertas | CU-03 | Administrador | POS e Inventario |
| Catálogo e Inventario | CU-04 | Administrador | — |
| Backups | (sin CU en §5, exigido por cátedra) | sin definir | — |
| Ayuda / Documentación | (sin CU en §5, exigido por cátedra) | sin definir | — |

## Stack definido en el informe

- Frontend: **Vite + React + TypeScript** (SPA), responsive.
- Backend: **Node.js + Express**, API REST, TS estricto, arquitectura por capas.
- BD: **MySQL** relacional (InnoDB) + tipo `VECTOR` para embeddings (RAG).
- IA: **Groq** (nube) con fallback a **Ollama** (local), patrón Strategy.
- Proceso: **Kanban / Trello**, reuniones semanales, Git institucional.
- Plan: 5 fases / 5 meses.

## Entidades mencionadas

Del texto (no de los diagramas, que son imágenes): `productos`, `variantes`, `categorías`, `ventas`, `detalle_venta`, `proveedores`, `base_conocimiento` (MER §6.2); `AlertaStock`, `ServicioIA`, `OrquestadorIA`, `GroqNubeStrategy`, `OllamaLocalStrategy`, `BaseConocimientoVectorial` (clases §4.2).

## Requisitos de la cátedra (evaluación final)

- Software al **95–100%**, todos los módulos funcionando.
- Debe correr **local en la PC de un integrante**; no se exige despliegue productivo.
- Si un módulo falla por depender de internet/servicios externos, **no se aprueba**.
- Obligatorio: Backups (BD + config), 3 reportes exportables Excel/CSV con logo, Ayuda integrada, README, datos de prueba masivos y creíbles, código en Git de la cátedra.
- Dictamen con 13 puntos; varios con `*` (obligatorios): investigación, exposición oral, justificación de IS, conocimiento del negocio, pruebas E2E, completitud, recuperación ante fallos, documentación.

## Estado del repositorio

- Ruta: `C:\Users\Guille\Documentos\Facultad\3er Año\tallerintegracion\ferreteria-pos`
- Vite 8 + React 19 + TS 6 + CSS Modules. Node 24.19, npm 11.17.
- **Compila** (`npm run build` OK), **lint limpio** (`npm run lint`) y corre en `http://localhost:5173/`.
- Sin dependencias agregadas al template: sin router, sin librería de UI, sin tests.
- **Es repositorio git** (antes no lo era).
- Documentación de apoyo: `docs/decisiones.md`, `docs/seguridad.md` (checklist para la etapa backend)
  y `docs/referencias-ia.md` (herramientas de IA, no adoptadas).

## Estado de la UI (24/11/2026)

Dirección visual: **Nonio** (metrología de taller). Contrato completo en `DESIGN.md`.

| Pieza | Archivo | Estado |
|---|---|---|
| Tokens y base | `src/styles/tokens.css`, `base.css` | listo |
| Riel + banda de guía | `src/components/AppShell.tsx` | listo |
| Arranque (nonio) | `src/components/BootDial.tsx` | listo; invisible si el SO tiene movimiento reducido |
| POS completo | `src/views/PosView.tsx` | listo con datos mock |
| Comprobante | `src/components/ReceiptSheet.tsx` | listo, con trampa de foco e impresión |
| Datos ficticios | `src/data/catalog.ts` (12 productos, ~45 variantes, marca y descripción) | listo |
| Búsqueda y stock | `src/lib/search.ts` | listo |
| Formato es-AR | `src/lib/format.ts` | listo |
| Ferrobot: motor | `src/lib/ferrobot.ts` | listo; determinístico, solo catálogo |
| Ferrobot: conversación | `src/lib/useFerrobot.ts` | listo; turnos, borrador y consulta simulada de 320 ms |
| Ferrobot: panel | `src/components/FerrobotPanel.tsx` + `.module.css` | listo; no modal, tarjetas y "Ver en el catálogo" |

Cada producto lleva `brand` (D-29), `description` para el asistente (D-25) y `image` opcional (D-30).
Mientras D-30 no se resuelva, la fila muestra una **estampa de dos letras** de la marca en lugar de foto.

La cantidad de cada línea del ticket es **editable** (`QtyField`): al enfocar se selecciona, escribe
en vivo, recorta al stock y `Escape` revierte. Se conservan `−` / `+`.

La rueda de medidas se probó y se descartó (Guille): no deja ver la escalera completa ni volver a
una medida anterior sin recorrer las intermedias. Queda la **fila que se abre** con la regla completa.

### Asistente Ferrobot (24/11/2026)

- Abre con `F5` o con el riel **IA**; `Escape` (desde cualquier control) o `F5` cierran y devuelven el
  foco al buscador. Al abrir, el foco cae en el campo de consulta.
- No modal: desde 1201 px se ancla a la izquierda del ticket (420 px; 380 px ≤1266). Entre 901 y 1200 px
  el POS apila catálogo y nota, y el panel recibe una **columna propia de 380 px** para no tapar la nota
  ni el botón de cobrar. A ≤900 px ocupa el ancho del POS.
- Registro `role="log"` sin burbujas ni avatar; cada respuesta se apoya en una tarjeta de variante con
  medida, precio y estado de stock. "Ver en el catálogo" selecciona la variante exacta, cierra el panel
  y enfoca el buscador.
- Motor determinístico local: solo catálogo; no toca el ticket, no muestra costo/margen (D-28) ni
  ventas/reportes (D-04), y no inventa precios ni stock. Alcance y nombre: D-33/D-34.
- Probado con teclado real (Playwright): `F5` abre y enfoca el campo; `Escape` cierra y devuelve el
  foco al buscador; el riel IA reabre y actualiza `aria-expanded`; "Ver en el catálogo" deja la variante
  exacta en el buscador. Consultas: `clavo 2`, `5/16`, bajo mínimo, sin stock, "agregá", "cobrame",
  "¿qué falta?", "agotado" y fuera de alcance. Responsive a 1447×904, 1200×820 y 700×820. Consola limpia.
- Cantidad del segundo artículo: verificada con teclado real. Escribir `7` actualiza solo esa línea y el
  total; `Escape` vuelve a la cantidad anterior; `Enter` confirma. No se reprodujo el bug reportado.
- Checklist de seguridad para la etapa backend: `docs/seguridad.md`.

Probado en navegador a 1366×768, 1296×904, 1200×760 y 700×760: sin desborde, sin errores de consola.
Entre 1201 y 1266 px el nombre más largo se envuelve en dos líneas (fila de 72 px); desde 1267 vuelve
a una sola línea y 57 px. A 700 px se recortan con elipsis dos nombres largos porque la columna de
datos se queda con el ancho. Es elipsis, no desborde.

La fila activa se mantiene a la vista al recorrer con `↓`/`↑` (`scrollIntoView` con `block: 'nearest'`):
con listas más largas que el catálogo, la selección no puede quedar fuera de la ventana.

Flujo verificado por teclado: buscar → `↓` → `←/→` medida → `Enter` agrega → `Ctrl+Enter` cobra.

## Referencias visuales (23/11/2026)

| Fuente | Qué sirve para este proyecto | Qué no |
|---|---|---|
| [Hallmark](https://www.usehallmark.com/) | Disciplina de tema (papel, tipografía, paleta, foto) y la regla de **pedir material real, no inventarlo**. El linter en navegador es el mismo hábito que ya usamos. | Sus 50 temas y la generación automática de páginas: acá el diseño es uno y se defiende. |
| [Evil Buttons](https://www.evilbuttons.com/) | Catálogo de micro-interacciones (hold, slide) para estudiar tiempos y estados. | Botones con giro, glitch o "detonar": en un POS que se usa con el cliente adelante, el adorno cuesta ventas. |
| [Componentry](https://componentry.dev/docs) | El **Lens Clock** como referencia de dial con lupa; la idea de anotaciones dibujadas para la ayuda. | WebGL, partículas y carruseles: peso, dependencias y cero valor operativo. |
| [Loading UI](https://www.loading-ui.com/) | Loaders CSS para el asistente de IA y la generación de reportes, cuando existan. | Loaders en el POS: buscar y cobrar son instantáneos; un spinner ahí sería mentira. |
| [Reglas de diseño para apps con IA](https://www.instagram.com/p/DfDJm7qI8XV/) | Jerarquía, responsive, accesibilidad y cuándo un skeleton tiene sentido. | Skeleton con datos locales y la estética genérica de IA (gradientes, burbujas). |

Criterio: se toma lo que ayuda a **vender más rápido y con menos errores**. Todo lo que sea
decoración con movimiento queda fuera del POS; si se usa, va en la ayuda o en el asistente.

## Rutas propuestas (del usuario, no del informe)

```
/            login (simulado en esta etapa)
/dashboard   métricas + alertas
/pos         POS [Vendedor/Admin]
/inventory   catálogo y variantes [Admin]
/reports     reportes exportables [Admin]
/backups     copias de seguridad [Admin]
/help        guía funcional
```

Navbar: usuario logueado, estado del asistente (Groq nube / Ollama local / offline), botón del asistente.

## Riesgos abiertos

1. **MySQL `VECTOR`**: la doc oficial ubica el tipo `VECTOR` y las funciones de distancia en **MySQL HeatWave (cloud)**. Choca con "correr local sin internet". Alternativa: embeddings en `BLOB`/`JSON` y similitud calculada en Node.
2. **Embeddings**: Groq no documenta endpoint de embeddings; probablemente los genere Ollama (`nomic-embed-text` u otro). Definir antes de fase 4.
3. **Alcance**: 6 módulos + RAG + reportes + backups en 5 meses con 3 personas. La IA es el mayor riesgo de demo.
4. **Demo local**: Groq depende de internet; el camino de demo debe ser Ollama. Verificar que la PC de demo soporte MySQL + Node + Chrome + Ollama.
5. **MER incompleto**: no incluye usuarios/roles (aunque hay auth por roles), ni movimientos de stock, ni alertas.
6. **Identidad visual definida (Nonio); falta nombre y logo aprobados** por el grupo (D-09).

## Decisiones pendientes

> Registro detallado con estado y responsable: `docs/decisiones.md`.

- Nombre y logo del sistema.
- Matriz rol → ruta → acción (y qué ve el Vendedor en el dashboard).
- Formas de pago y datos del comprobante interno (remito no fiscal).
- Administración de proveedores: ¿módulo propio o pestaña dentro de Inventario?
- Criterio de valorización para "inventario valorado".
- Marca (D-29) e imagen de producto (D-30): no existen en el MER ni en los diagramas.
- Stock mínimo: ¿por variante o por producto?
- Estrategia de estilos (CSS Modules + tokens vs. Tailwind) y de iconos/fuentes (self-hosted por el requisito offline).
- Router definitivo (`react-router-dom` vs. navegación por estado).
- Alcance del asistente (D-33) y nombre "Ferrobot" (D-34).
- Herramientas de IA para el proceso (ECC, `ub-mode`, repos de skills): no adoptadas; ver `docs/referencias-ia.md`.

## Comandos

```powershell
npm install
npm run dev
npm run build
npm run lint
```

## Fuentes

- `C:\Users\Guille\Documentos\Facultad\3er Año\Informe_ Taller de Integración.pdf`
- `C:\Users\Guille\Documentos\Facultad\3er Año\Dictamen - TI - EXAMEN FINAL.pdf`
- `C:\Users\Guille\Documentos\Facultad\3er Año\TALLER INTEGRACIÓN. Puntos y criterios.pdf`

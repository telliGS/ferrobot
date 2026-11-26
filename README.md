# Ferretería POS — prototipo de interfaz

Punto de venta para una ferretería de barrio, con un asistente de mostrador
(**Ferrobot**) que responde sobre el catálogo local. Este repositorio contiene
**solo el frontend**: no hay backend, base de datos ni autenticación todavía.

- Materia: Taller de Integración — Analista en Sistemas (UADER).
- Etapa: diseño de interfaz e identidad visual. Los datos son ficticios.
- Requisito de la cátedra: la demo debe funcionar **local y sin internet**.

## Requisitos

- Node.js 20 o superior (probado con Node 24.19).
- npm 10 o superior (probado con npm 11.17).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173/`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo con recarga en caliente |
| `npm run build` | chequeo de tipos y build de producción en `dist/` |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run preview` | sirve el build de producción |

No se agregaron dependencias al template de Vite: React 19, TypeScript y CSS
Modules. Las fuentes son del sistema, así que no hay pedidos externos.

## Qué se puede probar

- Buscar productos por nombre, código o medida (`clavo 2`, `5/16`).
- Elegir una variante, agregarla a la nota y ajustar cantidades con el teclado.
- Cobrar y ver el comprobante (con trampa de foco y botón de impresión).
- Abrir **Ferrobot** con el riel `IA` o con `F5`; cerrarlo con `Escape` o `F5`.
- Preguntar por precio, stock, mínimo o medidas. Ferrobot **solo consulta** el
  catálogo: no modifica la nota de venta.

Atajos: `F5` abre/cierra Ferrobot, `Escape` cierra y devuelve el foco al
buscador, `Enter` agrega la variante seleccionada.

## Estructura

```
src/
  components/   AppShell, FerrobotPanel, ReceiptSheet, BootDial
  views/        PosView (búsqueda, nota de venta, cobro)
  lib/          búsqueda, formato es-AR, motor y estado de Ferrobot
  data/         catálogo y venta ficticios
  styles/       tokens y base de la dirección visual “Nonio”
docs/
  decisiones.md     registro D-01…
  seguridad.md      checklist para la etapa backend
  referencias-ia.md herramientas de IA evaluadas (no adoptadas)
```

## Documentación

- `DESIGN.md` — contrato visual y de interacción.
- `PRODUCT.md` — usuarios, alcance y reglas del producto.
- `CONTEXT.md` — estado, pruebas y pendientes para retomar el proyecto.
- `docs/decisiones.md` — decisiones abiertas y cerradas.

## Estado y pendientes

- Interfaz completa con datos mock; build y lint limpios.
- `[Pendiente grupo]` backend, MySQL, autenticación y RAG.
- `[Pendiente grupo]` alcance del asistente (D-33) y nombre definitivo (D-34).
- `[Pendiente grupo]` test runner del frontend (D-16): hoy no hay tests.

## Ramas

- `main` — línea principal.
- `devstelli` — rama personal de Guillermo Telli.

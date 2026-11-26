# Registro de decisiones — Ferretería POS

> Regla del proyecto: **nada que no esté en el informe se implementa sin acuerdo del grupo.**
> Este archivo existe para que Guille pueda llevarlo a la reunión sin reconstruir la conversación.

## Estados

| Estado | Significado |
|---|---|
| **Informe** | Ya establecido en la documentación. No se discute, se implementa. |
| **Propuesta** | Recomendación técnica mía. Todavía no se escribió código. |
| **Pendiente grupo** | Requiere acuerdo explícito antes de implementar. |
| **Aprobado** | Confirmado por el grupo (anotar fecha y quién). |
| **Descartado** | Se evaluó y no va (anotar motivo). |

## Decisiones

| ID | Tema | Estado | Propuesta / nota | Impacto |
|---|---|---|---|---|
| D-01 | Stack base: Vite + React + TS, Node/Express, MySQL, Groq + Ollama | Informe | — | Alto |
| D-02 | Roles: Administrador/Dueño y Vendedor | Informe | Unificar "Administrador" y "Dueño" en un solo rol | Medio |
| D-03 | Autenticación real vs. simulada en esta etapa | Pendiente grupo | Simulada ahora, con capa de permisos reemplazable | Alto |
| D-04 | Qué puede ver el Vendedor (dashboard, reportes) | Pendiente grupo | Solo operación y alertas; sin métricas financieras | Alto |
| D-05 | Router (`react-router-dom` vs. estado propio) | Pendiente grupo | `react-router-dom`; es estándar y reversible | Medio |
| D-06 | Estrategia de estilos (CSS Modules + tokens vs. Tailwind) | Pendiente grupo | CSS Modules + tokens, sin dependencias extra | Alto |
| D-07 | Librería de componentes / primitivas | Pendiente grupo | Ninguna al inicio; componentes propios | Medio |
| D-08 | Fuentes e iconos self-hosted (sin CDN) | Pendiente grupo | Obligatorio si la demo es sin internet | Medio |
| D-09 | Nombre y logo del sistema | Pendiente grupo | Sin definir; no inventar | Medio |
| D-10 | Proveedores: ¿módulo propio o pestaña de Inventario? | Pendiente grupo | Pestaña dentro de `/inventory` | Medio |
| D-11 | Criterio de "inventario valorado" | Pendiente grupo | Definir costo vs. precio de venta | Alto |
| D-12 | Stock mínimo: ¿por variante o por producto? | Pendiente grupo | Por variante (lo sugiere el diagrama de clases) | Alto |
| D-13 | Formas de pago y datos del comprobante interno | Pendiente grupo | Enumerar y definir formato de remito | Alto |
| D-14 | MySQL `VECTOR` en instalación local | Pendiente verificación | La doc oficial lo ubica en HeatWave (cloud) | Alto |
| D-15 | Proveedor/modelo de embeddings | Pendiente | Groq no documenta endpoint de embeddings | Alto |
| D-16 | Pruebas E2E (Playwright u otra) | Pendiente grupo | La cátedra exige pruebas E2E; definir herramienta. `ub-mode` queda instalado como disciplina (TDD/mutación), pero sin test runner no hay gate automático (ver D-06) | Medio |
| D-17 | Datos mock ahora, seeders en backend después | Propuesta | Mocks tipados + servicios async | Bajo |
| D-18 | Inventario y Reportes con pestañas; asistente como panel lateral | Propuesta | Menos rutas, más profundidad | Medio |
| D-19 | Dispositivo principal del mostrador | Pendiente grupo | Probablemente notebook o PC; el informe no lo define | Alto |
| D-20 | `DetalleVenta` no guarda precio unitario (solo `cantidad` y `subtotal`) | Pendiente grupo | Agregar `precioUnitario` a la línea; sin eso no se reconstruye una venta si cambia el precio | Alto |
| D-21 | El MER no soporta el POS: faltan `precio`, `stock_minimo`, `fecha`, `forma_pago`, `codigo` y datos de usuario | Pendiente grupo | Rehacer el MER a partir del diagrama de clases | Alto |
| D-22 | `BASE_CONOCIMIENTO` se asocia a producto/categoría en el MER y a variante en clases | Pendiente grupo | Unificar en variante (es la unidad de stock) | Alto |
| D-23 | No existe entidad de movimiento de stock en ningún diagrama | Pendiente grupo | Agregar `MOVIMIENTO_STOCK` (tipo, cantidad, fecha, usuario, motivo) | Alto |
| D-24 | `reglas_de_negocio` aparece solo en el diagrama de secuencia | Pendiente grupo | Definir si es tabla editable por el Administrador o seed fijo | Medio |
| D-25 | `descripcionEnriquecidaIA` y `generarDescripcionTecnica()` sin RF ni pantalla | Pendiente grupo | Definir si el ABM de producto incluye generación de descripción por IA | Medio |
| D-26 | "Gestionar Proveedores y Compras" es caso de uso pero no módulo | Pendiente grupo | Pestaña de Inventario o módulo propio (ver D-10) | Medio |
| D-27 | Usuarios, backups y ayuda funcional sin caso de uso ni módulo | Pendiente grupo | Definir si entran en el alcance de la demo | Medio |
| D-28 | Costo y margen fuera del POS | Propuesta | La pantalla está a la vista del cliente; el costo va solo en vistas de Administrador. Depende de D-04 | Alto |
| D-29 | **Marca** no existe en el MER ni en el diagrama de clases | Pendiente grupo | Tabla `MARCA` con FK desde `PRODUCTO` (no texto libre). Dos marcas del mismo artículo son **dos productos**, no dos variantes: distinto código, precio, descripción, proveedor y margen. La marca no es el proveedor | Alto |
| D-30 | **Imagen de producto** no existe en ningún diagrama | Pendiente grupo | Campo `imagen` en `PRODUCTO`, ruta local (sin CDN por el requisito offline). Una por producto; override por variante solo si hace falta. Origen sin definir: foto de proveedor o ilustración propia | Medio |
| D-31 | **Cantidad editable** en la línea del ticket | Aprobado (Guille, 20/11/2026) | El campo acepta tecleo directo además de `−` / `+`: al enfocar selecciona, escribe en vivo, recorta al stock y `Escape` revierte. Reduce el clic repetido en ventas de clavos o tornillos | Bajo |
| D-32 | **Rueda de medidas** de una variante por vez | Descartado (Guille, 20/11/2026) | Se probó y se descartó: no deja comparar la escalera completa ni volver a una medida anterior sin recorrer las intermedias. Queda la fila que se abre con la regla | Bajo |
| D-33 | **Alcance del asistente** en el mostrador | Pendiente grupo | Prototipo determinístico implementado: consulta precio, stock y medidas del catálogo; no modifica el ticket, no muestra costo/margen (D-28) ni ventas/reportes (D-04). Definir si puede agregar o modificar líneas y si el Vendedor puede ver bajo mínimo o métricas (depende de D-04 y D-12) | Alto |
| D-34 | **Nombre "Ferrobot"** para el asistente | Pendiente grupo | Es nombre de trabajo del prototipo. No reemplaza a D-09: el grupo decide si el asistente lleva nombre propio y si ese nombre es parte de la identidad del sistema | Bajo |
| D-35 | **Herramientas de IA de proceso** (`ub-mode`, `security-audit`, `rederive`) | Propuesta | Se instalan como skills globales de OpenCode, fuera del repo y sin dependencias para la demo. `ub-mode` como disciplina de TDD; `security-audit` para la etapa backend; `rederive` pendiente de `python3`. ECC y los 99 skills no se adoptan. Detalle en `docs/referencias-ia.md` | Bajo |

## Pendientes de verificación técnica

- D-14: confirmar si la versión de MySQL que van a instalar soporta `VECTOR` y `VECTOR_DISTANCE` sin HeatWave.
- D-15: confirmar qué modelo genera los embeddings y dónde corre (Ollama local).
- Hardware de demo: MySQL + Node + Chrome + Ollama en la misma máquina.

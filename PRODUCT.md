# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Vendedor** (usuario primario): atiende el mostrador de una ferretería, de pie o sentado frente a una computadora o notebook, con un cliente esperando. Su tarea es encontrar una variante exacta (medida, material, diámetro), armar la nota de venta, cobrar y entregar. Necesita velocidad y certeza sobre el stock.

**Administrador / Dueño**: gestiona catálogo, variantes, stock y proveedores; revisa alertas y reportes; ejecuta copias de seguridad. No opera el mostrador todo el tiempo.

El **Asistente de IA** no es un usuario: es un servicio externo que responde consultas ancladas al inventario real. En el prototipo actual responde de forma determinística con el catálogo local; la versión final usa RAG (Groq/Ollama) con el mismo límite: no inventa datos.

## Product Purpose

Sistematizar la operación de una ferretería: reemplazar planillas y control visual por un inventario a nivel de variante, un punto de venta interno que descuenta stock de forma transaccional y un asistente que responde en lenguaje natural sobre existencias, precios y alternativas.

Éxito significa: menos tiempo buscando mercadería o precios, sin desfases entre stock físico y digital, y sin quiebres de stock en variantes de alta rotación.

## Positioning

El sistema modela **la variante como unidad de verdad** (stock, precio y stock mínimo por variante), no el producto genérico. Sobre ese modelo, el asistente recupera información por similitud semántica y responde acotado al inventario real, con **fallback local** cuando la nube falla.

## Operating Context

- Mostrador de ferretería: atención con cliente presente, consultas de precio, equivalencias y disponibilidad.
- Administración: alta y mantenimiento de catálogo, movimientos de stock, reposición y control.
- La venta genera un **comprobante interno de mostrador (remito no fiscal)**; no hay facturación fiscal ni integración con AFIP.
- Condición académica: el software debe **correr local en la PC de un integrante**, sin despliegue productivo y sin depender de internet para funcionar.
- Trabajo en grupo con Kanban/Trello, reuniones semanales y tres roles de desarrollo (PM/Backend, Frontend/UI-UX, QA/Reportes).
- Caso de negocio **hipotético**: no hay ferretería real ni cliente formal que valide.

## Capabilities and Constraints

Confirmado por el informe:

- Catálogo con categorías, productos y variantes; alta, baja lógica, modificación y consulta.
- Movimientos de stock: ingresos por compra, egresos por venta y ajustes manuales, con validación de existencias negativas.
- POS interno: carrito, subtotales, formas de pago, comprobante interno, descuento inmediato de stock.
- Asistente de IA en lenguaje natural sobre stock, precios, productos similares y métricas comerciales.
- Alertas automáticas al perforar el stock mínimo configurable.
- Tres reportes exportables a Excel/CSV con logo: ventas por período, reposición a proveedores e inventario valorado.
- Backups de base de datos y configuración.
- Ayuda funcional integrada.
- Stack definido: Vite + React + TypeScript; Node.js + Express; MySQL; Groq con fallback a Ollama.
- Contenido de prueba: datos masivos y creíbles, relacionados con la temática ferretería.
- Roles definidos: Administrador/Dueño y Vendedor.

Decisiones abiertas (no inventar):

- Qué datos ve el Vendedor además del POS (D-04, **pendiente del grupo**).
- Dispositivo principal: notebook o PC de mostrador, sin definir (D-19).
- Proveedores: ¿módulo propio o pestaña de Inventario? (D-10).
- Criterio de valorización del inventario (D-11).
- Stock mínimo por variante o por producto (D-12).
- Formas de pago y formato del comprobante interno (D-13).
- Nombre y logo del sistema (D-09).
- Viabilidad de MySQL `VECTOR` en instalación local (D-14) y proveedor de embeddings (D-15).
- Alcance del asistente en el mostrador (D-33): si puede modificar la nota y qué ve el Vendedor.
- Nombre "Ferrobot" (D-34): nombre de trabajo; no reemplaza la decisión del nombre del sistema (D-09).

Restricciones de proceso:

- Nada que no esté en el informe se implementa sin acuerdo del grupo. Registro: `docs/decisiones.md`.
- La autenticación de esta etapa es simulada; no debe impedir reemplazarla por la real.

## Evidence on Hand

- Informe del proyecto, dictamen de examen final y criterios de la cátedra (PDF, en `C:\Users\Guille\Documentos\Facultad\3er Año\`).
- No hay datos reales de productos, ventas ni proveedores.
- No hay nombre, logo, manual de marca ni material fotográfico.
- No hay cliente ni usuario real disponible para validar.

Todo dato que se muestre en la interfaz durante el desarrollo es ficticio y debe ser **creíble y coherente con el rubro**, nunca texto de relleno.

## Product Principles

1. **La variante manda.** Precio, stock y stock mínimo pertenecen a la variante; cualquier pantalla que los muestre a nivel producto está mal modelada.
2. **El mostrador no espera.** Toda interacción frecuente debe resolverse en pocos pasos y sin ambigüedad; la densidad y la velocidad valen más que la decoración.
3. **La IA nunca bloquea.** Stock, ventas y caja funcionan con el asistente caído o sin internet; el estado del asistente es visible, no silencioso.
4. **Todo número se puede auditar.** Lo que se muestra en un reporte debe poder exportarse y reproducirse con el mismo criterio.
5. **Consenso antes que iniciativa.** Cualquier dependencia o funcionalidad fuera del informe se propone, no se impone.

## Accessibility & Inclusion

- Interfaz web responsive (escritorio, tablet y celular), con foco visible y operación por teclado en el POS.
- El informe menciona accesibilidad sin criterio medible; queda pendiente definir un estándar verificable (contraste, tamaños de objetivo, navegación por teclado). No asumir cumplimiento sin medirlo.

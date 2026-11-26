# Seguridad y reglas de interfaz — referencia para la etapa backend

> **[Propuesta]** Checklist de referencia para cuando exista backend. No son requisitos del informe:
> son agujeros típicos de una app hecha con IA, anotados para revisarlos antes de exponer el sistema.
>
> **Estado actual (24/11/2026):** el frontend es un mock local. No hay backend, base de datos,
> autenticación, red ni persistencia. **Nada de esta lista está implementado todavía.** No publicar
> esta demo como si fuera el sistema real.

## Fuentes

| Link | Contenido | Uso |
|---|---|---|
| `instagram.com/p/DfDJm7qI8XV/` | Reglas de diseño para apps con IA: jerarquía, responsive, accesibilidad, skeleton loading | Criterio de interfaz; ver §1 |
| `instagram.com/p/Dfm3fAplBjp/` | 5 agujeros: Strix, rate limit, claves fuera del código, inyección SQL, auditoría | Checklist corto; ver §2 |
| `instagram.com/p/DfsOfH3jKp2/` | 27 puntos en 7 grupos: quién entra, claves, datos, input, tráfico, repaso, informe | Checklist completo; ver §3 |
| `instagram.com/p/DY5v3PHMdRT/` | Sin texto legible al momento de la consulta | **Pendiente:** pedir a Guille qué contiene |

---

## 1. Reglas de diseño que sí aplican

- **Jerarquía:** una acción primaria por pantalla. En el POS: buscar → agregar → cobrar. Ferrobot
  consulta; nunca compite con el cobro.
- **Responsive:** los breakpoints se prueban, no se suponen. El POS se midió a 1366×768, 1296×904,
  1200×760 y 700×760; Ferrobot a 1447×904, 1200×820 y 700×820.
- **Accesibilidad:** foco visible, operación por teclado, contraste AA, `prefers-reduced-motion`.
  El panel de Ferrobot es `role="log"`, cierra con `Escape` y devuelve el foco al buscador.
- **Nada de estética genérica de IA:** sin gradientes violetas, sin glassmorphism, sin burbujas de
  chat ni avatares. Ferrobot es una libreta de mostrador con tipografía de medidas.
- **Skeleton loading:** solo si hay una espera real de red. Con datos locales no se muestra: sería
  mentir. En la versión con backend, un skeleton es aceptable para listas que tardan; el asistente
  conserva su estado explícito ("consultando"), no un esqueleto decorativo.
- **Estados vacíos:** una frase que dice qué hacer, con la tecla entre `kbd`. Sin ilustraciones.

## 2. Los 5 agujeros del link corto

| Agujero | Qué significa acá | Estado |
|---|---|---|
| **Strix** | Herramienta de IA que ataca la app antes que un tercero. Se puede correr contra el prototipo cuando haya backend | Pendiente |
| **Rate limit** | Limitar intentos de login y consultas al asistente. Sin esto, cualquiera satura Node o quema la cuota de Groq | Pendiente |
| **Claves fuera del código** | Groq/Ollama y MySQL van en `.env` del servidor. `VITE_*` es público: nunca poner secretos ahí | Pendiente |
| **Inyección SQL** | Consultas parametrizadas (`?` de `mysql2`), usuario de BD con permisos mínimos. La IA no arma SQL libre | Pendiente |
| **Auditoría** | Registrar ventas, movimientos de stock, accesos y errores. Sin traza no se reconstruye un faltante | Pendiente |

## 3. Los 27 puntos, en 7 grupos

### 3.1 Quién entra

- [ ] Login único y contraseñas con hash (argon2 o bcrypt; nunca texto plano ni SHA-1/MD5).
- [ ] Cookies de sesión `HttpOnly`, `SameSite=Lax/Strict` y `Secure` cuando haya HTTPS.
- [ ] Links de cambio de contraseña con vencimiento y un solo uso.
- [ ] Roles aplicados **en el servidor**: el Vendedor no accede a reportes, backups ni administración
      aunque escriba la URL (D-04).
- [ ] Mensajes de error de login genéricos: no revelar si el usuario existe.

### 3.2 Claves y configuración

- [ ] `.env` en `.gitignore`; `.env.example` sin valores reales.
- [ ] Claves de Groq/Ollama y MySQL solo en el servidor.
- [ ] Revisar el historial de Git: si una clave se subió, **rotarla**; borrar el commit no alcanza.
- [ ] No pegar claves en prompts, issues, capturas ni en la documentación.
- [ ] La app arranca sin claves de IA (fallback local) y avisa el estado; no rompe el POS.

### 3.3 Datos

- [ ] Cada usuario ve solo lo suyo; el Vendedor no lee costos, márgenes ni reportes (D-28/D-04).
- [ ] Consultas parametrizadas en todo el acceso a MySQL; sin concatenar strings.
- [ ] `/admin`, `/reports`, `/backups` cerrados por rol y por sesión, no solo ocultos en la UI.
- [ ] Aviso de actividad rara: muchos intentos fallidos, ventas fuera de horario, ajustes de stock.
- [ ] Backups cifrados y fuera de la carpeta pública; restaurar es parte de la prueba.

### 3.4 Lo que manda el usuario

- [ ] Validar todo en el servidor: cantidad, precio, stock y forma de pago. El carrito del cliente
      **no es confiable**; el precio se recalcula al cobrar.
- [ ] XSS: React escapa por defecto; no usar `dangerouslySetInnerHTML` con texto del usuario.
- [ ] CSRF: `SameSite` + token en formularios que cambian estado.
- [ ] Archivos: tipo, tamaño y nombre; guardar fuera del bundle y servir con permisos.
- [ ] Rate limit específico para el asistente y para el login.

### 3.5 El tráfico

- [ ] HTTPS si la demo se expone fuera de `localhost`.
- [ ] CORS restringido al origen de la SPA; no `*` con credenciales.
- [ ] Cabeceras: CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors`.
- [ ] Límite de intentos por IP y por sesión; timeouts y body size acotados.

### 3.6 Último repaso

- [ ] `NODE_ENV=production`, debug apagado, stack traces fuera de la respuesta.
- [ ] Dependencias al día; `npm audit` revisado; paquetes que no se usan, afuera.
- [ ] Sin `.env`, `.git`, `node_modules` ni backups dentro de la carpeta servida.
- [ ] Logs sin contraseñas, tokens ni datos personales.

### 3.7 La revisión final

- [ ] Probar permisos, cobro, stock y restaurar backup de punta a punta.
- [ ] Informe corto: qué se encontró, qué se arregló y qué queda abierto.
- [ ] Opcional: correr Strix o un análisis similar sobre el prototipo y adjuntar el resultado.

## 4. Lo específico de este POS

1. **El precio y el stock se validan al cobrar en el servidor.** El total que muestra React es una
   vista; la venta se calcula con los datos de la BD dentro de una transacción.
2. **La IA no recibe credenciales ni ejecuta SQL libre.** Consulta un servicio acotado (catálogo,
   stock, precios) y responde con datos; el RAG no puede escribir en la base.
3. **Una venta descuenta stock y registra el movimiento en la misma transacción.** Si falla una parte,
   no queda stock negativo ni venta a medias.
4. **El comprobante es interno y no fiscal.** No se envía a AFIP ni se declara como factura.
5. **El Vendedor no ve costo, margen ni métricas** (D-28/D-04); el backend debe impedirlo, no solo la UI.

## 5. Abierto

- Link 4 (`DY5v3PHMdRT`): sin texto legible; pedir a Guille qué contiene antes de sumarlo.
- D-04: qué ve el Vendedor. De eso depende el alcance real de los permisos.
- D-14/D-15: MySQL `VECTOR` y embeddings; si no corren local, el RAG cambia de arquitectura.
- D-16: pruebas E2E; sin ellas no se puede afirmar que los permisos funcionan.

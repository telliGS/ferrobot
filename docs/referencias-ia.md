# Referencias de IA para el proceso

> Herramientas de **proceso**, no requisitos del sistema. Ninguna está en el
> `package.json` ni se ejecuta en la demo. Las que se instalaron son skills
> globales de OpenCode, fuera del repositorio. Adoptar una como parte de la
> entrega es **decisión del grupo**.

| Link | Qué es | Sirve para | Estado |
|---|---|---|---|
| `instagram.com/p/DgGJybjiiu3/` | **ECC**: repo open source con 72 agentes, 328 skills y 99 comandos | Armar un “equipo” de agentes que planifica, revisa código y busca fallos | No adoptado; el alcance excede el proyecto |
| `instagram.com/p/DgGsrCSuZzk/` | **`ub-mode`** de Uncle Bob: `SKILL.md` con TDD obligatorio, refactor, commits chicos y tres jueces (crapper, dryer, mutator) | Disciplina de trabajo y testing (D-16) | **Instalado** como skill global el 25/11/2026; ver notas abajo |
| `instagram.com/p/DgGgYX_jVL7/?img_index=3` | **99 skills en 6 repos**: marketing, redes, diseño, finanzas, legal y documentos | Diseño y documentación | No adoptado; la mayoría no aplica al POS |
| `instagram.com/p/DY5v3PHMdRT/` | Post de `francisco__miranda` (28/05/2026) con la leyenda “Comentá 👇”; no nombra herramienta ni repo | Sin clasificar | **Descartado:** engagement sin información verificable |
| `instagram.com/p/DgAY2pIxjKR/` | **Rederive** (`EricJujianZou/rederive`, MIT): skill que hace preguntas para re-derivar las decisiones de diseño del propio código | Defensa oral y conocimiento del negocio: obliga a explicar por qué está hecho así | Evaluado, **no instalado**; requiere `python3` y bash |
| `instagram.com/p/DgDWHsOHOm4/` | **`security-audit` de Cloudflare** (`cloudflare/security-audit-skill`, MIT): auditoría multiphase con agentes, verificación independiente y reporte | Seguridad del backend y checklist de `docs/seguridad.md` | **Instalado** como skill global el 25/11/2026; se ejecutará cuando exista backend |
| `instagram.com/p/DgGhlzjs6jc/` | Post de `bencorde` (23/11/2026): “Únete hoy. 7 días gratis. Black Friday.”; no nombra herramienta ni repo | Sin clasificar | **Descartado:** promo sin información verificable |
| `instagram.com/p/DgJhj2pB2ga/` | Post genérico sobre 15 fallas de seguridad en apps con vibe coding; no nombra un repo | Checklist de seguridad | Solo referencia; no hay skill para instalar |

## Lectura rápida

- **`ub-mode`** es el más alineado con el dictamen: TDD, mutación y tests que no
  sean de mentira. Queda instalado como disciplina. Sus herramientas
  (`crapper`, `dryer`, `mutator`) **no** están instaladas y el frontend no tiene
  test runner: D-06 prohíbe sumar dependencias sin acuerdo y D-16 sigue
  pendiente. Sin tests no hay TDD real; no se escriben tests falsos para cumplir.
  Alternativa sin dependencias a evaluar: un `tsconfig` de test que emita los
  módulos puros (`ferrobot.ts`, `format.ts`, `search.ts`) y correrlos con
  `node --test`; no agrega paquetes, pero D-16 decide si se adopta.
- **`security-audit`** es serio y agent-neutral, pero su flujo completo pide
  subagentes y sandbox. En Windows, sin sandbox, se usa en modo fuente y se
  marcan como `needs_validation` los hallazgos que requieran ejecutar código.
  No tiene sentido correrlo sobre una demo sin backend: esperar a la etapa API.
- **`rederive`** es la herramienta más útil para la **exposición oral**: no
  genera código, pregunta cómo construirías cada parte y te obliga a defender
  las decisiones. En esta PC hay Python 3.14 (`py`) y Git Bash, pero falta el
  comando `python3` que espera el skill. Se puede instalar cuando el grupo
  quiera; no toca la demo.
- **ECC** y los **99 skills** no se adoptaron: mucho alcance y poca relación con
  un POS local de 5 meses. Las skills de diseño se solapan con `DESIGN.md`.
- Ninguna de estas herramientas debe tocar la rama de entrega sin un branch y
  una prueba aparte.

## Pendiente

- Decidir si se instala `rederive` y cómo se resuelve `python3` en Windows.
- Cuando D-16 defina el test runner, instalar `crapper`, `dryer` y `mutator` en
  un entorno aparte y medir si el costo/tiempo se justifica.
- Si el grupo quiere ECC o los 99 skills, probarlos en un branch y definir qué
  se mide para decidir si se quedan.

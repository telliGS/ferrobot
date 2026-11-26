# Referencias de IA para el proceso — no adoptadas

> **[Propuesta]** Links que pasó Guille para tener en cuenta. Ninguno está instalado ni cambia el
> repositorio: son herramientas de proceso, no requisitos del sistema. Adoptar cualquiera es
> **decisión del grupo** y se prueba aparte, no sobre la entrega.

| Link | Qué es | Sirve para | Estado |
|---|---|---|---|
| `instagram.com/p/DgGJybjiiu3/` | **ECC**: repo open source con 72 agentes, 328 skills y 99 comandos; el video dice que supera en estrellas a Claude Code | Armar un "equipo" de agentes que planifica, revisa código y busca fallos | No adoptado; verificar repo, licencia y costo antes de instalar |
| `instagram.com/p/DgGsrCSuZzk/` | **`ub-mode`** de Uncle Bob: `SKILL.md` para Claude Code/Cursor con TDD obligatorio, refactor, commits chicos y tres jueces (crapper, dryer, mutator) | Inspirar el testing del backend y de la UI (D-16) | No adoptado; la idea sirve aunque no se instale |
| `instagram.com/p/DgGgYX_jVL7/?img_index=3` | **99 skills en 6 repos** de GitHub: marketing, redes, diseño, finanzas, legal y documentos | Diseño y documentación | No adoptado; la mayoría no aplica al POS |
| `instagram.com/p/DY5v3PHMdRT/` | Sin texto legible al consultarlo | Sin clasificar | **Pendiente:** preguntar a Guille |

## Lectura rápida

- **ECC** promete mucho y no lo verifiqué. Antes de instalarlo: ver el repo real, la licencia, qué
  permisos pide y si aporta algo que OpenCode no haga ya. Un "equipo de agentes" no reemplaza la
  revisión humana ni las pruebas de la cátedra.
- **`ub-mode`** es el más alineado con el dictamen: TDD, mutación y tests que no sean de mentira. Se
  puede tomar como checklist sin instalar la skill. El mutation testing es útil, pero cuesta tiempo y
  tokens; para 5 meses y 3 personas hay que elegir qué se prueba.
- **99 skills** es una colección de propósito general; para este proyecto no reemplaza `DESIGN.md` ni
  el registro de decisiones. Las de diseño pueden solaparse con la dirección Nonio.
- Ninguna de estas herramientas debe tocar la demo local sin un branch y una prueba aparte.

## Pendiente

- Confirmar qué contiene `DY5v3PHMdRT`.
- Si el grupo quiere probar alguna, definir dónde (branch, entorno) y qué se mide para decidir si se
  queda. No instalar por entusiasmo ni en la rama de entrega.

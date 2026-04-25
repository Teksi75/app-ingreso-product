# Reporte de Auditoría Visual – Flujo de Fortalecimiento de Skills Débiles

**Fecha:** 2026-04-25
**Scope:** Dashboard, práctica focalizada, simulaciones, empty state
**Método:** Screenshots generados por Playwright Chromium headed + revisión manual

---

## Resumen Ejecutivo

El test E2E existente (`adaptive-weak-skill-reinforcement.spec.ts`) **pasa correctamente** y valida el ciclo completo de debilidad → reforzamiento → rotación → simulador listo. Sin embargo, la auditoría visual reveló **8 oportunidades de mejora** en la UI/UX que pueden confundir al estudiante o degradar la experiencia. Ninguna es un bug funcional, pero varias afectan la claridad del mensaje pedagógico.

---

## Resultado de la auditoría visual completada

### Tests ejecutados

| Test | Resultado | Duración |
|------|-----------|----------|
| `adaptive-weak-skill-reinforcement.spec.ts` | ✅ 1 passed | 12.7s |
| `audit-weak-skill-ui.spec.ts` (nuevo) | ✅ 1 passed | 23.2s |

El test existente **sigue funcionando correctamente**. No hay bugs funcionales en el ciclo de fortalecimiento.

---

### 📸 Screenshots capturados (8 estados)

1. `01-dashboard-with-weaknesses.png` – Debilidades detectadas (skill_4, skill_5 weak)
2. `02-dashboard-recovering.png` – skill_4 recuperándose a developing
3. `03-dashboard-rotation.png` – skill_4 mastered, rotación a skill_5
4. `04-dashboard-simulator-ready.png` – Todas mastered, simulador desbloqueado
5. `05-practice-focused.png` – Práctica focalizada de gramática
6. `06-simulaciones.png` – Página de simulaciones
7. `07-dashboard-empty-state.png` – Estudiante nuevo (newStudent=1)
8. `08-dashboard-continue-reading.png` – Lectura reciente con accuracy bajo

---

### 🔴 Hallazgos críticos encontrados (3)

| # | Hallazgo | Impacto |
|---|----------|---------|
| **1** | **Mensajes técnicos del mastery model expuestos al usuario** – El panel "Debilidades detectadas" muestra cosas como *"lengua.skill_4.subskill_1 queda en mastery 1 con score 2, accuracy ponderada 0%..."* | El estudiante no entiende el mensaje. Se pierde el valor pedagógico del panel. |
| **2** | **Avatar flotante "N" tapa contenido** – En la esquina inferior izquierda tapa el botón "Empezar de cero" y parte del ActionPanel en mobile | El usuario no puede interactuar con elementos clave sin mover el badge accidentalmente. |
| **3** | **CTA principal desconectado de las debilidades** – Cuando hay skills `weak`, el ActionPanel recomienda *"Empezar lectura"* en lugar de *"Práctica focalizada"* porque `getNextStepRecommendation` prioriza lecturas sin leer sobre reforzamiento | El estudiante ve debilidades en rojo pero el botón principal lo manda a leer. Siente que la app "no le hace caso". |

### 🟡 Hallazgos medios (5)

| # | Hallazgo | Propuesta |
|---|----------|-----------|
| **4** | **Empty state intimidante** – 7 filas de ceros y "Todavía no resuelto" sin contexto | Agregar mensaje de bienvenida y ocultar skills no descubiertas |
| **5** | **Página de simulaciones muy vacía** – Solo título + botón, sin expectativas claras | Agregar duración estimada, número de preguntas, qué pasa después |
| **6** | **Heading contradictorio** – "Sin debilidades críticas" seguido de skills "En desarrollo" | Cambiar heading a "Habilidades en desarrollo" cuando no hay weak |
| **7** | **Contraste insuficiente en botón "Responder"** – Color menta con texto blanco (~2.1:1) | Oscurecer fondo o usar texto oscuro para cumplir WCAG AA |
| **8** | **"Prácticas: 0" con respuestas de lectura** – La columna cuenta solo `practiceSessions`, ignora reading | Renombrar a "Sesiones" o agregar desglose por modo |

---

### ✅ Bugs funcionales – Ninguno detectado

Todos los criterios de fallo del test original se mantienen sanos:
- No recomienda simulador con skills débiles ✅
- No abandona una skill weak prematuramente ✅
- No ignora subskills débiles ✅
- Recomendación rota correctamente cuando mejora ✅
- Dominio total desbloquea simulador ✅

---

### Archivos generados

- `tests/e2e/audit-weak-skill-ui.spec.ts` – Test de auditoría visual (8 screenshots)
- `AUDIT_REPORT.md` – Reporte completo con propuestas de priorización
- `.screenshots/audit/*.png` – Evidencia visual

### Implementación recomendada

Se priorizan los **3 críticos**: mensajes humanos en debilidades, evitar que el avatar o navegación flotante tape contenido, y conectar el CTA principal con la debilidad dominante. Luego se aplican mejoras medias de bajo riesgo: empty state, simulaciones, heading condicional, contraste y etiqueta de sesiones.

---

### Estado de implementación

Las mejoras propuestas fueron implementadas:

- Hallazgo 1: el panel de debilidades ahora muestra razones pedagógicas y no trazas técnicas del mastery model.
- Hallazgo 2: el dashboard agrega espacio inferior suficiente para que contenido y acciones no queden detrás de elementos flotantes o navegación inferior.
- Hallazgo 3: el CTA principal prioriza práctica focalizada cuando hay dos o más skills débiles o una debilidad muy marcada.
- Hallazgo 4: el empty state agrega bienvenida y reemplaza la lista de 7 filas vacías por un resumen de habilidades por descubrir.
- Hallazgo 5: la pantalla inicial de simulaciones informa duración estimada, cantidad de preguntas, cobertura y qué ocurre al finalizar.
- Hallazgo 6: el panel distingue entre "Debilidades detectadas", "Habilidades en desarrollo" y "Sin debilidades críticas".
- Hallazgo 7: el botón primario usa un teal más oscuro para mejorar contraste.
- Hallazgo 8: el dashboard renombra "Prácticas" a "Sesiones" y cuenta práctica, lectura y simulador.

---

## Hallazgos por Severidad

### 🔴 Alta – Requiere atención prioritaria

#### 1. Mensajes técnicos expuestos al usuario en panel de debilidades
**Ubicación:** `Dashboard > Puntos a mejorar > Debilidades detectadas`
**Screenshot:** `01-dashboard-with-weaknesses.png`

**Problema:** La "razón" mostrada debajo de cada debilidad usa `summary.trace[0]`, que contiene texto de debug del mastery model:

> *"lengua.skill_4.subskill_1 queda en mastery 1 con score 2, accuracy ponderada 0% y precision reciente 0%."*

Un estudiante de secundaria no entiende qué es un "mastery 1", un "score 2", ni por qué debería importarle.

**Impacto:** El estudiante ignora el panel de debilidades porque el mensaje no le habla. Pierde el valor pedagógico de la funcionalidad.

**Propuesta:** Reemplazar `trace[0]` por un mensaje humano generado a partir del estado:
- Si `weak` y `accuracy < 0.3`: *"Esta habilidad necesita práctica constante. Intentá hacer al menos 10 preguntas seguidas."*
- Si `weak` y `accuracy 0.3-0.5`: *"Vas por buen camino. Seguí practicando para consolidar la comprensión."*
- Si `developing`: *"Ya tenés una base sólida. Una lectura guiada puede ayudarte a pasar al siguiente nivel."*
- Si `subskill` weak: *"Este tema específico dentro de [skill padre] necesita más atención."*

**Archivos a modificar:** `src/app/dashboard/page.tsx` → función `getImprovementPoints` y/o agregar `getHumanReadableReason()` en `src/recommendation/next_step.ts`.

---

#### 2. Avatar flotante tapa contenido crítico en mobile/desktop compacto
**Ubicación:** Esquina inferior izquierda, en todas las páginas
**Screenshots:** Todos (`01` a `08`)

**Problema:** El badge circular con la letra "N" (avatar del estudiante) flota fijo en `bottom: 0; left: 0` y tapa:
- El botón "Empezar de cero" (`04-dashboard-simulator-ready.png`)
- Parte del ActionPanel en ciertos viewports
- El texto de la última skill en el dashboard

**Impacto:** En mobile (375px) el problema es más grave. El usuario no puede hacer click en "Empezar de cero" sin desplazar el badge accidentalmente.

**Propuesta:**
- Opción A: Mover el avatar al header fijo superior o al sidebar en desktop.
- Opción B: En mobile, convertir el avatar en un botón de menú desplegable (hamburger) que no ocupe espacio flotante.
- Opción C: Agregar `padding-bottom` al `<main>` para que el contenido nunca quede detrás del badge.

---

#### 3. Inconsistencia entre debilidades mostradas y CTA principal del ActionPanel
**Ubicación:** `Dashboard > ActionPanel` vs `ImprovementPanel`
**Screenshots:** `01-dashboard-with-weaknesses.png`, `03-dashboard-rotation.png`

**Problema:** Cuando hay skills `weak`, el panel inferior dice "Debilidades detectadas" (correcto), pero el ActionPanel principal recomienda *"Empezar lectura: El canto del yaraví..."* en lugar de *"Práctica focalizada: Gramática en contexto"*.

Esto ocurre porque `getNextStepRecommendation` prioriza `unreadReadingUnits` (priority 4) sobre `targeted-practice` (priority 5). Un estudiante que ve 4 debilidades en rojo esperaría que el botón principal lo mande a reforzar, no a leer un texto nuevo.

**Impacto:** El estudiante siente que la app "no le hace caso" a sus debilidades. El CTA principal y el panel de debilidades parecen no estar conectados.

**Propuesta:** Elevar la prioridad de `targeted-practice` cuando `weakSkillCount >= 2` o cuando el weakest skill tiene `masteryScore < 30`. O bien, cambiar el ActionPanel para que tenga **dos CTAs** cuando hay debilidades:
- Botón primario (negro): "Reforzar [skill más débil]"
- Botón secundario (outline): "O leer un texto nuevo"

---

### 🟡 Media – Mejora de experiencia notable

#### 4. Dashboard vacío muestra 7 skills "Todavía no resuelto" sin contexto motivador
**Ubicación:** `/dashboard?newStudent=1`
**Screenshot:** `07-dashboard-empty-state.png`

**Problema:** Un estudiante nuevo ve una lista de 7 habilidades grises, todas con 0 en todo. Es abrumador e intimidante. No hay mensaje de bienvenida ni explicación de qué va a hacer la app.

**Impacto:** Abandono temprano. El estudiante no entiende el valor de la plataforma.

**Propuesta:**
- Agregar una sección de bienvenida arriba del todo:
  > *"¡Bienvenido a INGENIUM! Vamos a prepararte para el ingreso paso a paso. Empezá con una lectura guiada y el sistema se encargará de encontrar qué necesitás reforzar."*
- Ocultar las skills en `not_started` o mostrarlas como "Próximas habilidades a descubrir" con iconos bloqueados en lugar de ceros.
- En lugar de 7 filas de ceros, mostrar un resumen visual (ej: "0 de 7 habilidades descubiertas") con un progress ring.

---

#### 5. Falta de información en página de simulaciones
**Ubicación:** `/simulaciones`
**Screenshot:** `06-simulaciones.png`

**Problema:** La página tiene solo título, una línea de descripción y un botón. No indica:
- Cuánto dura aproximadamente
- Cuántas skills se evalúan
- Qué pasa después (guarda resultado, actualiza el dashboard)
- Si es la primera vez que hace un simulador

**Impacto:** El estudiante no tiene expectativas claras. Puede sentir ansiedad o evitar hacer clic.

**Propuesta:** Agregar una card informativa con:
- ⏱️ Duración estimada: ~15 minutos
- 📝 10 preguntas de las 7 habilidades de Lengua
- 🎯 Al finalizar vas a ver tu score y qué skills reforzar
- ⚡ Consejo: hacelo cuando estés descansado

---

#### 6. "Sin debilidades críticas" seguido de lista de skills a mejorar
**Ubicación:** `Dashboard > ImprovementPanel`
**Screenshot:** `08-dashboard-continue-reading.png`

**Problema:** El heading dice "Sin debilidades críticas" pero justo debajo aparece una lista con skills en estado "En desarrollo" (skill_1 en este caso). El estudiante se pregunta: "¿No hay debilidades o sí hay?"

**Impacto:** Confusión cognitiva. El heading contradice visualmente el contenido.

**Propuesta:**
- Cambiar el heading cuando solo hay skills `developing`:
  > *"Habilidades en desarrollo"* en lugar de *"Sin debilidades críticas"*
- O separar en dos secciones: una para "Debilidades críticas" (state=weak) y otra para "Próximas a consolidar" (state=developing).

---

#### 7. Contraste insuficiente en botón "Responder" de práctica
**Ubicación:** `/practice` (modo training)
**Screenshot:** `05-practice-focused.png`

**Problema:** El botón "Responder" usa un color menta/turquesa claro (`#7DD3C0` aproximado) con texto blanco. El ratio de contraste es aproximadamente 2.1:1, por debajo del mínimo WCAG AA (4.5:1 para texto normal).

**Impacto:** Usuarios con baja visión o en condiciones de luz brillante pueden tener dificultad para leer el botón.

**Propuesta:** Oscurecer el fondo a `#2A9D8F` o `#21867A` para alcanzar ≥ 4.5:1, o usar texto oscuro (`#1d1d1b`) sobre fondo menta.

---

#### 8. Skills con sesiones de lectura muestran "0 prácticas" a pesar de tener respuestas
**Ubicación:** `Dashboard > SkillList`
**Screenshot:** `04-dashboard-simulator-ready.png`

**Problema:** `skill_2` tiene 8 respuestas y 88% precisión, pero "Prácticas: 0". Esto es técnicamente correcto porque la columna "Prácticas" mapea `practiceSessions` (solo cuenta sesiones `mode=practice`), pero un usuario ve "0 prácticas" y piensa que nunca hizo nada.

**Impacto:** El estudiante desconfía de los números. No entiende por qué sus respuestas de lectura no cuentan como práctica.

**Propuesta:**
- Cambiar el encabezado de "Prácticas" a "Sesiones" y contar todas las sesiones donde la skill aparece.
- O agregar una tercera columna: "Lecturas" / "Simulaciones" para desglosar.
- O renombrar la columna actual a "Sesiones de práctica" para que sea explícito.

---

## Checklist de Bugs Funcionales (ninguno detectado)

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | La app recomienda simulador mientras hay skills débiles | ✅ No ocurre | `01`, `02`, `03` muestran simulador oculto |
| 2 | Skill con bajo desempeño deja de ser reforzada prematuramente | ✅ No ocurre | `02` sigue mostrando skill_4 weak después de sesión fallida |
| 3 | Sistema ignora subskills débiles | ✅ No ocurre | `01` lista subskills weak explícitamente |
| 4 | Recomendación no cambia cuando la debilidad mejora | ✅ No ocurre | `03` rota de skill_4 a skill_5 |
| 5 | Progreso no alimenta `buildMasteryModel()` | ✅ No ocurre | Estados cambian consistentemente entre screenshots |
| 6 | Dashboard y `/habilidades` contradictorios | N/A | No se auditó `/habilidades` en este test |
| 7 | Dominio total no desbloquea simulador | ✅ No ocurre | `04` muestra "Listo para simulacion" |

---

## Propuesta de Priorización de Mejoras

| Prioridad | Hallazgo | Esfuerzo estimado |
|-----------|----------|-------------------|
| P0 | Hallazgo #1: Razones técnicas en panel de debilidades | Medio (nueva función de mapeo) |
| P0 | Hallazgo #2: Avatar tapa contenido | Bajo (CSS) |
| P1 | Hallazgo #3: Desconexión entre debilidades y CTA | Medio (lógica de recomendación o UI) |
| P1 | Hallazgo #6: Heading contradictorio en ImprovementPanel | Bajo (condicional de heading) |
| P2 | Hallazgo #4: Empty state intimidante | Medio (nueva sección de bienvenida) |
| P2 | Hallazgo #5: Página de simulaciones vacía | Bajo (texto estático) |
| P2 | Hallazgo #7: Contraste del botón Responder | Bajo (cambio de color) |
| P2 | Hallazgo #8: "Prácticas: 0" con respuestas de lectura | Bajo (cambio de label o lógica) |

---

## Archivos Relevantes para Implementar Mejoras

- `src/app/dashboard/page.tsx` – Panel de mejoras, heading condicional, razones humanas
- `src/recommendation/next_step.ts` – Priorización de CTA principal
- `src/components/dashboard/ActionPanel.tsx` – Render de botones del ActionPanel
- `src/components/dashboard/SkillList.tsx` / `SkillItem.tsx` – Labels de prácticas/lecturas
- `src/app/practice/page.tsx` o componente de botón – Color del botón Responder
- `src/app/simulaciones/page.tsx` – Información adicional pre-simulación

---

*Fin del reporte. Todos los screenshots de auditoría están en `.screenshots/audit/`.*

# 03 - Validacion de limitaciones

> Validacion Codex contra codigo real. Fuentes MiMo: `docs/analysis/04_evolution_capacity.md` y `docs/analysis/05_structural_limitations.md`.

## Veredicto ejecutivo

Las limitaciones L1-L10 son reales en su mayoria. Las criticas para lectura + multiples preguntas son L1, L2 y L8. L3 es critica para adaptatividad personalizada, pero no bloquea el primer slice de lectura. L5 esta sobredimensionada por MiMo en cantidad de legacy IDs: el codigo actual tiene 21 mappings, no 103.

## Tabla de validacion

| ID | Estado | Severidad validada | Evidencia | Decision |
|---|---|---:|---|---|
| L1 ejercicio atomico | Confirmada con matiz | Critica | `Exercise` solo tiene `text?: string`, sin grupo: `src/practice/session_runner.ts:17-32`; selector recibe lista plana: `src/practice/exercise_selector.ts:230-234`. | Crear `TextGroup` compatible y `textGroupId` opcional. |
| L2 random reemplaza adaptatividad UI | Confirmada | Critica para UI | `handleNext()` llama `pickExercise(available)`: `src/app/practice/PracticeQuestion.tsx:107`; `pickExercise` usa random: `:306-308`. | Cambiar seleccion intra-sesion; para primer slice, priorizar mismo grupo. |
| L3 sin memoria entre sesiones | Confirmada con matiz | Alta | `startPracticeSession()` pasa `userState` vacio: `src/practice/session_runner.ts:420-423`; solo usa `seenSkills`: `:410-418`. | Usar progreso acumulado despues del primer slice. |
| L4 persistencia sin concurrencia | Confirmada | Media | `readFileSync` + `writeFileSync` sobre `data/progress.json`: `src/storage/local_progress_store.ts:39-48`, `:121-124`. | Secundaria mientras sea monousuario/local. |
| L5 doble sistema de IDs | Confirmada con correccion | Media-Alta | `LEGACY_SKILL_IDS` existe: `src/practice/exercise_selector.ts:81-103`; `progress.json` mezcla `LEN-*` y `lengua.skill_*`: `data/progress.json:10`, `:120`; dashboard filtra canonicos: `src/app/dashboard/page.tsx:115-118`. | Migrar mas adelante; no bloquear lectura. |
| L6 RSC acoplada a negocio | Confirmada | Media | `practice/page.tsx` carga sesion y define server action inline: `src/app/practice/page.tsx:33-69`, `:102-143`. | Extraer cuando aparezca nueva logica compartida. |
| L7 formatos JSON inconsistentes | Confirmada | Media | `normalizeExerciseFile()` soporta array, `{exercises}` y `{subskills}`: `src/practice/session_runner.ts:125-160`. | El nuevo formato debe ser explicito y probado. |
| L8 sin abstraccion de sesion | Confirmada | Critica | UI usa varios `useState`: `src/app/practice/PracticeQuestion.tsx:31-46`; no hay `SessionContext` central. | Para primer slice basta contexto cliente minimo. |
| L9 simulador sin UI | Confirmada | Secundaria | `runSimulator()` se ejecuta al importar: `src/practice/simulator_runner.ts:264`; random deliberado: `:134-146`. | No priorizar para lectura. |
| L10 mastery primitivo/duplicado | Confirmada | Media | UI calcula delta simple: `src/app/practice/page.tsx:146-164`; CLI calcula por accuracy+attempts: `src/practice/session_runner.ts:247-252`; selector usa `accuracyToMastery`: `src/practice/exercise_selector.ts:582-587`. | Unificar antes de adaptatividad avanzada. |

## Limitaciones criticas vs secundarias

Criticas para el objetivo "lectura de texto + preguntas":

- L1: no hay entidad superior al ejercicio.
- L2: random rompe continuidad de preguntas.
- L8: no hay sesion/contexto que represente "estoy en el texto A, pregunta 2 de 4".

Altas pero no bloqueantes del primer slice:

- L3: afecta personalizacion entre sesiones, no la continuidad dentro de un texto.
- L5: complica datos historicos y dashboard, pero un `textGroupId` nuevo puede convivir.
- L10: afecta calidad adaptativa, pero no impide agrupar preguntas.

Secundarias para este objetivo:

- L4: importante si hay multiusuario o despliegue productivo.
- L6: deuda de mantenibilidad.
- L7: deuda de datos; se puede introducir formato nuevo sin migrar todo.
- L9: no participa del flujo de lectura de usuario.

## Partes parcialmente resueltas en codigo

- Adaptatividad intra-sesion existe en `runSession()`, aunque no en UI: `src/practice/session_runner.ts:288-346`.
- Hay normalizacion robusta que permite convivir con formatos viejos: `src/practice/session_runner.ts:125-192`.
- Hay grafo de mastery y relaciones cargado por el selector: `src/practice/exercise_selector.ts:76-79`, `:239-240`.
- Hay tests de integracion para carga, normalizacion y seleccion: `src/components/practice/__tests__/lengua_integration.test.ts:58-213`.
- La UI ya puede mostrar un `text` por ejercicio si existe: `src/app/practice/PracticeQuestion.tsx:186-190`.

## Correcciones al analisis de MiMo

- L5: la afirmacion "103 entradas hardcodeadas" no coincide con el codigo actual; `LEGACY_SKILL_IDS` contiene 21 entradas.
- L2: es falso para `runSession()` y verdadero para `/practice`.
- L8: existe `SessionResult` para CLI y `SessionData` para persistencia, pero no son una abstraccion de sesion activa reutilizable por UI.

## Decision implementable

El orden tecnico recomendado es:

1. Introducir `TextGroup` + `textGroupId` sin tocar persistencia.
2. Hacer que la UI permanezca dentro del mismo grupo hasta agotarlo.
3. Agregar tests que demuestren 3 preguntas sobre el mismo texto.
4. Recien despues integrar selector adaptativo, mastery unificado y persistencia ampliada.

# 05 - Traduccion a implementacion real

> Validacion Codex contra codigo real. Fuente MiMo: `docs/analysis/07_evolution_plan.md`.

## Veredicto ejecutivo

El plan de MiMo es conceptualmente bueno, pero el orden optimo para el objetivo declarado no es empezar por "Etapa 0" completa. Migrar IDs y unificar mastery antes de probar lectura + preguntas aumenta el riesgo sin validar el cambio principal. El primer slice implementable debe ser: cargar un `TextGroup`, aplanarlo a ejercicios, mantener el texto visible y responder varias preguntas del mismo grupo.

## Cambios concretos por etapa

### Etapa A - Tipos y loader de TextGroup

Archivos:

- Crear `src/practice/types.ts`.
- Modificar `src/practice/session_runner.ts`.
- Modificar tests en `src/components/practice/__tests__/lengua_integration.test.ts`.
- Agregar fixture JSON en `docs/04_exercise_engine/lengua_textgroups_modulo1.json`.
- Actualizar `docs/04_exercise_engine/lengua_content_index.json` si se quiere que el test de conteo incluya el nuevo archivo.

Funciones/tipos:

- Crear `TextGroup`, `TextGroupExerciseInput`, `ExerciseInput`.
- Extender `Exercise` con `text_group_id?: string`, `text_group_title?: string`, `question_order?: number`.
- Extender `normalizeExerciseFile()` para soportar `{ text_groups: [...] }`.
- Crear helper interno `normalizeTextGroupExercises()`.

Impacto:

- Sin cambio visible si no hay grupos.
- Permite datos nuevos sin migrar datos existentes.

### Etapa B - UI de continuidad por texto

Archivos:

- Modificar `src/app/practice/PracticeQuestion.tsx`.

Funciones:

- Crear `pickNextExercise(currentExercise, available)` o `pickNextWithinTextGroup()`.
- Cambiar `handleNext()` para priorizar el mismo `text_group_id`.
- Renderizar titulo/fuente si existe.
- Mostrar indicador "Pregunta N de M sobre este texto" calculado desde `exercisePool`.

Impacto:

- El usuario puede leer un texto y contestar varias preguntas sin perder contexto.
- El random queda como fallback, no como comportamiento dominante cuando hay grupo.

### Etapa C - Test de primer slice

Archivos:

- Agregar/editar `src/components/practice/__tests__/lengua_integration.test.ts`.
- Opcional: agregar e2e en `tests/e2e/practice-textgroup.spec.ts`.

Validaciones:

- El loader carga un `TextGroup` y produce ejercicios con el mismo `text_group_id`.
- Todas las preguntas del grupo conservan `text`.
- El orden por `question_order` se conserva.
- La UI pasa de pregunta 1 a 2 del mismo grupo.

Impacto:

- Cierra el criterio minimo de lectura + preguntas.

### Etapa D - Adaptatividad intra-sesion para UI

Archivos:

- Modificar `src/app/practice/page.tsx`.
- Modificar `src/app/practice/PracticeQuestion.tsx`.
- Posiblemente crear `src/practice/session_selection.ts`.

Funciones:

- Crear una funcion compartida que convierta historial UI a `UserSkillState[]`.
- Crear server action o funcion pura `selectNextPracticeExercise(input)`.
- Reusar `selectNextExerciseDetailed()` con `usedExerciseIds`, `lastExerciseId`, `selectionGraph`.

Impacto:

- Reemplaza random fuera de grupos.
- Hace que la UI se acerque al comportamiento de `runSession()`.

### Etapa E - Unificar mastery

Archivos:

- Crear `src/practice/mastery.ts`.
- Modificar `src/app/practice/page.tsx`.
- Modificar `src/practice/session_runner.ts`.
- Modificar `src/practice/exercise_selector.ts`.

Funciones:

- Crear `computeMasteryFromAttempts({ attempts, correct, currentMastery?, difficulty? })`.
- Reemplazar `calculateUpdatedMastery()`, `computeMasteryLevel()` y `accuracyToMastery()` o hacer que deleguen.

Impacto:

- Reduce contradicciones entre UI, CLI y selector.
- Facilita usar progreso historico como señal real.

### Etapa F - Progreso y SessionContext

Archivos:

- Crear `src/practice/session_context.ts`.
- Modificar `src/storage/local_progress_store.ts`.
- Modificar `src/app/practice/page.tsx`.
- Modificar `src/app/practice/PracticeQuestion.tsx`.

Funciones/tipos:

- Crear `SessionContext`.
- Agregar `textGroupsWorked` opcional a `StoredProgress`.
- Guardar resultados por skill y por text group.

Impacto:

- Permite pausar/reanudar y medir textos trabajados.
- Ya no es necesario para el primer slice.

### Etapa G - Agentes operativos

Archivos:

- Crear `src/agents/product_guardian.ts`.
- Crear `src/agents/scope_rules_validator.ts`.
- Crear `src/agents/quality_auditor.ts`.
- Crear `src/agents/pipeline.ts`.
- Crear `scripts/validate-change.ts`.
- Modificar `package.json`.

Funciones:

- `classifyChange(proposal)`.
- `determineAgents(changeType, changedFiles?)`.
- `validateScope(proposal, parsedDocs)`.
- `auditQuality(changedFiles, diff)`.
- `runAgentPipeline(input)`.

Impacto:

- Pasa de protocolo documental a validacion ejecutable.
- Debe empezar como comando manual, no como hook bloqueante.

## Orden optimo recomendado

1. **TextGroup loader minimo**: bajo riesgo, valida datos.
2. **UI continuidad por texto**: valida el valor pedagogico central.
3. **Tests del slice**: fija comportamiento antes de refactors.
4. **Adaptatividad UI fuera de grupos**: reemplaza random general.
5. **Mastery unificado**: reduce deuda antes de usar progreso historico.
6. **SessionContext + progreso extendido**: solo cuando el flujo ya existe.
7. **Migracion de IDs legacy**: importante, pero no debe bloquear lectura.
8. **Agentes operativos**: puede correr en paralelo como herramienta de desarrollo.

## Reordenamiento frente a MiMo

Cambios propuestos:

- Mover migracion de IDs fuera del inicio. Es riesgosa por `data/progress.json` y dashboard.
- No exigir unificacion de mastery antes del primer TextGroup.
- Hacer `TextGroup` antes que adaptatividad completa, porque el problema de lectura es de continuidad contextual.
- Mantener agentes en paralelo porque no afectan runtime de practica.

## Primer slice implementable

Objetivo minimo:

> Un usuario abre `/practice`, lee un texto, responde al menos 3 preguntas asociadas al mismo texto, y el texto permanece visible durante esas preguntas.

Cambios minimos:

1. Agregar un JSON con `text_groups`.
2. `normalizeExerciseFile()` detecta `text_groups`.
3. Cada pregunta resultante tiene `text`, `text_group_id` y `question_order`.
4. `PracticeQuestion.handleNext()` busca el siguiente ejercicio del mismo `text_group_id`.
5. Tests confirman carga y continuidad.

Validacion:

- `npm run typecheck`
- Test de integracion de lengua, formalizando un script si hace falta.
- `npm run test:e2e` si se agrega e2e.

Nota: `package.json` no tiene script de unit tests; conviene agregar uno si se formalizan estos tests.

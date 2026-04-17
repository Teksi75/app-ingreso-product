# 07 - Plan ejecutable final

> Plan listo para implementar con Codex. Prioriza evidencia, cambios pequeños y checkpoints verificables.

## Objetivo del primer ciclo

Implementar el primer slice de lectura + multiples preguntas:

- Un texto compartido.
- Al menos 3 preguntas asociadas.
- El texto permanece visible.
- La sesion avanza por preguntas del mismo texto antes de cambiar de contexto.
- Sin migrar todo el sistema.

## Paso 1 - Preparar tipos y formato de datos

Prompt para Codex:

```text
Implementar soporte backward compatible para TextGroup.

Archivos objetivo:
- src/practice/session_runner.ts
- opcional: src/practice/types.ts
- docs/04_exercise_engine/lengua_textgroups_modulo1.json
- src/components/practice/__tests__/lengua_integration.test.ts

Requisitos:
- Agregar tipo TextGroup con id, title opcional, text, source opcional y exercises.
- Extender Exercise con text_group_id?, text_group_title?, question_order?.
- Extender normalizeExerciseFile para aceptar { text_groups: [...] } sin romper array, { exercises } ni { subskills }.
- Aplanar cada pregunta del grupo a Exercise con el mismo text y text_group_id.
- Crear un JSON minimo con 1 grupo y 3 preguntas.
- Agregar tests de carga: los 3 ejercicios comparten text_group_id, text y question_order.
- Mantener compatibilidad con los 231 ejercicios actuales.

No tocar dashboard, progress store ni mastery.
```

Checkpoint:

- El loader sigue cargando ejercicios existentes.
- El nuevo grupo aparece como ejercicios normales.
- `npm run typecheck` pasa.

## Paso 2 - UI de continuidad dentro del grupo

Prompt para Codex:

```text
Modificar PracticeQuestion para mantener continuidad de TextGroup.

Archivo objetivo:
- src/app/practice/PracticeQuestion.tsx

Requisitos:
- Crear helper pickNextExercise(currentExercise, available, exercisePool).
- Si currentExercise.text_group_id existe, elegir primero el siguiente ejercicio disponible del mismo grupo ordenado por question_order e id.
- Si no quedan ejercicios del grupo, usar el comportamiento global existente como fallback.
- Renderizar text_group_title si existe.
- Mostrar indicador de pregunta dentro del texto: "Pregunta X de Y sobre este texto".
- Mantener MAX_QUESTIONS y guardado actual sin cambios.
- No introducir SessionContext todavia.
```

Checkpoint:

- En un grupo de 3 preguntas, la UI avanza por esas 3 antes de salir.
- El texto sigue visible entre preguntas.
- El fallback sigue funcionando para ejercicios sin grupo.

## Paso 3 - Validacion de flujo

Prompt para Codex:

```text
Agregar validacion automatizada del flujo TextGroup.

Archivos objetivo:
- tests/e2e/practice-textgroup.spec.ts o test existente equivalente
- package.json si falta un script de test unitario adecuado

Requisitos:
- Cubrir que /practice muestra el texto compartido.
- Responder la primera pregunta.
- Avanzar a la segunda pregunta del mismo text_group_id.
- Verificar que el texto no desaparece.
- Ejecutar typecheck y el test agregado.
```

Checkpoint:

- `npm run typecheck` pasa.
- Test de continuidad pasa.
- No se rompe `tests/e2e/dashboard-progress.spec.ts`.

## Paso 4 - Reemplazar random global por selector adaptativo

Prompt para Codex:

```text
Hacer que la UI use selectNextExerciseDetailed como fallback adaptativo fuera de TextGroup.

Archivos objetivo:
- src/app/practice/PracticeQuestion.tsx
- src/app/practice/page.tsx
- opcional: src/practice/session_selection.ts

Requisitos:
- Mantener la prioridad de preguntas del mismo text_group_id.
- Para el fallback global, construir historial de respuestas de la sesion actual.
- Convertir historial a UserSkillState[] compatible con exercise_selector.
- Invocar selectNextExerciseDetailed con usedExerciseIds y lastExerciseId.
- Exponer ruleApplied para debug solo si no afecta UX.
- Eliminar uso pedagogico de Math.random en PracticeQuestion.
```

Checkpoint:

- Al fallar una pregunta sin grupo, la siguiente seleccion respeta Regla A cuando hay candidato.
- `PracticeQuestion.tsx` ya no usa `Math.random()` para seleccion pedagogica.

## Paso 5 - Unificar mastery

Prompt para Codex:

```text
Unificar calculo de mastery en un modulo comun.

Archivos objetivo:
- src/practice/mastery.ts
- src/app/practice/page.tsx
- src/practice/session_runner.ts
- src/practice/exercise_selector.ts

Requisitos:
- Crear funciones puras con tests.
- Reemplazar calculos duplicados o hacer que deleguen al modulo comun.
- Mantener comportamiento actual salvo donde exista contradiccion documentada.
- Documentar una unica regla de mastery.
```

Checkpoint:

- Typecheck.
- Tests de selector y carga.
- No cambia el schema de `progress.json`.

## Paso 6 - Persistencia de grupos y SessionContext

Prompt para Codex:

```text
Introducir SessionContext y progreso por TextGroup.

Archivos objetivo:
- src/practice/session_context.ts
- src/storage/local_progress_store.ts
- src/app/practice/page.tsx
- src/app/practice/PracticeQuestion.tsx

Requisitos:
- Crear SessionContext serializable.
- Agregar textGroupsWorked? a StoredProgress con migracion backward compatible.
- Guardar grupos completados al final de sesion.
- No implementar pausa/reanudar en este paso salvo que sea trivial.
```

Checkpoint:

- `data/progress.json` viejo carga sin error.
- Una sesion con TextGroup guarda metadata del grupo.

## Paso 7 - Primer agente operativo

Prompt para Codex:

```text
Crear Product Guardian ejecutable como CLI manual.

Archivos objetivo:
- src/agents/product_guardian.ts
- src/agents/pipeline.ts
- scripts/validate-change.ts
- package.json

Requisitos:
- npm run validate-change -- "descripcion del cambio"
- Clasificar cambio.
- Activar Quality Auditor si toca src/app/practice, src/practice o src/storage.
- Activar Scope & Rules Validator si toca docs/04_exercise_engine o cambia alcance.
- Devolver JSON y resumen legible.
- No agregar pre-commit todavia.
```

Checkpoint:

- Comando manual devuelve `changeType`, `agentsToRun` y `riskLevel`.
- No afecta build ni runtime.

## Orden de ejecucion recomendado

1. TextGroup loader.
2. UI de continuidad.
3. Test de flujo.
4. Selector adaptativo como fallback.
5. Mastery comun.
6. SessionContext/progreso.
7. Agente operativo.

## Checks obligatorios por ciclo

- `npm run typecheck`
- Test de integracion de carga/selector.
- E2E de practica si se modifica UI.
- Revision manual de `data/progress.json` solo si se toca persistencia.

## Criterio de exito final

Al terminar el primer ciclo, debe poder demostrarse:

- Que MiMo tenia razon sobre la ausencia de contexto compartido.
- Que el sistema ya soporta un texto con multiples preguntas.
- Que el random dejo de romper la continuidad del texto.
- Que el cambio fue compatible con ejercicios existentes.
- Que la ruta hacia agentes operativos empieza por CLI verificable, no por documentacion adicional.

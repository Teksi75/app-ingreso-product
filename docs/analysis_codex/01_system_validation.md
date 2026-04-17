# 01 - Validacion del sistema

> Validacion Codex contra codigo real. Fuentes MiMo: `docs/analysis/01_system_model.md` y `docs/analysis/02_architecture_analysis.md`.

## Veredicto ejecutivo

El analisis de MiMo es mayormente correcto para el flujo principal de UI: la app es un motor de ejercicios con adaptatividad inicial y seleccion aleatoria durante la sesion. Hay una salvedad importante: el runner CLI (`runSession`) si usa `selectNextExerciseDetailed()` en cada paso, por lo que la afirmacion "la adaptatividad solo opera al inicio" aplica al flujo web `/practice`, no a todo el codigo.

## Evidencia del flujo real de sesion

Confirmado:

- `/practice` ejecuta `startPracticeSession()` desde el server component: `src/app/practice/page.tsx:42-50`.
- `startPracticeSession()` carga grafo y ejercicios, filtra por skill, selecciona un ejercicio inicial con `selectNextExerciseDetailed()` y marca la skill como vista: `src/practice/session_runner.ts:395-440`.
- La UI cliente mantiene la sesion completa con `useState`: ejercicio actual, usados, contador, aciertos y estado de guardado: `src/app/practice/PracticeQuestion.tsx:31-46`.
- Al finalizar, la UI llama una server action (`savePracticeSessionProgress`) que calcula mastery, guarda `progress.json` y recomienda siguiente subskill: `src/app/practice/page.tsx:102-143`.
- La respuesta se evalua por igualdad estricta contra `correct_answer`: `src/app/practice/PracticeQuestion.tsx:43-44` y `src/practice/session_runner.ts:194-196`.

Matiz / correccion:

- MiMo describe `used` en URL como estado de sesion que recarga el server component en cada navegacion. En el flujo actual, la navegacion entre preguntas no recarga `/practice`: ocurre dentro del componente cliente via `handleNext()`. El parametro `used` aparece para reinicio/repeticion/recomendacion (`buildPracticeHref`), no para cada siguiente pregunta: `src/app/practice/PracticeQuestion.tsx:293-304`.

## Como se seleccionan ejercicios

### Flujo web `/practice`

1. Seleccion inicial: `startPracticeSession()` llama a `selectNextExerciseDetailed(selectionPool, [], options)`: `src/practice/session_runner.ts:420-429`.
2. Durante la sesion: `handleNext()` llama `pickExercise(available)`: `src/app/practice/PracticeQuestion.tsx:107`.
3. `pickExercise()` usa `Math.random()`: `src/app/practice/PracticeQuestion.tsx:306-308`.

Esto confirma la inconsistencia central: el selector adaptativo gobierna el arranque, pero no gobierna las preguntas 2-N del flujo web.

### Runner CLI / simulacion interna

El runner puro `runSession()` si ejecuta el selector adaptativo en cada paso:

- Mantiene `history`, `usedExerciseIds`, `coveredSkills` y `userState`: `src/practice/session_runner.ts:272-276`.
- Define `selectNext()` que invoca `selectNextExerciseDetailed()` con `masteryBySkill`, `lastExerciseId` y `usedExerciseIds`: `src/practice/session_runner.ts:288-297`.
- Reconstruye `userState` despues de cada respuesta: `src/practice/session_runner.ts:340`.
- Selecciona nuevamente si quedan pasos: `src/practice/session_runner.ts:342-346`.

Decision de validacion: MiMo debe decir "adaptatividad limitada en la UI principal", no "en todo el sistema".

## Adaptatividad real

Confirmado como limitada:

- `selectNextExerciseDetailed()` tiene reglas A-E y filtros reales: `src/practice/exercise_selector.ts:230-269`.
- Las reglas A-D dependen de `UserSkillState[]`; si `userState.length === 0`, cae en exploracion / menor mastery gap: `src/practice/exercise_selector.ts:250-254`.
- En `startPracticeSession()`, se pasa `userState` vacio: `src/practice/session_runner.ts:420-423`.
- El progreso acumulado se usa para `seenSkills`, no para construir `UserSkillState`: `src/practice/session_runner.ts:410-418`.
- La recomendacion post-sesion si lee mastery almacenado, pero ocurre despues de terminar la sesion: `src/app/practice/page.tsx:133-143` y `src/app/practice/page.tsx:178-186`.

Parcialmente resuelto:

- El CLI `runSession()` si tiene adaptatividad intra-sesion.
- El selector no es random: usa orden deterministico (`pickDeterministic`) y reglas: `src/practice/exercise_selector.ts:720-722`.
- Hay tests que validan seleccion por prerequisitos y relaciones: `src/components/practice/__tests__/lengua_integration.test.ts:117-186`.

## Uso de random

Confirmado como dominante en UI principal despues del primer ejercicio:

- `PracticeQuestion.pickExercise()` usa `Math.random()` para el siguiente ejercicio: `src/app/practice/PracticeQuestion.tsx:306-308`.

No dominante en todo el sistema:

- `exercise_selector.ts` no usa `Math.random()` para seleccionar; usa sorting deterministico.
- El simulador usa random por diseño para simular respuestas, shuffle y tiempos: `src/practice/simulator_runner.ts:134-146` y `src/practice/simulator_runner.ts:245-262`.
- `local_progress_store.ts` usa random solo para sufijo de id de sesion: `src/storage/local_progress_store.ts:126-128`; no afecta pedagogia.

## Contradicciones detectadas

- MiMo acierta al señalar que la UI principal no usa el motor adaptativo durante la sesion.
- MiMo omite que `runSession()` si implementa ese comportamiento correctamente para CLI/pruebas.
- MiMo exagera el rol del estado en URL: no es el mecanismo central intra-sesion.
- MiMo acierta en que el progreso persistido no alimenta la seleccion inicial salvo `seenSkills`.

## Decision implementable

El primer arreglo no debe ser una reescritura completa. Conviene extraer una funcion compartida de seleccion siguiente que pueda correr en cliente o server action y que use:

- `exercisePool`
- `usedExerciseIds`
- historial de respuestas de la sesion
- `selectNextExerciseDetailed()`

Pero para lectura + preguntas, la prioridad practica es introducir agrupacion por texto y hacer que `handleNext()` priorice ejercicios del mismo grupo antes de volver a seleccion adaptativa global.

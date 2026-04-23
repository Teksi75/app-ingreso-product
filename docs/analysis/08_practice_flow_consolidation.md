# Consolidacion Del Flujo De Practica

## Estado anterior

- `src/app/practice/page.tsx` iniciaba la sesion, recalculaba mastery, escribia progreso local y resolvia la recomendacion siguiente.
- `src/app/practice/PracticeQuestion.tsx` elegia el proximo ejercicio en cliente con `pickExercise()` sobre el pool disponible.
- `src/practice/session_runner.ts` resolvia solo la seleccion inicial y el armado de pools.
- `src/practice/exercise_selector.ts` concentraba la logica de seleccion, pero desde `src/components/practice/exercise_selector.ts` tambien se colgaban responsabilidades de mapa de mastery y recomendacion.
- `src/app/dashboard/page.tsx` derivaba su propio resumen de progreso con una logica separada de la usada por practica.

## Auditoria de dependencias reales

- `src/app/practice/page.tsx` dependia de `session_runner` para abrir la sesion, de `exercise_selector` para `getLenguaMasteryMap()` y `recommendNextSubskill()`, y de `local_progress_store` para leer/escribir progreso.
- `src/app/practice/PracticeQuestion.tsx` dependia de `page.tsx` para tipos y para la accion `saveProgress`, pero ademas tomaba una decision de negocio propia: seleccionar el siguiente ejercicio.
- `src/practice/session_runner.ts` dependia de `exercise_selector.ts` para la seleccion y de `local_progress_store.ts` solo para `seenSkills`, sin usar el mastery acumulado como entrada de seleccion.
- `src/storage/local_progress_store.ts` persistia bien las sesiones, pero no exponia un snapshot reutilizable para gobernar el flujo.
- `src/app/dashboard/page.tsx` calculaba skills debiles y stats a partir de sesiones en una ruta separada del flujo de practica.

## Problema detectado

- Habia dos cerebros del flujo: `session_runner` para la seleccion inicial y `PracticeQuestion`/`page.tsx` para la continuidad y el cierre.
- `exercise_selector` quedaba mezclado con responsabilidades que no eran de seleccion pura.
- El progreso local participaba al final del flujo, pero no como entrada real para planificar una sesion nueva.
- Dashboard y practica consumian el mismo almacenamiento con derivaciones distintas, lo que hacia mas dificil leer un estado canonico del sistema.

## Solucion aplicada

### 1. `session_runner` como orquestador canonico

- `session_runner` ahora expone el estado y las operaciones canonicas del flujo:
  - `startPracticeSession()`
  - `startReadingUnitSession()`
  - `savePracticeSessionProgress()`
  - `getLenguaMasteryMap()`
  - `recommendNextPracticeSubskill()`
- La sesion ya no entrega solo un primer ejercicio: entrega `sessionExercises`, una secuencia planificada por el runner usando `exercise_selector`.

### 2. `exercise_selector` reducido a seleccion

- `src/components/practice/exercise_selector.ts` quedo como reexport puro del selector.
- La recomendacion de siguiente subskill y la lectura del mapa de mastery salieron de ese wrapper y quedaron dentro del runner, donde pertenecen como parte de la orquestacion.

### 3. Progreso local integrado como entrada explicita

- `local_progress_store.ts` ahora expone `getPracticeProgressSnapshot()`.
- Ese snapshot concentra:
  - `seenSkills`
  - `masteryByFocus`
  - `practiceSkillStats`
- `session_runner` usa ese snapshot al planificar una sesion para alimentar `seenSkills` y `masteryBySkill` del selector.
- `savePracticeSessionProgress()` persiste la sesion y luego recalcula la recomendacion usando el progreso ya actualizado.

### 4. `PracticeQuestion` sin decisiones de negocio del runner

- Se elimino la seleccion aleatoria local con `pickExercise()`.
- El componente ahora solo consume `sessionExercises` y avanza por indice.
- La logica de cierre sigue en UI, pero la persistencia y la recomendacion ya no viven en `page.tsx` ni en el cliente.

### 5. Dashboard y practica apoyados en la misma logica de estado

- `dashboard/page.tsx` ahora consume `getPracticeProgressSnapshot()` y `getWeakestPracticeSkillId()` desde `local_progress_store.ts`.
- Con esto, dashboard y practica leen el mismo snapshot derivado del progreso persistido.

## Alcance y limites de esta fase

- No se rediseño la UI.
- No se agregaron dependencias.
- No se reescribio el motor completo.
- La secuencia de una sesion ahora queda gobernada por el runner, pero sigue siendo una planificacion previa a la sesion; todavia no hay replanificacion adaptativa pregunta a pregunta en funcion del resultado inmediato.

## Pendientes de la siguiente fase

- Unificar en un tipo canonico el estado acumulado de practica y lectura para evitar duplicidad semantica entre skill, subskill y reading unit.
- Llevar la recomendacion de siguiente foco a una API de dominio mas explicita, separada de la UI.
- Evaluar una sesion verdaderamente adaptativa paso a paso si el producto necesita que el siguiente ejercicio responda al resultado recien obtenido.
- Revisar si `dashboard` debe sugerir tambien continuidad por subskill, no solo por skill.

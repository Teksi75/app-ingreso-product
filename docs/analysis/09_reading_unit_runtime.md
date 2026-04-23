# ReadingUnit Como Runtime Canonico

## Estado auditado

- `src/types/reading_unit.ts` ya definia bien el objeto `ReadingUnit` como texto base con metadata editorial.
- `content/lengua/reading_units/*.json` y `content/lengua/exercises/*.json` ya contenian pares coherentes de texto + actividades asociadas.
- `src/practice/session_runner.ts` cargaba los `ReadingUnit` y los inyectaba dentro de cada ejercicio, pero la sesion seguia modelada como una lista de ejercicios con `reading_unit` opcional.
- `src/practice/reading_session.ts` no existia; el repo tenia `src/practice/reading_session_runner.ts` como runtime paralelo y simplificado.
- `src/app/practice/page.tsx` y `PracticeQuestion.tsx` consumian la lectura de manera implicita desde `currentExercise.reading_unit`.

## Problema detectado

- `ReadingUnit` existia en datos y UI, pero no como entidad de primer nivel del flujo.
- Habia dos runtimes de lectura: uno dentro de `session_runner` y otro en `reading_session_runner.ts`.
- El texto base dependia del ejercicio actual, cuando en realidad debe gobernar una sesion completa de lectura.
- No quedaba una distincion canonica entre sesiones `reading-based` y sesiones de ejercicios standalone.

## Flujo canonico definido

### Sesion reading-based

1. Inicio de `ReadingUnit`
2. Visualizacion del texto base canonico
3. Bloque ordenado de ejercicios asociados al mismo `ReadingUnit`
4. Cierre con resumen minimo y persistencia compatible en progreso local

### Sesion standalone

1. Inicio desde skill/subskill
2. Seleccion de ejercicios sueltos por `exercise_selector`
3. Cierre con resumen minimo y persistencia en modo `practice`

## Solucion aplicada

- `session_runner` ahora devuelve una sesion canonica con:
  - `mode`
  - `sessionType`
  - `sessionTitle`
  - `readingUnit?`
  - `sessionExercises`
- `sessionType` distingue explicitamente:
  - `reading-based`
  - `standalone-exercises`
- Las sesiones `reading-based` usan un bloque ordenado de actividades asociadas al texto, en vez de seleccionar cada paso como si fueran ejercicios aislados.
- `savePracticeSessionProgress()` ahora persiste:
  - `mode: "reading"` para sesiones `reading-based`
  - `mode: "practice"` para sesiones standalone
- Se creo `src/practice/reading_session.ts` como fachada minima sobre el flujo canonico de `session_runner`.
- `src/practice/reading_session_runner.ts` quedo como reexport del nuevo modulo para no romper imports existentes.

## Impacto en UI

- `PracticeQuestion` ya no decide si hay lectura mirando el ejercicio como fuente canonica.
- La UI consume la sesion y renderiza el texto base desde `session.readingUnit` cuando `sessionType === "reading-based"`.
- La diferencia de flujo queda en el contrato del runner, no en decisiones de negocio dentro del componente.

## Compatibilidad

- La practica standalone actual sigue funcionando.
- El progreso local sigue usando el mismo modelo de sesiones y `skill_results`.
- Dashboard mantiene compatibilidad porque sigue leyendo snapshots derivados del store; las sesiones reading-based quedan registradas en `mode: "reading"`.

## Pendientes de la siguiente fase

- Modelar un resumen de cierre mas expresivo para lectura, separado del entrenamiento por skill.
- Incorporar una portada o etapa de introduccion previa a la primera actividad si el producto la necesita.
- Evaluar si los reading blocks deben admitir variantes por modulo o dificultad sin perder el `ReadingUnit` como objeto canonico.

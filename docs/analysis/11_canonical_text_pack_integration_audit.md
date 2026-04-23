# Auditoria De Integracion Del Canonical Text Pack

## Alcance

Se audito la integracion del canonical text pack de Lengua contra carga estatica, runtime de practica, recommendation, mastery/progress, dashboard, practice y tests asociados.

## Correctamente integrado

1. Los 5 archivos en `content/lengua/reading_units/` y sus 5 archivos en `content/lengua/exercises/` son cargados por `loadContentLenguaExercises()` y quedan fusionados con el resto del dataset en `loadLenguaExercises()`.
2. `src/data/static_content.ts` incluye los reading units y exercise files canonicos, por lo que tambien quedan disponibles cuando no hay acceso directo al filesystem.
3. Cada reading unit tiene ejercicios utilizables, con ids consistentes y mapeo a `lengua.skill_*` y `lengua.skill_*.subskill_*` validos para selector, recommendation y mastery.
4. `getReadingUnitCandidates()`, `pickReadingUnitCandidate()` y `startReadingUnitSession()` priorizan contenido `original_interno`, asi que el pack canonico es descubrible y seleccionable por el runtime real.
5. `src/app/dashboard/page.tsx`, `src/app/practice/page.tsx`, `src/app/page.tsx` y `src/app/habilidades/page.tsx` ya consumen el runtime actual y no dependen de placeholders ni de un `readingUnitId` hardcodeado.

## Que estaba aislado

1. La persistencia de progreso de una sesion `reading-based` guardaba toda la sesion solo contra el `skill/subskill` del ultimo ejercicio respondido.
2. Eso hacia que un texto con ejercicios repartidos en varias skills o subskills del pack canonico impactara en mastery de forma parcial y sesgada, aunque recommendation y practice ya estuvieran usando correctamente el reading unit.

## Correcciones aplicadas

1. `src/app/practice/PracticeQuestion.tsx` ahora agrega resultados por subskill a lo largo de toda la sesion antes de persistirla.
2. `src/practice/session_runner.ts` ahora acepta `focusResults` en `savePracticeSessionProgress()` y construye `skill_results` agregados tanto por skill como por subskill.
3. Con eso, una sesion reading-based del pack canonico conserva `mode: "reading"`, `readingUnitId` y el impacto real multi-skill sobre mastery/progress.
4. Se agrego `src/practice/session_progress.test.ts` para cubrir la persistencia reading-based multi-skill y su reflejo en `buildMasteryModel()`.

## Pendientes

1. Los reading units legacy de `docs/04_exercise_engine/lengua_reading_units_v1.json` siguen coexistiendo; no se removieron para no redisenar cobertura historica.
2. El pack canonico sigue teniendo cobertura minima por texto en algunos casos; la integracion ya es activa, pero la amplitud pedagogica todavia es limitada.

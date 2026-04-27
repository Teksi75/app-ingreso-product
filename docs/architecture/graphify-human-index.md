# Graphify Human Index

Este documento es una capa humana sobre los artefactos generados por Graphify.
No reemplaza a `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md` ni `graphify-out/wiki/`.

Objetivo:
- Dar nombres significativos a las comunidades detectadas.
- Mantener los IDs originales `Community_N` para que una IA pueda volver al grafo exacto.
- Separar lectura humana de salida generada, evitando editar archivos que `graphify update .` puede regenerar.

Fuente usada:
- `graphify-out/GRAPH_REPORT.md`, generado el 2026-04-26.
- `graphify-out/graph.json`, generado el 2026-04-26.
- `graphify-out/wiki/`, generado el 2026-04-16, usado solo como apoyo cuando coincide semanticamente.

## Como usar este archivo

Para una persona:
- Empezar por "Mapa rapido".
- Ir a la comunidad semantica segun la pregunta.
- Abrir los archivos principales listados.

Para una IA:
- Usar el nombre humano como orientacion.
- Usar `Graphify ID` para consultar `graphify-out/graph.json`.
- Verificar relaciones inferidas en `GRAPH_REPORT.md` antes de tratarlas como hechos.

## Mapa rapido

| Area humana | Graphify ID | Cuando mirarla |
| --- | --- | --- |
| Motor de sesiones de practica y lectura | Community 0 | Cambios en sesiones, lectura guiada, normalizacion de ejercicios, calculo de resultados |
| Selector adaptativo y reporte de datos | Community 1 | Cambios en seleccion de ejercicios, reglas adaptativas, ruta `/reporte/datos` |
| Integracion de contenido de Lengua | Community 2 | Validar JSON de Lengua, prerequisitos, relaciones entre skills y lectura |
| Simulador y evaluacion de simulaciones | Community 3 | Cambios en simulaciones, bloques, puntaje y resultados por habilidad |
| Persistencia de progreso y runtime async | Community 4 | Guardado/carga de progreso, Redis/local, dashboard de habilidades |
| Dashboard principal y recomendacion de siguiente paso | Community 5 | Home, recomendaciones, candidatos de lectura, CTA de practica |
| Modelo de mastery y resumen de progreso | Community 6 | Calculo de dominio, habilidad mas debil, resumen semanal |
| Identidad visual de alumno y navegacion lateral | Community 7 | Avatar, nombre de alumno, perfil local, sidebar |
| Identidad por codigo y rutas con progreso | Community 8 | `progressCode`, enlaces preservando alumno, paginas practica/simulacion |
| UI de pregunta de practica | Community 9 | Interaccion dentro de una pregunta, respuestas, glosario |
| Navegacion inferior mobile | Community 10 | Bottom nav y preservacion de codigo en mobile |
| E2E de fortalecimiento pedagogico gradual | Community 11 | Tests de avance por etapas y datos de progreso sinteticos |
| Manifest de contenido | Community 12 | Build de indice de contenido desde JSON |
| Analisis de patrones textuales | Community 13 | Extraccion de formas textuales sin copiar fuentes |
| E2E de refuerzo adaptativo | Community 14 | Tests de habilidad debil y consolidacion |
| E2E de auditoria UI de habilidad debil | Community 15 | Tests visuales/funcionales de UI de habilidad debil |
| Perfil de estudiante | Community 16 | Pantalla de perfil, preferencias y reset |
| Middleware e identidad inicial | Community 17 | Creacion/normalizacion temprana de codigo de progreso |
| UI de pregunta de simulador | Community 18 | Interaccion dentro de simulaciones |
| Calidad de contenido | Community 19 | Tests de strings y contenido generado |
| Tests de recomendacion de siguiente paso | Community 20 | Reglas de recomendacion aisladas |
| Comunidades finas o ruido estructural | Community 21-52 | Componentes aislados, configs y specs sueltas |

## Comunidades principales

### Motor de sesiones de practica y lectura

Graphify ID: `Community 0`

Responsabilidad humana:
Coordina sesiones de practica y lectura: carga contenido, normaliza ejercicios, arma bloques, evalua respuestas y calcula resultados de sesion.

Nodos clave:
- `loadContentLenguaExercises()`
- `normalizeExercise()`
- `startPracticeSession()`
- `startReadingUnitSession()`
- `buildSessionSkillResults()`
- `calculateUpdatedMastery()`

Archivos principales:
- `src/data/static_content.ts`
- `src/practice/session_runner.ts`
- `src/practice/session_progress.test.ts`

Riesgo tipico:
Cambiar esta zona puede afectar practica, lectura, mastery y persistencia al mismo tiempo.

### Selector adaptativo y reporte de datos

Graphify ID: `Community 1`

Responsabilidad humana:
Selecciona el proximo ejercicio segun reglas, mastery, prerequisitos y repeticion. Tambien aparece conectado con la ruta de reporte de datos, por lo que mezcla logica adaptativa con salida agregada.

Nodos clave:
- `GET()`
- `selectNextExerciseDetailed()`
- `selectNextExercise()`
- `normalizeSelectorExercise()`
- `resolveRuleTarget()`
- `filterImmediateRepeats()`
- `filterUnlockedExercises()`
- `findAlternativeSubskill()`

Archivos principales:
- `src/practice/exercise_selector.ts`
- `src/app/reporte/datos/route.ts`
- `src/components/practice/__tests__/lengua_integration.test.ts`

Atencion para IA:
`GRAPH_REPORT.md` marca varias relaciones inferidas alrededor de `GET()` y `selectNextExerciseDetailed()`. Antes de modificar esta zona, conviene verificar llamadas reales en codigo.

### Integracion de contenido de Lengua

Graphify ID: `Community 2`

Responsabilidad humana:
Valida que el contenido JSON de Lengua cargue, respete prerequisitos, use relaciones entre habilidades y pueda funcionar como practica y como lectura secuencial.

Nodos clave:
- `assertLoadsAllLenguaJson()`
- `assertSelectionRespectsPrerequisitesAndMastery()`
- `assertSessionRunnerUsesCrossRelationships()`
- `assertPracticeSessionsUseChoiceExercises()`
- `assertReadingUnitSessionsShareBaseTexts()`
- `assertReadingModeDatasetRunsSequentially()`

Archivos principales:
- `src/components/practice/__tests__/lengua_integration.test.ts`
- `docs/04_exercise_engine/*.json`
- `docs/04_exercise_engine/lengua_mastery_map.json`
- `docs/04_exercise_engine/lengua_skill_relationships.json`

Riesgo tipico:
Errores de contenido pueden parecer bugs de selector o session runner.

### Simulador y evaluacion de simulaciones

Graphify ID: `Community 3`

Responsabilidad humana:
Arma simulaciones, selecciona ejercicios, evalua bloques, calcula puntajes y genera resultados por habilidad.

Nodos clave:
- `startSimulatorSession()`
- `selectSimulatorSession()`
- `selectSimulatorExercises()`
- `evaluateSimulatorSession()`
- `buildSimulatorSkillResults()`
- `calculateScorePercentage()`

Archivos principales:
- `src/practice/simulator_runner.ts`
- `src/practice/simulator_runner.test.ts`

Riesgo tipico:
No confundir entrenamiento adaptativo con simulacion. La simulacion debe medir desempeno, no necesariamente optimizar practica.

### Persistencia de progreso y runtime async

Graphify ID: `Community 4`

Responsabilidad humana:
Carga y guarda progreso, crea sesiones, conecta dashboard/habilidades con almacenamiento local o Redis y expone variantes async del runtime.

Nodos clave:
- `loadProgress()`
- `loadProgressAsync()`
- `appendSessionResult()`
- `createEmptyProgress()`
- `createSessionId()`
- `getRedisClient()`
- `startPracticeSessionAsync()`
- `startReadingUnitSessionAsync()`
- `saveSimulatorSessionProgress()`

Archivos principales:
- `src/storage/local_progress_store.ts`
- `src/app/dashboard/page.tsx`
- `src/app/habilidades/page.tsx`
- `src/practice/session_runner.ts`
- `src/practice/simulator_runner.ts`

Riesgo tipico:
El progreso es una frontera compartida: cambios de schema afectan dashboard, reporte, practica, simulacion y tests E2E.

### Dashboard principal y recomendacion de siguiente paso

Graphify ID: `Community 5`

Responsabilidad humana:
Construye el home, calcula datos visibles, decide CTA/recomendacion y conecta practica con lectura disponible.

Nodos clave:
- `calculateDashboardData()`
- `getNextStepRecommendation()`
- `buildPracticeHref()`
- `buildReadingHref()`
- `pickReadingUnit()`
- `buildReadingUnitCandidates()`
- `getReadingUnitCandidates()`

Archivos principales:
- `src/app/page.tsx`
- `src/recommendation/*`
- `src/practice/session_runner.ts`
- `src/components/dashboard/SkillItem.tsx`

Atencion para IA:
`GRAPH_REPORT.md` marca conexiones inferidas entre `calculateDashboardData()`, `buildMasteryModel()`, `getWeakestPracticeSkillId()` y `loadProgress()`.

### Modelo de mastery y resumen de progreso

Graphify ID: `Community 6`

Responsabilidad humana:
Calcula dominio por habilidad, snapshots de practica, habilidad mas debil, score de mastery y resumen de avance para UI.

Nodos clave:
- `buildMasteryModel()`
- `buildPracticeProgressSnapshot()`
- `getWeakestSkillId()`
- `explainWeakestSkill()`
- `calculateMasteryScore()`
- `buildProgressSummary()`
- `buildWeeklyData()`

Archivos principales:
- `src/progress/mastery_model.ts`
- `src/app/progress_summary.ts`
- `src/storage/local_progress_store.ts`

Riesgo tipico:
Duplicar logica de mastery en UI o tests puede crear inconsistencias visibles para padres/alumnos.

### Identidad visual de alumno y navegacion lateral

Graphify ID: `Community 7`

Responsabilidad humana:
Componentes cliente que muestran identidad del alumno, avatar, nombre y navegacion lateral.

Nodos clave:
- `ClientAvatarBadge()`
- `ClientAvatarHero()`
- `ClientStudentName()`
- `SidebarNav()`
- `useProgressCodeFromLocation()`
- `createDefaultProfile()`

Archivos principales:
- `src/components/dashboard/ClientAvatarBadge.tsx`
- `src/components/dashboard/ClientAvatarHero.tsx`
- `src/components/dashboard/ClientStudentName.tsx`
- `src/components/ui/SidebarNav.tsx`
- `src/profile/*`

### Identidad por codigo y rutas con progreso

Graphify ID: `Community 8`

Responsabilidad humana:
Resuelve identidad del estudiante desde codigo de progreso y preserva ese codigo en enlaces de practica, simulacion y reinicio.

Nodos clave:
- `withProgressCode()`
- `resolveStudentIdentity()`
- `resolveStudentCode()`
- `normalizeProgressCode()`
- `PracticePage()`
- `SimulacionesPage()`
- `buildRestartHref()`

Archivos principales:
- `src/app/progress_code_href.ts`
- `src/app/student_identity.ts`
- `src/app/practice/page.tsx`
- `src/app/simulaciones/page.tsx`

Riesgo tipico:
Perder el `progressCode` rompe continuidad de progreso entre pantallas.

### UI de pregunta de practica

Graphify ID: `Community 9`

Responsabilidad humana:
Maneja la interaccion del alumno dentro de una pregunta de practica: seleccion de respuestas, partes multiples, categorias, submit, siguiente y glosario.

Nodos clave:
- `PracticeQuestion.tsx`
- `handleSubmit()`
- `handleAnswerChange()`
- `handleMultipleAnswerChange()`
- `handlePartAnswerChange()`
- `handleCategoryAnswerChange()`
- `handleGlossaryToggle()`

Archivo principal:
- `src/app/practice/PracticeQuestion.tsx`

### Navegacion inferior mobile

Graphify ID: `Community 10`

Responsabilidad humana:
Barra inferior mobile y preservacion de codigo de progreso en navegacion.

Nodos clave:
- `BottomNav()`
- `useProgressCodeFromLocation()`
- `HomeIcon()`
- `SkillsIcon()`
- `PracticeIcon()`
- `SimulatorIcon()`
- `ProgressIcon()`
- `ProfileIcon()`

Archivo principal:
- `src/components/ui/BottomNav.tsx`

## Tests y herramientas de soporte

### E2E de fortalecimiento pedagogico gradual

Graphify ID: `Community 11`

Responsabilidad humana:
Prueba escenarios de progreso gradual con sesiones sinteticas.

Archivo principal:
- `tests/e2e/pedagogical-gradual-skill-strengthening.spec.ts`

Nodos clave:
- `verifyStage()`
- `stableBaseSessions()`
- `readyBaseSessions()`
- `practiceSession()`
- `readingSession()`
- `writeProgress()`

### Manifest de contenido

Graphify ID: `Community 12`

Responsabilidad humana:
Genera el indice de contenido usado por build/runtime desde archivos JSON.

Archivo principal:
- `scripts/build-content-manifest.js`

Nodos clave:
- `buildContentIndex()`
- `generate()`
- `listJsonFiles()`
- `readJson()`
- `getExercises()`
- `getSkills()`

### Analisis de patrones textuales

Graphify ID: `Community 13`

Responsabilidad humana:
Extrae patrones estructurales de textos sin devolver texto fuente completo.

Archivos principales:
- `src/content_analysis/text_pattern_extractor.ts`
- `src/components/practice/__tests__/lengua_integration.test.ts`

Nodos clave:
- `extractTextPatterns()`
- `estimatePdfLength()`
- `analyzePlainTextShape()`
- `inferTextTypesFromShape()`
- `inferStructuresFromShape()`
- `assertTextPatternExtractorDoesNotReturnSourceText()`

### E2E de refuerzo adaptativo

Graphify ID: `Community 14`

Responsabilidad humana:
Prueba que el sistema refuerce habilidades debiles con progreso sintetico.

Archivo principal:
- `tests/e2e/adaptive-weak-skill-reinforcement.spec.ts`

### E2E de auditoria UI de habilidad debil

Graphify ID: `Community 15`

Responsabilidad humana:
Audita que la UI muestre correctamente la habilidad debil y su contexto.

Archivo principal:
- `tests/e2e/audit-weak-skill-ui.spec.ts`

### Calidad de contenido

Graphify ID: `Community 19`

Responsabilidad humana:
Tests de contenido generado, strings y archivos JSON.

Archivo principal:
- `src/content_analysis/content_quality.test.ts`

### Tests de recomendacion de siguiente paso

Graphify ID: `Community 20`

Responsabilidad humana:
Prueba la logica aislada de recomendacion de siguiente accion.

Archivo principal:
- `src/recommendation/__tests__/next_step.test.ts`

## UI y rutas aisladas

Estas comunidades son finas segun Graphify. No son inutiles, pero tienen poco valor como "clusters" arquitectonicos. Conviene tratarlas como componentes/rutas aisladas.

| Graphify ID | Nombre humano | Archivo |
| --- | --- | --- |
| Community 16 | Perfil de estudiante | `src/app/perfil/page.tsx` |
| Community 17 | Middleware e identidad inicial | `middleware.ts` |
| Community 18 | UI de pregunta de simulador | `src/app/simulaciones/SimulatorQuestion.tsx` |
| Community 21 | Root layout | `src/app/layout.tsx` |
| Community 22 | Header dashboard | `src/components/dashboard/Header.tsx` |
| Community 23 | Lista de habilidades | `src/components/dashboard/SkillList.tsx` |
| Community 24 | Estado de habilidad | `src/components/dashboard/SkillStatus.tsx` |
| Community 25 | Hero de avatar | `src/components/ui/AvatarHero.tsx` |
| Community 26 | Badge de racha | `src/components/ui/StreakBadge.tsx` |
| Community 27 | Barra de XP | `src/components/ui/XpBar.tsx` |
| Community 33 | Pagina de progreso | `src/app/progreso/page.tsx` |
| Community 34 | Pagina de reporte | `src/app/reporte/page.tsx` |
| Community 37 | Bento card UI | `src/components/ui/BentoCard.tsx` |
| Community 38 | Button UI | `src/components/ui/Button.tsx` |
| Community 39 | Barrel UI | `src/components/ui/index.ts` |
| Community 40 | Progress circle UI | `src/components/ui/ProgressCircle.tsx` |
| Community 41 | Skill card UI | `src/components/ui/SkillCard.tsx` |

## Configuracion y archivos aislados

| Graphify ID | Nombre humano | Archivo |
| --- | --- | --- |
| Community 28 | Tipos generados de Next | `next-env.d.ts` |
| Community 29 | Configuracion Next | `next.config.js` |
| Community 30 | Configuracion Playwright | `playwright.config.ts` |
| Community 31 | Configuracion PostCSS | `postcss.config.mjs` |
| Community 32 | Configuracion Vitest | `vitest.config.ts` |

## Duplicados o zonas a revisar

Estas comunidades sugieren posibles restos, wrappers o duplicaciones que conviene revisar antes de editar:

| Graphify ID | Observacion | Archivo |
| --- | --- | --- |
| Community 35 | `exercise_selector.ts` aparece aislado bajo `src/components/practice`, mientras el selector central esta en `src/practice/exercise_selector.ts` | `src/components/practice/exercise_selector.ts` |
| Community 36 | `session_runner.ts` aparece aislado bajo `src/components/practice`, mientras el runner central esta en `src/practice/session_runner.ts` | `src/components/practice/session_runner.ts` |
| Community 42 | Test aislado del selector | `src/practice/exercise_selector.test.ts` |
| Community 43 | Runner de lectura aislado | `src/practice/reading_session_runner.ts` |
| Community 44 | Test aislado de slugs | `src/skills/__tests__/skill_slugs.test.ts` |
| Community 45 | Tipo aislado de unidad de lectura | `src/types/reading_unit.ts` |

## Specs E2E aisladas

| Graphify ID | Archivo |
| --- | --- |
| Community 46 | `tests/e2e/all-pages.spec.ts` |
| Community 47 | `tests/e2e/dashboard-progress.spec.ts` |
| Community 48 | `tests/e2e/dashboard-responsive.spec.ts` |
| Community 49 | `tests/e2e/dashboard-screenshot.spec.ts` |
| Community 50 | `tests/e2e/first-experience.spec.ts` |
| Community 51 | `tests/e2e/lengua-practice-links.spec.ts` |
| Community 52 | `tests/e2e/student-profile-and-code.spec.ts` |

## Puentes importantes del grafo

Estos nodos tienen valor especial porque conectan varias comunidades:

- `GET()` en `src/app/reporte/datos/route.ts`: puente entre reporte, progreso, selector, slugs e identidad. Muchas conexiones son inferidas; verificar en codigo.
- `buildMasteryModel()` en `src/progress/mastery_model.ts`: puente entre dashboard, progreso y recomendacion.
- `startReadingUnitSession()` en `src/practice/session_runner.ts`: puente entre contenido, practica, lectura y persistencia.
- `loadContentLenguaExercises()` en `src/practice/session_runner.ts`: puente entre contenido JSON y runtime.
- `selectNextExerciseDetailed()` en `src/practice/exercise_selector.ts`: nucleo del selector adaptativo.

## Como decidir que abrir segun la pregunta

Si la pregunta es sobre seleccion adaptativa:
- Abrir `Community 1`.
- Leer `src/practice/exercise_selector.ts`.
- Revisar tests de `Community 2`, `Community 20` y `Community 42`.

Si la pregunta es sobre una sesion de practica o lectura:
- Abrir `Community 0`.
- Leer `src/practice/session_runner.ts`.
- Revisar persistencia en `Community 4`.

Si la pregunta es sobre progreso, dashboard o recomendaciones:
- Abrir `Community 5` y `Community 6`.
- Leer `src/app/page.tsx`, `src/progress/mastery_model.ts`, `src/app/progress_summary.ts`.
- Revisar almacenamiento en `Community 4`.

Si la pregunta es sobre identidad del alumno:
- Abrir `Community 8` y `Community 17`.
- Leer `src/app/student_identity.ts`, `src/app/progress_code_href.ts`, `middleware.ts`.

Si la pregunta es sobre simulaciones:
- Abrir `Community 3` y `Community 18`.
- Leer `src/practice/simulator_runner.ts`, `src/app/simulaciones/SimulatorQuestion.tsx`.

Si la pregunta es sobre contenido de Lengua:
- Abrir `Community 2`, `Community 12`, `Community 13`.
- Leer `docs/04_exercise_engine/` y los tests de integracion.

## Regla de mantenimiento

Despues de cambios relevantes en codigo:
- Ejecutar `graphify update .` segun `AGENTS.md`.
- No editar a mano `graphify-out/wiki/index.md` ni `graphify-out/wiki/Community_*.md`.
- Si cambian mucho las comunidades, actualizar este archivo con:
  - fecha del nuevo grafo,
  - IDs de comunidad,
  - nombres humanos,
  - archivos principales,
  - puentes importantes.


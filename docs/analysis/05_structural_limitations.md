# 05 — Limitaciones Profundas

> Auditoría sistémica global · Fase 5

---

## Limitaciones de Modelo (no bugs)

### L1: Ejercicio como unidad atómica absoluta

**Decisión de diseño**: Todo el sistema gira alrededor del ejercicio individual. No existe ninguna entidad de nivel superior (texto, bloque, escenario, contexto).

**Impacto**: Impide cualquier feature que requiera continuidad entre preguntas:
- Lectura de texto con preguntas múltiples
- Escenarios progresivos
- Preguntas que referencian respuestas anteriores
- Análisis comparativo entre ejercicios

**Ubicación**: `Exercise` type en `session_runner.ts:17-32`, `selectNextExerciseDetailed()` en `exercise_selector.ts:230`, `PracticeQuestion.tsx` (componente completo)

**Dificultad de cambio**: Muy alta. Requiere cambio de tipo de dato, formato JSON, selector, UI y persistencia.

---

### L2: Selección aleatoria reemplaza adaptatividad en runtime

**Decisión de diseño**: La lógica adaptativa de `exercise_selector.ts` (reglas A-E, 827 líneas) se usa SOLO para seleccionar el primer ejercicio de la sesión. Después, `PracticeQuestion.tsx:306` usa `pickExercise()` que es `Math.random()`.

**Impacto**: 
- Las reglas A-E (repetir tras error, subir dificultad, cambiar subskill) NO operan durante la sesión
- La adaptatividad es una ilusión: el primer ejercicio es inteligente, los siguientes son aleatorios
- El esfuerzo de diseño del selector no se capitaliza en la experiencia del usuario

**Ubicación**: `PracticeQuestion.tsx:306-308` vs `exercise_selector.ts:230-269`

**Dificultad de cambio**: Media. `handleNext()` debería llamar a `selectNextExerciseDetailed()` en vez de `pickExercise()`.

---

### L3: Estado del usuario sin memoria entre sesiones

**Decisión de diseño**: `UserSkillState[]` se construye desde cero en cada sesión con `buildUserState(history)`. No carga datos acumulados de `progress.json`.

**Impacto**:
- La sesión 50 trata al usuario igual que la sesión 1 (excepto por `seenSkills`)
- El mastery acumulado en `progress.json` no influye en la selección de ejercicios
- El sistema no "conoce" al usuario, cada sesión es un reinicio

**Evidencia**: `session_runner.ts:276` — `userState: UserSkillState[] = []` inicia vacío. `buildUserState()` solo usa `history` de la sesión actual.

**Dificultad de cambio**: Media. Cargar `progress.json` al inicio de sesión y mapear a `UserSkillState[]`.

---

### L4: Persistencia sin concurrencia ni atomicidad

**Decisión de diseño**: `local_progress_store.ts` usa `readFileSync` + `writeFileSync` sobre un archivo JSON plano.

**Impacto**:
- Dos sesiones simultáneas corromperían `progress.json`
- No hay transacciones: si el proceso falla durante la escritura, se pierden datos
- No hay versionado del schema
- No hay backups
- Escalable solo para uso individual en desarrollo

**Ubicación**: `local_progress_store.ts:39-48` (load), `121-124` (write)

**Dificultad de cambio**: Depende del nivel. Un simple file lock es fácil. Migrar a base de datos es mayor.

---

### L5: Doble sistema de IDs de skills

**Decisión de diseño**: Existen IDs legacy (`LEN-COMP-001`, `LEN-GRAM-002`, etc.) y IDs canónicos (`lengua.skill_1`, `lengua.skill_1.subskill_1`). El sistema mantiene un mapeo hardcodeado de 103 entradas.

**Impacto**:
- `progress.json` tiene datos con AMBOS formatos de ID (ver líneas 10-17 vs 109-132)
- El dashboard filtra solo por IDs canónicos (`canonicalDashboardSkills`), perdiendo datos legacy
- Agregar una skill nueva requiere tocar: JSON de mastery, JSON de relaciones, `LEGACY_SKILL_IDS`, `resolveKnownSubskill()`, `canonicalDashboardSkills`, `skill_metadata.ts`

**Ubicación**: `exercise_selector.ts:81-103` (LEGACY_SKILL_IDS), `exercise_selector.ts:756-782` (resolveKnownSubskill), `dashboard/page.tsx:33-41`

**Dificultad de cambio**: Alta. Requiere migración de datos existentes.

---

### L6: Arquitectura Next.js RSC con server actions acopladas

**Decisión de diseño**: `practice/page.tsx` es un async server component que carga datos con `fs.readFileSync` y define server actions inline.

**Impacto**:
- El componente server mezcla carga de datos, lógica de negocio y definición de acciones
- No hay separación clara entre capa de datos y capa de presentación
- Las server actions (`savePracticeSessionProgress`) están acopladas al componente
- Testing unitario de la lógica de negocio es difícil porque depende del framework

**Ubicación**: `practice/page.tsx:33` (async component), `:102` (server action)

**Dificultad de cambio**: Media. Extraer lógica a módulos independientes del framework.

---

### L7: Formato JSON de ejercicios inconsistente

**Decisión de diseño**: `normalizeExerciseFile()` maneja 3 formatos diferentes de JSON:

```typescript
// Formato 1: array directo
[{ id, skill, prompt, ... }]

// Formato 2: objeto con exercises
{ exercises: [{ id, skill, prompt, ... }] }

// Formato 3: objeto con subskills (más anidado)
{ subskills: [{ skill, canonical_subskill, exercises: [...] }] }
```

**Impacto**:
- Código de normalización complejo (160 líneas en `normalizeExerciseFile`)
- Detección de skill/subskill ambigua (múltiples campos posibles: `skill`, `skill_id`, `skill_name`, `canonical_subskill`, `subskill`)
- Feedback duplicado (`feedback_correct`, `feedback.correct`, `feedback.correcto`)
- Respuestas en múltiples formatos (string, array, object)

**Ubicación**: `session_runner.ts:125-160` (normalizeExerciseFile), `462-503` (normalizeCorrectAnswer)

**Dificultad de cambio**: Media. Estandarizar a un solo formato y migrar archivos.

---

### L8: Sin abstracción de sesión

**Decisión de diseño**: No existe un tipo `Session` en el sistema. La sesión es implícita:
- `PracticeQuestion.tsx` maneja estado de sesión con `useState` (questionCount, correctCount, usedExercises)
- `session_runner.ts` tiene `SessionResult` pero solo para CLI
- `local_progress_store.ts` guarda `SessionData` pero es solo para persistencia

**Impacto**:
- No se puede pausar/reanudar una sesión
- No se puede serializar el estado de una sesión en progreso
- No hay forma de compartir contexto de sesión entre componentes
- La sesión no tiene identificador visible hasta que se guarda

**Ubicación**: Ausente. Fragmentado entre `PracticeQuestion.tsx:32-39` (useState), `session_runner.ts:66-74` (SessionResult), `local_progress_store.ts:15-21` (SessionData)

**Dificultad de cambio**: Alta. Crear abstracción centralizada de sesión.

---

### L9: El simulador es un script sin UI

**Decisión de diseño**: `simulator_runner.ts` ejecuta `runSimulator()` al importar. No tiene componente React, no tiene rutas, no tiene UI.

**Impacto**:
- El simulador solo funciona por CLI (`node simulator_runner.ts`)
- Las respuestas son aleatorias (simulación de simulación)
- No hay integración con la app Next.js
- El modelo de simulación del documento (`docs/06_simulator/simulator_model.md`) no está implementado en la UI

**Ubicación**: `simulator_runner.ts:264` — `runSimulator()` se ejecuta inmediatamente

**Dificultad de cambio**: Alta. Crear componente UI, integrar con routing, manejar estado real del usuario.

---

### L10: Mastery calculado de forma primitiva

**Decisión de diseño**: El mastery se calcula con reglas simples:

```typescript
// practice/page.tsx:146-164
const accuracy = input.correct / input.attempts;
const delta = accuracy >= 0.8 ? 1 : accuracy < 0.5 ? -1 : 0;
const next = input.currentMastery + delta;
```

**Impacto**:
- Una sesión de 10 ejercicios con 8 correctos sube mastery 1 punto
- No considera dificultad de los ejercicios respondidos
- No considera historial acumulado
- No hay spaced repetition
- No hay decaimiento temporal (olvido)
- Dos cálculos de mastery diferentes: este en `practice/page.tsx` y otro en `session_runner.ts:247-252` con reglas diferentes

**Ubicación**: `practice/page.tsx:146-164` (UI), `session_runner.ts:247-252` (CLI), `exercise_selector.ts:582-587` (accuracyToMastery)

**Dificultad de cambio**: Media. Unificar los tres cálculos y diseñar algoritmo mejorado.

---

## Tabla resumen de limitaciones

| ID | Limitación | Severidad | Bloquea evolución |
|----|-----------|-----------|-------------------|
| L1 | Ejercicio como unidad atómica | Crítica | Sí — impide lectura + preguntas |
| L2 | Adaptatividad solo en primer ejercicio | Alta | Parcialmente |
| L3 | Sin memoria entre sesiones | Alta | Sí — impide personalización real |
| L4 | Persistencia sin concurrencia | Media | Solo en multi-usuario |
| L5 | Doble sistema de IDs | Media | Agregar skills nuevas |
| L6 | RSC acoplada a negocio | Media | Testing y refactor |
| L7 | JSON formatos inconsistentes | Baja | Mantenimiento |
| L8 | Sin abstracción de sesión | Alta | Sí — impide contexto compartido |
| L9 | Simulador sin UI | Media | Lanzamiento |
| L10 | Mastery primitivo | Media | Calidad de adaptatividad |

---

## Patrones que impiden evolución

### Patrón 1: Lógica de negocio embebida en componentes React

La lógica de selección de ejercicios, evaluación de respuestas y cálculo de mastery está distribuida entre `session_runner.ts` (Node.js puro) y `PracticeQuestion.tsx` (React client). No hay una capa de servicio intermedia.

### Patrón 2: Estado derivado de URL params

El estado de la sesión (used exercise IDs, skill focus) se serializa en la URL, forzando re-evaluaciones del server component en cada cambio.

### Patrón 3: Datos estáticos como dependencias directas

Los JSON de ejercicios y relaciones se leen directamente del filesystem con `fs.readFileSync`. No hay abstracción de acceso a datos que permita cambiar la fuente (DB, API, etc.).

### Patrón 4: Duplicación por compatibilidad

Los re-exports en `src/components/practice/` existen porque los imports de `PracticeQuestion.tsx` no pueden acceder directamente a `src/practice/` (diferente contexto de módulo). Esto crea indirección sin valor.

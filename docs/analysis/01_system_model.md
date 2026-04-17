# 01 — Modelo Mental del Sistema

> Auditoría sistémica global · Fase 1

---

## 1. Flujo Principal

### Diagrama lógico

```
[Usuario]
   │
   ▼
[HomePage /] ──────────────────────────────────────────────┐
   │                                                       │
   ├─ "Continuar entrenamiento" → /practice                │
   ├─ "Nuevo Alumno"            → /dashboard?newStudent=1  │
   └─ "Ver progreso"            → /dashboard               │
                                                              
[/practice]                                                  │
   │                                                         │
   ├─ startPracticeSession()                                 │
   │   ├─ loadLenguaExercises() ← JSON files (fs.readFileSync)│
   │   ├─ loadLenguaSelectionGraph() ← relaciones + mastery  │
   │   ├─ selectNextExerciseDetailed() ← reglas A-E          │
   │   └─ getSeenSkills() ← progress.json                   │
   │                                                         │
   ├─ <PracticeQuestion> (client component)                  │
   │   ├─ render exercise (text + prompt + options)          │
   │   ├─ user selects answer                                │
   │   ├─ submit → evaluate (answer === correct_answer)      │
   │   ├─ show feedback (correct/incorrect)                  │
   │   ├─ "Siguiente" → pickExercise(available)              │
   │   └─ repeat until MAX_QUESTIONS (10) or pool exhausted  │
   │                                                         │
   └─ session completed                                      │
       ├─ savePracticeSessionProgress() (server action)      │
       │   ├─ calculateUpdatedMastery()                      │
       │   ├─ saveSessionResult() → data/progress.json       │
       │   └─ recommendNextSubskill() → siguiente foco       │
       └─ show results                                       │
           ├─ "Repetir con variacion" (if mastery < 3)       │
           ├─ "Siguiente subskill recomendada"               │
           ├─ "Ver mapa de mastery completo"                 │
           └─ "Ver avance y progreso" → /dashboard           │

[/dashboard]
   │
   ├─ loadProgress() ← data/progress.json
   ├─ aggregate stats per skill (canonicalDashboardSkills)
   ├─ <SkillList> → <SkillItem> per skill
   ├─ <ActionPanel> → weakest skill suggested
   └─ links to /practice

[simulator_runner.ts] (standalone Node script, no UI)
   │
   ├─ load exercises
   ├─ selectSimulatorExercises() (round-robin by skill)
   ├─ simulate answers (random chance by difficulty)
   ├─ saveSessionResult() → data/progress.json
   └─ print results to console
```

### Secuencia detallada de una sesión práctica

1. **Entrada**: usuario navega a `/practice` (con o sin parámetros `skill`, `focus`, `used`, `newStudent`)
2. **Carga**: `startPracticeSession()` ejecuta en el servidor (Next.js RSC):
   - Lee archivos JSON de ejercicios desde `docs/04_exercise_engine/`
   - Carga el grafo de selección (relaciones entre skills + mastery map)
   - Filtra por skill si se especificó
   - Ejecuta `selectNextExerciseDetailed()` con reglas adaptativas
   - Marca skills como vistos en `progress.json`
3. **Render**: `PracticeQuestion` componente cliente recibe ejercicio + pool
4. **Loop de práctica** (10 iteraciones max):
   - Usuario lee texto/prompt, selecciona opción
   - Submit → comparación directa `answer === correct_answer`
   - Feedback inmediato (correct/incorrect con mensaje)
   - Click "Siguiente" → `pickExercise(available)` selección aleatoria del pool
5. **Cierre**: al completar las preguntas:
   - Server action `savePracticeSessionProgress()` calcula mastery
   - Guarda sesión en `data/progress.json`
   - Recomienda siguiente subskill basado en relaciones del grafo
6. **Post-sesión**: usuario decide repetir, avanzar a recomendación, o ver progreso

---

## 2. Tipo de Sistema

### Clasificación: Motor de ejercicios con adaptatividad reactiva básica

**No es un sistema adaptativo completo.** Es un motor de ejercicios con capas de adaptatividad limitadas.

### Evidencia del código

| Capa | Implementación | Limitación |
|------|---------------|------------|
| Selección de ejercicio | `selectNextExerciseDetailed()` con reglas A-E | Solo reacciona al último resultado, no a patrones acumulados en runtime |
| Mastery tracking | `computeMasteryLevel()` basado en accuracy + attempts | Calculado por sesión, no persiste entre sesiones dentro del runtime |
| Recomendación post-sesión | `recommendNextSubskill()` usa grafo de relaciones | Solo actúa al final de la sesión, no durante |
| Persistencia | `progress.json` acumula sesiones y stats | Solo lectura al inicio de sesión, no actualización en tiempo real |

### Reglas de adaptatividad (exercise_selector.ts)

```
Regla A: último resultado incorrecto → repetir misma skill, dificultad ≤ actual
Regla B: racha ≥ 2 + mastery recomendado → subir dificultad o skill relacionada
Regla C: accuracy ≥ 0.85 → cambiar a otra subskill de la misma skill
Regla D: accuracy < 0.6 o error recurrente → bajar dificultad
Regla E: exploración → skill no vista aún, por orden de unlock_points
```

**Problema**: Estas reglas operan sobre `UserSkillState[]` que se construye SOLO del historial de la sesión actual (`buildUserState(history)`). No lee el progreso acumulado en `progress.json` para tomar decisiones de selección dentro de la sesión.

### Justificación

El sistema es **híbrido con sesgo hacia motor de ejercicios**:
- **Motor de ejercicios**: la unidad operativa es ejercicio aislado, flujo lineal pregunta→respuesta→feedback→siguiente
- **Adaptatividad reactiva**: existe lógica de ajuste pero opera con alcance limitado (sesión actual)
- **No es sistema adaptativo completo**: falta contexto acumulado, modelo del usuario persistente, planificación de ruta de aprendizaje

---

## 3. Supuestos Implícitos

### Supuestos sobre el ejercicio

1. **Cada ejercicio es completamente independiente** — no hay texto compartido entre ejercicios, no hay contexto previo necesario para resolver el siguiente
2. **La respuesta correcta es siempre verificable por igualdad estricta** — `answer === exercise.correct_answer` (línea 196 de `session_runner.ts`)
3. **El ejercicio tiene exactamente una respuesta correcta** — no hay respuestas parcialmente correctas ni múltiples válidas
4. **Las opciones son strings comparables** — no hay respuestas compuestas complejas en la práctica real (solo en normalización)

### Supuestos sobre la sesión

5. **La sesión tiene duración fija de ~10 ejercicios** — `MAX_QUESTIONS = 10` en `PracticeQuestion.tsx:21`
6. **No hay contexto compartido entre preguntas de una misma sesión** — cada ejercicio se muestra aislado, el componente no mantiene memoria de respuestas anteriores más que el contador
7. **El usuario completa la sesión de una sentada** — no hay guardado intermedio de progreso parcial de sesión
8. **La navegación entre ejercicios es lineal y unidireccional** — no se puede volver a una pregunta anterior

### Supuestos sobre el usuario

9. **Un único usuario por navegador** — `progress.json` es un archivo compartido, no hay identificación de usuario
10. **El usuario interactúa directamente con la UI** — no hay API para consumo externo
11. **El usuario entiende el feedback en español** — todo el contenido está en español sin soporte i18n

### Supuestos sobre el contenido

12. **Los ejercicios están pre-generados en archivos JSON** — no hay generación dinámica de contenido
13. **La estructura de los JSON es conocida y estable** — `normalizeExerciseFile()` maneja 3 formatos distintos (array, {exercises}, {subskills})
14. **Los IDs de skills siguen el patrón `lengua.skill_N`** — hay un mapeo de legacy IDs (`LEGACY_SKILL_IDS`) para compatibilidad
15. **El grafo de selección es estático** — `lengua_skill_relationships.json` y `lengua_mastery_map.json` se cargan una vez y se cachean

### Supuestos sobre el almacenamiento

16. **El sistema tiene acceso al filesystem** — tanto `session_runner.ts` como `local_progress_store.ts` usan `node:fs`
17. **El archivo `progress.json` no es accedido concurrentemente** — no hay locks ni manejo de concurrencia
18. **Los datos caben en memoria** — `loadProgress()` carga todo el JSON completo

### Supuestos sobre el simulador

19. **El simulador es un script Node independiente** — `simulator_runner.ts` se ejecuta como `runSimulator()` al importar, sin UI
20. **Las respuestas del simulador son simuladas aleatoriamente** — no hay usuario real detrás

### Supuestos sobre la arquitectura

21. **Next.js RSC (React Server Components) para carga de datos** — `practice/page.tsx` es un async server component
22. **Los server actions persisten progreso** — `savePracticeSessionProgress` usa `"use server"`
23. **Los componentes de práctica están en dos ubicaciones** — `src/practice/` (lógica pura) y `src/components/practice/` (re-export + UI helpers), creando duplicación conceptual

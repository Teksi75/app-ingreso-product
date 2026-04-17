# 02 — Análisis Arquitectónico

> Auditoría sistémica global · Fase 2

---

## 1. Componentes Principales

### Mapa de componentes

```
src/
├── app/                          ← Next.js App Router (RSC + client)
│   ├── page.tsx                  ← Landing page (estática)
│   ├── layout.tsx                ← Layout raíz
│   ├── practice/
│   │   ├── page.tsx              ← Server Component: carga datos, inicia sesión
│   │   └── PracticeQuestion.tsx  ← Client Component: loop de interacción
│   └── dashboard/
│       └── page.tsx              ← Server Component: muestra progreso
│
├── practice/                     ← Lógica de negocio pura (Node.js)
│   ├── exercise_selector.ts     ← [NÚCLEO] Motor de selección adaptativa
│   ├── session_runner.ts        ← Orquestador de sesiones (CLI + API)
│   └── simulator_runner.ts      ← Simulador (script independiente)
│
├── components/
│   ├── practice/
│   │   ├── exercise_selector.ts  ← Re-export + tipos UI
│   │   └── session_runner.ts     ← Re-export de session_runner
│   └── dashboard/
│       ├── Header.tsx
│       ├── SkillList.tsx
│       ├── SkillItem.tsx
│       ├── SkillStatus.tsx
│       └── ActionPanel.tsx
│
├── storage/
│   └── local_progress_store.ts  ← Persistencia en JSON local
│
└── skills/
    └── skill_metadata.ts        ← Metadata estática de habilidades
```

### Responsabilidades por componente

| Componente | Responsabilidad | Tipo |
|-----------|----------------|------|
| `exercise_selector.ts` (src/practice/) | Selección adaptativa de ejercicios, reglas A-E, grafo de skills | Núcleo de negocio |
| `session_runner.ts` (src/practice/) | Carga de ejercicios, normalización, orquestación de sesiones CLI | Núcleo de negocio |
| `simulator_runner.ts` | Simulación automática con respuestas aleatorias | Herramienta auxiliar |
| `local_progress_store.ts` | CRUD sobre `data/progress.json` | Persistencia |
| `skill_metadata.ts` | Títulos y descripciones de skills | Datos estáticos |
| `PracticeQuestion.tsx` | Loop interactivo de práctica en navegador | UI cliente |
| `practice/page.tsx` | Punto de entrada RSC, conecta datos con UI | UI servidor |
| `dashboard/page.tsx` | Agregación de stats, visualización de progreso | UI servidor |
| `components/practice/exercise_selector.ts` | Re-export + tipos para UI (MasteryMapNode, RecommendedSubskill) | Puente UI |

---

## 2. Contratos Implícitos

### Estructuras de datos que gobiernan el sistema

#### Exercise (contrato central)

```typescript
// src/practice/session_runner.ts:17-32
type Exercise = {
  id: string;
  skill_id: string;           // "lengua.skill_N"
  subskill: string;           // "lengua.skill_N.subskill_M"
  difficulty: 1 | 2 | 3;
  mastery_level: 1 | 2 | 3 | 4;
  type: string;               // "multiple_choice", etc.
  text?: string;              // texto base del ejercicio
  prompt: string;             // consigna
  options: string[];          // opciones de respuesta
  correct_answer: string;     // respuesta exacta
  feedback_correct: string;
  feedback_incorrect: string;
  source_file?: string;
  related_skills: string[];
};
```

**Invariante**: `correct_answer` debe ser miembro de `options`. El sistema genera opciones si no existen (`ensureOptions()`).

#### UserSkillState (contrato de estado del usuario)

```typescript
// src/practice/exercise_selector.ts:8-16
type UserSkillState = {
  skill: string;
  subskill: string;
  accuracy: number;       // 0..1
  streak: number;         // racha de correctos
  attempts?: number;
  lastResult: "correct" | "incorrect";
  masteryLevel?: 1 | 2 | 3 | 4;
};
```

**Invariante**: se construye SOLO del historial de la sesión actual en `buildUserState()`. No se carga desde persistencia.

#### LenguaSelectionGraph (contrato del grafo)

```typescript
// src/practice/exercise_selector.ts:44-50
type LenguaSelectionGraph = {
  relationships: LenguaRelationship[];  // prerequisitos, secuenciales, refuerzo
  masteryMap: MasteryNode[];            // nodos con unlock_points
  masteryById: Map<string, MasteryNode>;
  skillNameToId: Map<string, string>;
  subskillNameToId: Map<string, string>;
};
```

**Invariante**: se cachea en memoria (`cachedGraph`). Se carga desde 2 JSON estáticos.

#### StoredProgress (contrato de persistencia)

```typescript
// src/storage/local_progress_store.ts:23-35
type StoredProgress = {
  sessions: Array<SessionData & { id: string; created_at: string }>;
  seenSkills?: string[];
  skill_stats: Record<string, {
    total_attempts: number;
    total_correct: number;
    last_state: SkillState;
    mastery_level?: number;
  }>;
};
```

**Invariante**: `seenSkills` se usa para la regla E de exploración (elegir skills no vistas). Se actualiza al inicio de cada ejercicio en `startPracticeSession()`.

### Contratos entre componentes

```
[practice/page.tsx]
  → startPracticeSession(skill, usedIds, options) → PracticeSelection
  → getLenguaMasteryMap() → MasteryMapNode[]
  → savePracticeSessionProgress(input) → PracticeSessionProgressResult

[PracticeQuestion.tsx]
  → exercise + exercisePool + masteryMap + usedExerciseIds
  → saveProgress(input) → {masteryLevel, recommendation}

[session_runner.ts]
  → loadLenguaExercises() → Exercise[]
  → loadLenguaSelectionGraph() → LenguaSelectionGraph
  → selectNextExerciseDetailed() → {exercise, ruleApplied}

[exercise_selector.ts]
  → LenguaSelectionGraph (JSON files)
  → UserSkillState[] (session-only)
  → SelectionOptions (seenSkills, usedIds, masteryBySkill)

[local_progress_store.ts]
  → data/progress.json (read/write)
  → loadProgress() / saveSessionResult() / markSkillsSeen()
```

---

## 3. Acoplamientos Críticos

### 3.1 Exercise Selector ↔ JSON estáticos

**Archivos**: `src/practice/exercise_selector.ts:76-79`

```typescript
const RELATIONSHIPS_FILE = "lengua_skill_relationships.json";
const MASTERY_FILE = "lengua_mastery_map.json";
```

**Problema**: El selector está fuertemente acoplado a archivos JSON específicos en `docs/04_exercise_engine/`. Cualquier cambio en la estructura de skills requiere modificar:
- 2 archivos JSON de configuración
- El mapeo de `LEGACY_SKILL_IDS` (103 entradas hardcodeadas)
- Las reglas de `resolveKnownSubskill()` (regex patterns)
- `canonicalDashboardSkills` en `dashboard/page.tsx`

**Rigidez**: Alta. Agregar una skill nueva toca múltiples archivos.

### 3.2 Practice Page ↔ Session Runner (duplicación)

**Problema**: Existen DOS `session_runner.ts`:
- `src/practice/session_runner.ts` (739 líneas) — lógica completa con `fs.readFileSync`
- `src/components/practice/session_runner.ts` (1 línea) — re-export

Y DOS `exercise_selector.ts`:
- `src/practice/exercise_selector.ts` (827 líneas) — lógica completa
- `src/components/practice/exercise_selector.ts` (140 líneas) — re-export + tipos UI

**Problema real**: La práctica en navegador (`PracticeQuestion.tsx`) NO usa `selectNextExerciseDetailed()` para la selección del siguiente ejercicio. Usa `pickExercise(available)` que es aleatoria:

```typescript
// PracticeQuestion.tsx:306-308
function pickExercise(exercises: Exercise[]): Exercise {
  return exercises[Math.floor(Math.random() * exercises.length)];
}
```

**Implicación**: Toda la lógica adaptativa de `exercise_selector.ts` (reglas A-E, grafo de relaciones, mastery gaps) se usa SOLO en `startPracticeSession()` para el primer ejercicio. Después, la selección es aleatoria.

### 3.3 Practice Page → URL params como estado

**Archivos**: `src/app/practice/page.tsx:33-39`

```typescript
const focus = Array.isArray(params.focus) ? params.focus[0] : params.focus;
const used = Array.isArray(params.used) ? params.used[0] : params.used;
const usedExerciseIds = parseUsedExerciseIds(used);
```

**Problema**: El estado de la sesión (qué ejercicios ya se vieron) se pasa por URL params. Esto:
- Limita la longitud de la sesión (URL max ~2000 chars)
- Expone el estado interno en la URL
- Hace que el componente server recargue completamente en cada navegación

### 3.4 Progress Store → Archivo JSON plano

**Archivos**: `src/storage/local_progress_store.ts:37`

```typescript
const progressPath = resolve(process.cwd(), "data/progress.json");
```

**Problema**:
- Sin concurrencia: dos sesiones simultáneas corromperían el archivo
- Sin queries: para obtener stats de una skill se carga TODO el JSON
- Sin respaldo: `writeFileSync` sobreescribe completo
- Sin migración: si cambia el schema, no hay mecanismo de upgrade
- Válido solo en servidor: los componentes cliente no pueden acceder directamente

### 3.5 Dashboard → Skills hardcodeadas

**Archivos**: `src/app/dashboard/page.tsx:33-41`

```typescript
const canonicalDashboardSkills = [
  "lengua.skill_1",
  "lengua.skill_2",
  // ... 7 skills hardcodeadas
];
```

**Problema**: Si se agrega una skill nueva, el dashboard no la mostrará hasta que se edite este array. No hay mecanismo de descubrimiento dinámico.

### 3.6 Session Runner → Simulator Runner (acoplamiento por diseño)

`simulator_runner.ts` define sus propios tipos `Exercise`, `Result`, `SkillState` duplicando los de `session_runner.ts`. No reutiliza la lógica de selección adaptativa.

### 3.7 Diagrama de dependencias críticas

```
JSON files (docs/04_exercise_engine/)
  │
  ├─ lengua_exercises_*.json ──→ session_runner.ts (loadLenguaExercises)
  ├─ lengua_skill_relationships.json ──→ exercise_selector.ts (loadLenguaSelectionGraph)
  ├─ lengua_mastery_map.json ──→ exercise_selector.ts (loadLenguaSelectionGraph)
  └─ lengua_content_index.json ──→ exercise_selector.ts (listLenguaExerciseFiles filter)
  
  data/progress.json
  │
  ├─ local_progress_store.ts ←→ practice/page.tsx (saveProgress)
  ├─ local_progress_store.ts ←→ session_runner.ts (getSeenSkills, markSkillsSeen)
  └─ local_progress_store.ts ←→ dashboard/page.tsx (loadProgress)
  
  [NO CONNECTION]
  exercise_selector.ts (reglas A-E) ──/──→ PracticeQuestion.tsx (pickExercise aleatorio)
```

La última línea es la inconsistencia más crítica: el motor adaptativo no se usa en el flujo principal de la UI.

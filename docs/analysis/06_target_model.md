# 06 — Modelo Objetivo

> Auditoría sistémica global · Fase 6

---

## 1. Cambio Conceptual

### De → A

```
ACTUAL:
  Ejercicio aislado → Respuesta → Feedback → Siguiente ejercicio aislado
  (cada pregunta es un mundo, no hay continuidad)

OBJETIVO:
  Contexto compartido → Múltiples preguntas → Feedback por pregunta → Siguiente contexto
  (el texto/escenario es la unidad, las preguntas lo exploran)
```

### Implicaciones del cambio

| Dimensión | Modelo actual | Modelo objetivo |
|-----------|--------------|-----------------|
| Unidad de práctica | Ejercicio | Grupo de ejercicios sobre un contexto |
| Estado de sesión | Contador de preguntas | Texto actual + pregunta actual + historial del texto |
| Selección siguiente | Aleatoria del pool | Priorizar preguntas del mismo texto, luego nuevo texto |
| Progreso | Por skill (ejercicio) | Por skill (agregado de preguntas del grupo) |
| Mastery | Por ejercicio individual | Por skill acumulado, ponderado por dificultad |
| Persistencia | Stats por skill | Stats por skill + historial de textos trabajados |

---

## 2. Nueva Arquitectura

### Componentes conceptuales nuevos

#### 2.1 TextGroup (nueva entidad)

```typescript
type TextGroup = {
  id: string;
  content: string;           // el texto base
  title?: string;            // título opcional
  source?: string;           // fuente del texto
  skills: string[];          // skills que trabaja este texto
  subskills: string[];       // subskills específicas
  difficulty: Difficulty;    // dificultad general del grupo
  exercises: Exercise[];     // preguntas sobre este texto
  estimatedMinutes?: number; // tiempo estimado de lectura + preguntas
};
```

**Ubicación sugerida**: `src/practice/types.ts` (nuevo archivo) o extensión de `session_runner.ts`

#### 2.2 SessionContext (nueva abstracción)

```typescript
type SessionContext = {
  id: string;
  mode: "practice" | "simulator";
  currentTextGroup: TextGroup | null;
  currentExerciseIndex: number;       // índice dentro del grupo
  textGroupsHistory: string[];        // IDs de textos ya trabajados
  exerciseHistory: HistoryItem[];     // respuestas dadas
  userState: UserSkillState[];        // estado acumulado de la sesión
  startedAt: string;
};
```

**Resuelve**: L8 (sin abstracción de sesión), L3 (sin memoria entre preguntas)

#### 2.3 TextGroupSelector (nueva lógica)

```typescript
interface TextGroupSelector {
  selectNext(
    availableGroups: TextGroup[],
    sessionContext: SessionContext,
    userProgress: StoredProgress
  ): TextGroup;
  
  selectNextExercise(
    currentGroup: TextGroup,
    sessionContext: SessionContext
  ): Exercise | null;  // null = agotó preguntas del grupo
}
```

**Resuelve**: L2 (selección aleatoria), permite mantener contexto de texto

#### 2.4 ExerciseGroupLoader (nueva lógica de carga)

```typescript
interface ExerciseGroupLoader {
  loadGroups(source: string): TextGroup[];
  loadGroupById(id: string): TextGroup | null;
  getGroupsBySkills(skills: string[]): TextGroup[];
}
```

**Resuelve**: L7 (formatos JSON inconsistentes) estandarizando la carga

### Nuevas relaciones entre componentes

```
[TextGroupLoader]
  → lee JSON nuevo formato (grupos de ejercicios)
  → retorna TextGroup[]

[TextGroupSelector]
  → recibe TextGroup[] + SessionContext + StoredProgress
  → usa reglas adaptativas (extensión de A-E)
  → retorna TextGroup seleccionado + Exercise seleccionado

[PracticeSession]
  → mantiene SessionContext
  → coordina TextGroupSelector + UI
  → serializable (pausable/reanudable)

[PracticeQuestion v2]
  → recibe TextGroup + Exercise actual + SessionContext
  → renderiza texto persistente + pregunta actual
  → al responder, avanza dentro del grupo o cambia de grupo

[ProgressStore v2]
  → guarda SessionContext completado
  → mantiene stats por skill (como hoy)
  → agrega historial de textGroups trabajados
```

### Cambios mínimos necesarios vs cambios deseables

#### Mínimos (para soportar lectura + preguntas)

1. **Nuevo tipo `TextGroup`** — agregar a `session_runner.ts` o archivo separado
2. **Nuevo formato JSON** — al menos un archivo de ejemplo con ejercicios agrupados
3. **Nueva lógica de carga** — `loadTextGroups()` que parsea el nuevo formato
4. **Extender `Exercise`** — agregar campo opcional `textGroupId?: string`
5. **Modificar `PracticeQuestion.tsx`** — renderizar texto persistente cuando hay `textGroupId`
6. **Modificar selección** — `handleNext()` prioriza ejercicios del mismo grupo

#### Deseables (para modelo completo)

7. **`SessionContext` como abstracción** — centralizar estado de sesión
8. **`TextGroupSelector` con reglas extendidas** — adaptatividad considerando contexto
9. **Migración de `progress.json`** — agregar campos para textos trabajados
10. **Unificación de cálculos de mastery** — un solo algoritmo

---

## 3. Rol de los Agentes (en el modelo objetivo)

### Cómo deberían operar los agentes

Los agentes NO deberían ser prompts para LLM. Deberían ser funciones ejecutables:

#### Product Guardian como función

```typescript
function productGuardian(change: ChangeProposal): GuardianDecision {
  const changeType = classifyChange(change);
  const violations = checkVisionAlignment(change, productDocs);
  const agentsToActivate = determineRequiredAgents(changeType, change);
  
  return { changeType, violations, agentsToActivate };
}
```

#### Scope & Rules Validator como función

```typescript
function scopeRulesValidator(
  change: ChangeProposal, 
  sourceDocs: ParsedDocs
): ValidationResult {
  const visionIssues = validateVision(change, sourceDocs.vision);
  const businessIssues = validateBusinessRules(change, sourceDocs.businessRules);
  const legalIssues = validateLegal(change, sourceDocs.legal);
  const severity = computeSeverity([...visionIssues, ...businessIssues, ...legalIssues]);
  
  return { severity, issues, consultedDocs };
}
```

#### Quality Auditor como función

```typescript
function qualityAuditor(
  change: ChangeProposal,
  currentCode: CodebaseSnapshot
): AuditResult {
  const regressions = detectRegressions(change, currentCode);
  const loopIntegrity = validatePracticeLoop(change, currentCode);
  const severity = computeSeverity([...regressions, ...loopIntegrity]);
  
  return { severity, regressions, recommendations };
}
```

### Qué decisiones deben tomar

| Agente | Decisiones autónomas | Decisiones que requieren humano |
|--------|---------------------|-------------------------------|
| Product Guardian | Clasificar cambio, activar validadores | Bloqueos P0 (informar, no decidir) |
| Scope & Rules Validator | Emitir severidad, listar violaciones | Resolver contradicciones documentales |
| Quality Auditor | Detectar regresiones, validar loop | Decidir si una regresión es aceptable |
| Codex Prompt Generator | Generar prompt acotado | Ninguna (solo traduce decisión a prompt) |

### Cómo integrarse al runtime

```
Fase 1 (actual):
  Desarrollador → copia prompt → pega en LLM → LLM simula agentes

Fase 2 (intermedia):
  Desarrollador → ejecuta script → script parsea código → agentes como funciones → output estructurado

Fase 3 (objetivo):
  git pre-commit hook → agent pipeline → resultado → approve/block automático
  CI/CD → agent pipeline en PR → comentario con resultado → merge condicional

Fase 4 (ideal):
  Editor (VS Code extension) → agentes ejecutan en background → feedback en tiempo real
  Runtime de práctica → agentes monitorean calidad de ejercicios → alertas automáticas
```

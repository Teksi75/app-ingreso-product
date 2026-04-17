# 07 — Plan Estratégico de Evolución

> Auditoría sistémica global · Fase 7

---

## Principios del plan

- **Incremental**: cada etapa es usable y no rompe lo anterior
- **Validable**: cada etapa tiene criterios de éxito verificables
- **Reversible**: las decisiones de cada etapa pueden ajustarse sin rehacer todo
- **Independiente**: las etapas pueden priorizarse según necesidad real

---

## Etapa 0 — Corrección de inconsistencias existentes

**Objetivo**: Eliminar deuda técnica menor antes de evolucionar

**Acciones**:
1. Unificar los tres cálculos de mastery en un solo módulo
   - `practice/page.tsx:146-164` (UI)
   - `session_runner.ts:247-252` (CLI)
   - `exercise_selector.ts:582-587` (selector)
   - → Extraer a `src/practice/mastery.ts`

2. Migrar `progress.json` a IDs canónicos exclusivamente
   - Convertir todos los `LEN-*` a `lengua.skill_N`
   - Eliminar `LEGACY_SKILL_IDS` después de migración
   - Actualizar `canonicalDashboardSkills` para derivarse de datos, no hardcode

3. Extraer lógica de negocio de `PracticeQuestion.tsx` a hooks/utilidades
   - `pickExercise()` → `src/practice/exercise_picker.ts`
   - `calculateUpdatedMastery()` → `src/practice/mastery.ts`
   - `getStableShuffledOptions()` → `src/practice/options.ts`

**Impacto**: Código más limpio, sin cambio funcional
**Riesgo**: Bajo — refactor sin cambio de comportamiento
**Duración estimada**: 1-2 días

---

## Etapa 1 — Activar adaptatividad en runtime

**Objetivo**: Que la selección del siguiente ejercicio use las reglas A-E durante la sesión, no solo al inicio

**Acciones**:
1. Modificar `handleNext()` en `PracticeQuestion.tsx` para llamar a un endpoint/server action que invoque `selectNextExerciseDetailed()`
2. Crear server action `selectNextExercise(userId, sessionHistory, pool)` que:
   - Reciba el historial de la sesión actual
   - Construya `UserSkillState[]` del historial
   - Ejecute `selectNextExerciseDetailed()`
   - Retorne el ejercicio seleccionado + regla aplicada
3. Pasar `userState` desde el server al componente cliente
4. Mostrar la regla aplicada (opcional, para debugging/transparencia)

**Impacto**: La adaptatividad real opera durante toda la sesión
**Riesgo**: Medio — cambio de flujo de selección, posible latencia adicional por server action
**Duración estimada**: 2-3 días
**Dependencias**: Etapa 0 (unificación de mastery)

**Criterio de éxito**: En una sesión de 10 ejercicios, al fallar uno, el siguiente ejercicio es de la misma skill y dificultad ≤ (Regla A verificable)

---

## Etapa 2 — Introducir TextGroup como concepto

**Objetivo**: Crear la abstracción de "grupo de ejercicios sobre un contexto" sin cambiar la UI todavía

**Acciones**:
1. Definir tipo `TextGroup` en `src/practice/types.ts`
2. Crear un archivo JSON de ejemplo: `lengua_textgroups_modulo1.json` con 3-5 textos y 3-4 preguntas cada uno
3. Crear `TextGroupLoader` que carga el nuevo formato
4. Extender `Exercise` con campo opcional `textGroupId?: string`
5. Modificar `loadLenguaExercises()` para soportar el nuevo formato (backward compatible)
6. Agregar tests que verifican la carga de grupos

**Impacto**: Los datos soportan grupos, la UI aún no los usa
**Riesgo**: Bajo — cambio de datos sin cambio de UI
**Duración estimada**: 2-3 días
**Dependencias**: Ninguna (puede hacerse en paralelo con Etapa 1)

**Criterio de éxito**: Se puede cargar un `TextGroup` con ejercicios y mapearlos al tipo `Exercise` existente

---

## Etapa 3 — UI de modo lectura

**Objetivo**: Modificar `PracticeQuestion.tsx` para soportar texto persistente con preguntas múltiples

**Acciones**:
1. Crear componente `TextBasedQuestion` que:
   - Renderiza el texto en un panel fijo (sticky/top)
   - Renderiza la pregunta actual debajo
   - Muestra indicador "Pregunta 2/4 sobre este texto"
   - Al completar todas las preguntas del grupo, selecciona nuevo grupo
2. Modificar `PracticePage` para detectar si el ejercicio actual tiene `textGroupId`
   - Si tiene → usar `TextBasedQuestion`
   - Si no tiene → usar `PracticeQuestion` (compatibilidad)
3. Implementar lógica de selección "permanecer en el grupo":
   - `handleNext()` primero busca ejercicios no respondidos del mismo `textGroupId`
   - Solo cuando se agota el grupo, selecciona nuevo grupo/ejercicio
4. Actualizar `SessionContext` (inicialmente como useState interno) para rastrear grupo actual

**Impacto**: Primera funcionalidad de lectura + preguntas
**Riesgo**: Medio — cambio significativo de UX, necesita testing con usuarios
**Duración estimada**: 4-5 días
**Dependencias**: Etapa 2 (TextGroup en datos), Etapa 1 (adaptatividad deseable)

**Criterio de éxito**: Un usuario puede leer un texto y responder 4 preguntas sobre él sin que el texto desaparezca entre preguntas

---

## Etapa 4 — Persistencia mejorada

**Objetivo**: Evolucionar el almacenamiento para soportar el nuevo modelo

**Acciones**:
1. Agregar campo `textGroupsWorked` a `StoredProgress`:
   ```typescript
   textGroupsWorked?: Array<{
     textGroupId: string;
     completedAt: string;
     correctCount: number;
     totalQuestions: number;
   }>;
   ```
2. Agregar campo `currentSessionId` para identificar sesiones activas
3. Implementar guardado parcial de sesión (no solo al final)
4. Agregar file lock básico para concurrencia:
   - Usar `fs.openSync` con `wx` flag para atomicidad
   - O migrar a `better-sqlite3` (más robusto)

**Impacto**: Progreso más rico, sesiones pausables
**Riesgo**: Medio — cambio de schema de datos, necesita migración
**Duración estimada**: 2-3 días
**Dependencias**: Etapa 3 (para saber qué datos persistir)

**Criterio de éxito**: Una sesión interrumpida puede reanudarse, el progreso de textos trabajados se guarda correctamente

---

## Etapa 5 — Selector de grupos de texto

**Objetivo**: Que la selección de textos sea inteligente, no aleatoria

**Acciones**:
1. Crear `TextGroupSelector` con reglas:
   - **Exploración**: priorizar textos de skills no trabajadas (extensión de Regla E)
   - **Refuerzo**: si la última pregunta fue incorrecta y quedan preguntas en el grupo → continuar grupo
   - **Progresión**: si el usuario tiene alta accuracy en la skill del grupo → seleccionar grupo de skill relacionada (usa grafo de relaciones)
   - **Balance**: distribuir entre skills para no sobrecargar una sola
2. Integrar con el grafo de relaciones existente
3. Agregar `textGroupRelationships` al grafo (textos que trabajan skills complementarias)

**Impacto**: Selección de contenido verdaderamente adaptativa
**Riesgo**: Medio-Alto — lógica compleja, necesita validación empírica
**Duración estimada**: 3-4 días
**Dependencias**: Etapa 2, 3, 4

**Criterio de éxito**: En una sesión de 30 minutos, el sistema selecciona textos que trabajan las skills más débiles del usuario

---

## Etapa 6 — Agentes ejecutables (fase 1)

**Objetivo**: Convertir al menos Product Guardian de documentación a código ejecutable

**Acciones**:
1. Crear `src/agents/product_guardian.ts`:
   - `classifyChange(proposal)` → `ChangeType`
   - `checkViolations(proposal, docs)` → `Violation[]`
   - `determineAgents(changeType)` → `Agent[]`
2. Parsear documentos fuente a estructuras consultables:
   - `docs/00_vision/product_vision.md` → `VisionRules`
   - `docs/08_business_rules/business_rules.md` → `BusinessRules`
3. Crear CLI `scripts/validate-change.ts` que:
   - Recibe una descripción de cambio
   - Ejecuta Product Guardian
   - Retorna output estructurado
4. Integrar como npm script: `npm run validate-change -- "agregar modo oscuro"`

**Impacto**: Primer agente ejecutable, validación automática básica
**Riesgo**: Medio — nueva capacidad, no afecta funcionalidad existente
**Duración estimada**: 3-5 días
**Dependencias**: Ninguna (trabajo paralelo)

**Criterio de éxito**: Ejecutar `npm run validate-change -- "idea"` retorna CHANGE_TYPE y agentes requeridos sin intervención manual

---

## Etapa 7 — Agentes ejecutables (fase 2)

**Objetivo**: Agregar Scope & Rules Validator y Quality Auditor ejecutables

**Acciones**:
1. Crear `src/agents/scope_rules_validator.ts`:
   - Valida contra reglas parseadas
   - Emite severidad P0/P1/P2
2. Crear `src/agents/quality_auditor.ts`:
   - Analiza diffs de código
   - Valida integridad del loop de práctica
3. Crear pipeline `src/agents/pipeline.ts`:
   - Encadena agentes según tipo de cambio
   - Retorna resultado consolidado
4. Crear git pre-commit hook que ejecuta el pipeline

**Impacto**: Validación automática en el flujo de desarrollo
**Riesgo**: Alto — impacta el workflow del desarrollador, falso positivos pueden frustrar
**Duración estimada**: 5-7 días
**Dependencias**: Etapa 6

**Criterio de éxito**: Un commit que rompe la visión del producto es bloqueado automáticamente por el pre-commit hook

---

## Resumen del plan

```
Etapa 0: Corrección de inconsistencias     → 1-2 días   → Riesgo bajo    → Sin dependencias
Etapa 1: Adaptatividad en runtime          → 2-3 días   → Riesgo medio   → Depende de 0
Etapa 2: TextGroup en datos                → 2-3 días   → Riesgo bajo    → Sin dependencias
Etapa 3: UI de modo lectura                → 4-5 días   → Riesgo medio   → Depende de 2
Etapa 4: Persistencia mejorada             → 2-3 días   → Riesgo medio   → Depende de 3
Etapa 5: Selector de grupos de texto       → 3-4 días   → Riesgo medio+  → Depende de 2,3,4
Etapa 6: Agentes ejecutables (fase 1)     → 3-5 días   → Riesgo medio   → Sin dependencias
Etapa 7: Agentes ejecutables (fase 2)     → 5-7 días   → Riesgo alto    → Depende de 6

Total estimado: 23-32 días de trabajo
Paralelización posible: Etapas 0+2+6 pueden empezar simultáneamente
Ruta crítica: 0 → 1, 2 → 3 → 4 → 5 (secuencia principal)
```

### Priorización recomendada

**Si el objetivo es soportar lectura + preguntas**:
```
Etapa 0 → Etapa 2 → Etapa 3 → Etapa 1 → Etapa 4 → Etapa 5
```

**Si el objetivo es automatizar la validación**:
```
Etapa 6 → Etapa 7 (paralelo con cualquier otra etapa)
```

**Si el objetivo es mejorar la calidad de la práctica existente**:
```
Etapa 0 → Etapa 1 → Etapa 4
```

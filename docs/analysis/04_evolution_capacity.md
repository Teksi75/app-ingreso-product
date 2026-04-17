# 04 — Capacidad de Evolución

> Auditoría sistémica global · Fase 4

---

## Nuevo requerimiento

> Lectura de texto → múltiples preguntas sobre el mismo texto → contexto compartido en sesión

---

## 1. ¿Qué rompe esto?

### 1.1 El modelo de ejercicio aislado

**Estado actual**: Cada ejercicio es autónomo. El campo `text` es opcional y pertenece a un único ejercicio.

```typescript
// session_runner.ts:24
text?: string;  // texto propio de ESTE ejercicio
```

**Lo que rompe**: Si un texto debe generar 3-5 preguntas diferentes, el modelo actual requeriría:
- Crear 3-5 ejercicios separados que compartan el mismo `text`
- Ningún contrato actual soporta "grupo de ejercicios vinculados"
- El selector de ejercicios (`selectNextExerciseDetailed`) no tiene noción de "permanecer en el mismo texto"
- `pickExercise(PracticeQuestion.tsx:306)` es aleatorio, no mantiene continuidad

### 1.2 La selección aleatoria del siguiente ejercicio

**Estado actual**: En la UI, el siguiente ejercicio se elige aleatoriamente del pool disponible:

```typescript
// PracticeQuestion.tsx:306-308
function pickExercise(exercises: Exercise[]): Exercise {
  return exercises[Math.floor(Math.random() * exercises.length)];
}
```

**Lo que rompe**: Para mantener contexto de texto, la selección debe ser INTELIGENTE:
- Si quedan preguntas sobre el mismo texto → priorizarlas
- Si se agotaron las preguntas del texto → seleccionar un nuevo texto
- El pool de ejercicios debe agruparse por texto, no ser una lista plana

### 1.3 La estructura de datos Exercise

**Estado actual**: No hay campo que agrupe ejercicios por texto compartido.

```typescript
// No existe:
type ExerciseGroup = {
  text: string;
  exercises: Exercise[];  // preguntas sobre este texto
  order?: number;         // secuencia sugerida
};
```

**Lo que rompe**: Se necesita una nueva estructura que el sistema actual no contempla. El JSON de ejercicios necesitaría un nuevo formato.

### 1.4 El guardado de progreso

**Estado actual**: El progreso se guarda por skill_id y subskill, con stats agregados.

```typescript
// local_progress_store.ts:26-34
skill_stats: Record<string, {
  total_attempts: number;
  total_correct: number;
  last_state: SkillState;
}>;
```

**Lo que rompe**: Si un texto trabaja múltiples skills (ej: comprensión + inferencia + vocabulario), ¿cómo se atribuye el progreso? El modelo actual asume que cada ejercicio pertenece a UNA skill.

### 1.5 El contador de sesión

**Estado actual**: `MAX_QUESTIONS = 10` cuenta ejercicios individuales.

**Lo que rompe**: Si un "texto" genera 4 preguntas, la sesión podría ser "2 textos con 4 preguntas cada uno" en vez de "10 ejercicios sueltos". La noción de "sesión" necesita redefinirse.

### 1.6 El server action de guardado

**Estado actual**: `savePracticeSessionProgress` recibe stats de UNA skill:

```typescript
// practice/page.tsx:102-144
async function savePracticeSessionProgress(input: PracticeSessionProgressInput) {
  // input.currentFocus: string (una subskill)
  // input.skillId: string (una skill)
}
```

**Lo que rompe**: Una sesión con textos puede involucrar múltiples skills simultáneamente. El server action necesita soportar múltiples resultados por sesión.

---

## 2. ¿Qué lo impide estructuralmente?

### Bloqueante 1: No hay concepto de "texto como unidad"

El sistema no tiene una entidad "texto" o "pasaje". Los ejercicios son la unidad atómica. Para soportar lectura + preguntas, se necesita:

```
Nuevo modelo:
  TextGroup { id, content, source?, metadata? }
    └── Exercise { ..., textGroupId, questionOrder }
```

Esto requiere:
- Nuevo tipo en `session_runner.ts`
- Nuevo formato JSON para ejercicios agrupados
- Nuevo campo en `Exercise`
- Nueva lógica de carga en `loadLenguaExercises()`

### Bloqueante 2: No hay contexto de sesión persistente

`PracticeQuestion.tsx` mantiene estado con `useState` pero:
- No hay "session context" que recuerde qué texto se está leyendo
- No hay variable que diga "estamos en la pregunta 3/4 del texto A"
- El componente no distingue entre "nuevo texto" y "continuar texto"

### Bloqueante 3: La normalización de ejercicios asume ejercicios independientes

`normalizeExercise()` en `session_runner.ts:162-192` procesa cada ejercicio como entidad independiente. No hay fase de agrupación.

### Bloqueante 4: El selector de ejercicios no tiene contexto de texto

`selectNextExerciseDetailed()` opera sobre:
- `exercises: Exercise[]` (lista plana)
- `userState: UserSkillState[]` (estado por skill)

No tiene parámetro para "ejercicios del mismo grupo de texto" ni "texto actual".

### Bloqueante 5: La UI no tiene modo "lectura"

`PracticeQuestion.tsx` renderiza:
1. Skill banner
2. Text (opcional)
3. Prompt
4. Options
5. Feedback

No hay modo donde el texto permanezca visible mientras cambian las preguntas. El diseño actual reemplaza todo el contenido en cada ejercicio.

---

## 3. ¿Qué partes podrían reutilizarse?

### Reutilizable 1: Sistema de skills y subskills

El mapeo de ejercicios a skills es sólido. Un texto con múltiples preguntas puede mapear cada pregunta a una skill diferente. El sistema de `skill_id` + `subskill` no necesita cambiar.

### Reutilizable 2: Motor de adaptatividad

Las reglas A-E de `exercise_selector.ts` son útiles incluso con contexto de texto:
- Regla A (repetir tras error) puede aplicarse a preguntas del mismo texto
- Regla D (bajar dificultad) puede seleccionar textos más simples
- Regla E (exploración) puede elegir textos de skills no vistas

**Necesita**: extensión para que las reglas consideren el contexto de texto.

### Reutilizable 3: Grafo de relaciones entre skills

`lengua_skill_relationships.json` y `lengua_mastery_map.json` siguen siendo válidos. Los textos pueden trabajar múltiples skills conectadas por relaciones del grafo.

### Reutilizable 4: Progress store

`local_progress_store.ts` puede extenderse:
- Agregar campo `text_groups_seen` similar a `seenSkills`
- Mantener `skill_stats` (funciona incluso con ejercicios de múltiples skills)
- Agregar sesiones con metadata de textos trabajados

### Reutilizable 5: Componentes de dashboard

`SkillList`, `SkillItem`, `SkillStatus` no necesitan cambios. Siguen mostrando progreso por skill independientemente de cómo se agrupen los ejercicios.

### Reutilizable 6: Server action pattern

El patrón de `savePracticeSessionProgress` como server action puede extenderse para aceptar múltiples resultados de skill.

### Resumen de reutilización

| Componente | ¿Reutilizable? | Cambios necesarios |
|-----------|---------------|-------------------|
| Skills/subskills system | ✅ Total | Ninguno |
| Adaptativity rules (A-E) | ✅ Parcial | Extender para contexto de texto |
| Selection graph | ✅ Total | Ninguno |
| Progress store | ✅ Parcial | Agregar campos de texto |
| Dashboard components | ✅ Total | Ninguno |
| Server actions | ✅ Parcial | Aceptar múltiples skills |
| Exercise type | ❌ No | Nuevo tipo con textGroupId |
| PracticeQuestion.tsx | ❌ No | Rediseño mayor para modo lectura |
| pickExercise() | ❌ No | Reemplazar con selección contextual |
| Exercise JSON format | ❌ No | Nuevo formato agrupado |

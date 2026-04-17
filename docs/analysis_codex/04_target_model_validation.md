# 04 - Validacion del modelo objetivo

> Validacion Codex contra codigo real. Fuente MiMo: `docs/analysis/06_target_model.md`.

## Veredicto ejecutivo

El modelo `TextGroup + SessionContext` es coherente con el sistema actual y se puede implementar sin romper arquitectura si se introduce como extension opcional. No conviene implementarlo completo de una vez. Para validar lectura + preguntas alcanza un modelo mas simple: `TextGroup` en datos, `textGroupId` en `Exercise`, y una regla de UI que priorice preguntas pendientes del mismo grupo.

## Coherencia con el sistema actual

Coherente:

- `Exercise` ya tiene `text?: string`, por lo que la UI puede mostrar un texto base sin cambiar toda la forma de render: `src/practice/session_runner.ts:24` y `src/app/practice/PracticeQuestion.tsx:186-190`.
- `loadLenguaExercises()` ya normaliza multiples formatos; agregar un cuarto formato `{ text_groups: [...] }` puede hacerse backward compatible: `src/practice/session_runner.ts:115-123` y `:125-160`.
- El selector ya opera sobre lista plana de ejercicios. Un `TextGroupLoader` puede aplanar grupos a ejercicios con metadata (`textGroupId`, `questionOrder`) y dejar intacto el selector inicial.
- `skill_id` y `subskill` pueden seguir viviendo en cada pregunta; no hace falta atribuir progreso al texto para el primer slice.

Riesgos de coherencia:

- Muchos ejercicios actuales ponen el texto dentro del `prompt` como prefijo `"Texto: ..."`, no en `text`. Ejemplo: `docs/04_exercise_engine/lengua_exercises_v1.json` usa `prompt` con texto embebido; `lengua_exercises_modulo3.json` si usa campo `text`.
- `savePracticeSessionProgress()` guarda una unica skill y una unica subskill de foco para toda la sesion: `src/app/practice/page.tsx:102-131`. Si un grupo mezcla skills, el guardado actual atribuiria mal el resultado.
- `PracticeQuestion` usa contadores globales de preguntas, no indice dentro de grupo: `src/app/practice/PracticeQuestion.tsx:35-45`.

## Implementabilidad sin romper arquitectura

Implementable si se cumplen tres condiciones:

1. `TextGroup` debe ser opcional. Los ejercicios existentes siguen cargando igual.
2. El loader debe aplanar grupos a `Exercise[]` para no reescribir `selectNextExerciseDetailed()` en el primer paso.
3. La UI debe reconocer `textGroupId` y elegir primero preguntas no usadas del mismo grupo antes de llamar a cualquier selector global.

No implementable como big bang recomendable:

- Migrar todos los JSON actuales a TextGroup.
- Reemplazar todo `PracticeQuestion` por una sesion persistente.
- Cambiar simultaneamente progreso, mastery, selector y dashboard.

## Alternativa mas simple recomendada

### Modelo minimo

```ts
type TextGroup = {
  id: string;
  title?: string;
  text: string;
  source?: string;
  exercises: Array<ExerciseInput & {
    question_order?: number;
  }>;
};

type Exercise = ExistingExercise & {
  text_group_id?: string;
  text_group_title?: string;
  question_order?: number;
};
```

### Regla minima de seleccion

En `handleNext()`:

1. Si `currentExercise.text_group_id` existe, buscar en `available` el proximo ejercicio del mismo grupo.
2. Ordenar por `question_order` y luego por `id`.
3. Si no quedan preguntas del grupo, usar seleccion global actual o adaptativa.

Esto valida el cambio pedagogico central sin crear todavia un `SessionContext` persistente.

## Cuando introducir SessionContext

`SessionContext` es correcto, pero debe entrar despues de comprobar el primer slice.

Debe incluirse cuando se necesite:

- Pausar/reanudar sesion.
- Guardado parcial.
- Sesiones con multiples textos y multiples skills.
- Selector de grupos adaptativo.
- Metricas por texto trabajado.

Antes de eso, hacerlo completo agrega superficie sin beneficio inmediato.

## Decision implementable

Usar una estrategia de dos niveles:

1. **Nivel 1 - compatibilidad**: `TextGroup` se carga y se aplana a `Exercise[]`. La UI mantiene el texto visible y avanza dentro del grupo.
2. **Nivel 2 - sesion real**: introducir `SessionContext`, progreso por grupos y selector de grupos cuando la lectura con preguntas ya funcione.

Esta secuencia evita romper el selector, el dashboard y el progreso existente.

# Lengua Exercise Engine

## Archivos

- `lengua_content_index.json`: indice central de sets, relaciones y mastery.
- `lengua_skill_relationships.json`: grafo de prerequisitos, secuencias y refuerzos.
- `lengua_mastery_map.json`: niveles recomendados, unlocks y metadata de mastery.
- `lengua_subskills_skills_1_2_practice.json`: ejercicios de `lengua.skill_1` y `lengua.skill_2`.
- `lengua_subskills_skill_3_production.json`: ejercicios de `lengua.skill_3`.
- `lengua_subskills_skills_4_5_practice.json`: ejercicios de `lengua.skill_4` y `lengua.skill_5`.
- `lengua_subskills_skills_6_7_practice.json`: ejercicios de `lengua.skill_6` y `lengua.skill_7`.
- `lengua_exercises_v1.json`: set legacy normalizado en runtime.
- `lengua_exercises_modulo3.json`: set legacy normalizado en runtime.

## Carga

`src/practice/exercise_selector.ts` lista `docs/04_exercise_engine/lengua_*.json` y excluye `lengua_skill_relationships.json`, `lengua_mastery_map.json` y `lengua_content_index.json`.

`src/practice/session_runner.ts` normaliza cada ejercicio a:

```ts
{
  id: string;
  skill_id: string;
  subskill: string;
  difficulty: 1 | 2 | 3;
  mastery_level: 1 | 2 | 3 | 4;
  type: string;
  prompt: string;
  options: string[];
  correct_answer: string;
  feedback_correct: string;
  feedback_incorrect: string;
}
```

## Seleccion

El selector usa:

- `lengua_skill_relationships.json` para prerequisitos, secuencias y refuerzos.
- `lengua_mastery_map.json` para niveles recomendados.
- historial de intentos para accuracy, streak y mastery efectivo.
- `usedExerciseIds` y `lastExerciseId` para evitar repeticion inmediata.


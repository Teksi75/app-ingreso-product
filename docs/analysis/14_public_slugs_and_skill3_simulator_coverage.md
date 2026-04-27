# Auditoria 14 - Slugs publicos y cobertura de skill 3 en simulador

Fecha: 2026-04-25

## Estado implementado

El proyecto incorporo una capa de URLs publicas con slugs y mantuvo compatibilidad con los IDs tecnicos internos.

### Slugs

- `src/skills/skill_slugs.ts` expone:
  - `canonicalIdToSlug(id)`
  - `slugToCanonicalId(slug)`
  - `readingUnitIdToSlug(id)`
  - `slugToReadingUnitId(slug)`
- Los links nuevos de practica y recomendacion usan slugs legibles.
- Las rutas siguen aceptando IDs legacy como `lengua.skill_1` y `RU-LEN-BIO-001`.

Ejemplos:

- `lengua.skill_1` -> `comprension-global-del-texto`
- `RU-LEN-BIO-001` -> `violeta-parra`

## Integracion en runtime

Los puntos principales de navegacion ya consumen o resuelven slugs:

- `src/recommendation/next_step.ts`
- `src/app/practice/page.tsx`
- `src/app/practice/PracticeQuestion.tsx`
- `src/app/page.tsx`
- `src/app/habilidades/page.tsx`

La decision correcta fue mantener IDs canonicos en datos, mastery, selector y progreso; los slugs funcionan como capa publica de entrada/salida.

## Skill 3 en simulador

Se agregaron 6 ejercicios `multiple_choice` a `lengua_subskills_skill_3_production.json`.

Impacto:

- Skill 3 deja de depender solo de tipos menos compatibles con simulador.
- El corpus de produccion escrita ahora tiene mas ejercicios elegibles para sesiones globales.
- La recomendacion post-simulador puede apoyarse mejor en evidencia real de skill 3.

## Validacion existente

- `npm run test:unit`: cubre escenarios de `getNextStepRecommendation()`.
- `npm run test:e2e`: cubre links de practica, dashboard, lectura y simulador.
- E2E ya verifica que una reading unit pueda abrirse por slug.

## Estado de continuidad

1. `skill_slugs.ts` tiene tests unitarios propios para slugs canonicos y aliases legacy.
2. Los slugs de reading units ya son manuales; se mantiene compatibilidad con algunos slugs historicos.
3. Existe una prueba explicita que confirma que `lengua.skill_3` entra efectivamente en una sesion de simulador.
4. Falta decidir si los nuevos docs de continuidad deben tener un indice propio ademas del grafo de codigo.

## Proxima continuidad recomendada

1. Agregar unit tests para `skill_slugs.ts`.
2. Agregar test de simulador para cobertura efectiva de `lengua.skill_3`.
3. Decidir si los slugs de reading units deben fijarse manualmente.
4. Crear una nueva reading unit que cruce escritura clara y uso de verbos.

# Sistema Canonico De Recomendacion

## Estado auditado

- `src/app/dashboard/page.tsx` calculaba skills visibles y delegaba la accion sugerida a un `weakestSkill` resuelto en la propia pagina.
- `src/storage/local_progress_store.ts` ya exponia snapshot de progreso y `getWeakestPracticeSkillId()`, pero no un contrato de recomendacion de siguiente sesion.
- `src/practice/session_runner.ts` y `src/practice/reading_session.ts` ya distinguian sesiones `reading-based` y `standalone-exercises`, pero no proponian cual debia venir despues.
- `src/components/dashboard/ActionPanel.tsx` mezclaba contenido y links fijos de UI sin depender de una recomendacion canonica.

## Problema detectado

- La progresion seguia dependiendo de navegacion manual y heuristicas embebidas en la UI.
- El dashboard mostraba un foco sugerido, pero no una decision de producto explicita sobre la mejor proxima accion.
- No habia un contrato comun para recomendar lectura, practica focalizada, revision tras simulador o paso a simulaciones.

## Modelo implementado

Se definio `NextStepRecommendation` como contrato canonico del siguiente paso, con estos tipos:

- `continue-reading-unit`
- `start-reading-unit`
- `targeted-practice`
- `simulator-ready`
- `review-weak-skill`

Cada recomendacion expone:

- `kind`
- `title`
- `description`
- `ctaLabel`
- `href`
- `reason`
- `skillId?`
- `readingUnitId?`
- `basedOn` con contexto del historial reciente

## Reglas principales

### 1. Continuar lectura reciente

- Si la ultima sesion fue `reading`
- y tuvo accuracy inferior a 80%
- y el `readingUnitId` sigue disponible

Entonces se recomienda `continue-reading-unit`.

### 2. Revisar skill debil despues de simulador

- Si la ultima sesion fue `simulator`
- y el progreso actual mantiene una skill debil

Entonces se recomienda `review-weak-skill`.

### 3. Empezar un reading unit nuevo

- Si hay `ReadingUnit` sin trabajar
- y el historial reciente no viene priorizando lectura

Entonces se recomienda `start-reading-unit`, priorizando unidades que coincidan con la skill mas debil cuando sea posible.

### 4. Pasar a simulaciones

- Si existe base suficiente de sesiones previas
- y al menos cuatro skills canonicas fueron trabajadas
- y no hay skills en estado `weak`
- y varias ya alcanzaron mastery util

Entonces se recomienda `simulator-ready`.

### 5. Practica focalizada

- En el resto de los casos, si existe una skill debil prioritaria

Entonces se recomienda `targeted-practice`.

## Implementacion

- Se agrego `src/recommendation/next_step.ts` como modulo canonico de recomendacion.
- El modulo consume:
  - progreso local real
  - snapshot de practica
  - skill mas debil
  - historial reciente de sesiones
  - modo de la ultima sesion
  - reading units disponibles en el runtime actual
- `dashboard/page.tsx` ahora consume directamente `getNextStepRecommendation()`.
- `ActionPanel.tsx` paso a ser render puro del contrato de recomendacion.

## Compatibilidad

- No se rompio el flujo de `practice`.
- No se agregaron dependencias.
- La logica sigue acotada a Lengua y a datos ya presentes en el repo.

## Pendientes siguientes

- Enriquecer la recomendacion con subskill objetivo cuando el producto necesite mas precision.
- Incorporar senales de tiempo o recencia mas finas si el dashboard evoluciona a seguimiento diario.
- Hacer que simulaciones retroalimente una recomendacion mas granular por skill o reading unit.

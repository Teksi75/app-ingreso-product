# Modelo Canonico De Progress Y Mastery

## Estado auditado

- `local_progress_store.ts` guardaba historial crudo y exponia helpers de snapshot con logica interpretativa mezclada.
- `next_step.ts` decidia la recomendacion usando heuristicas locales sobre accuracy y `weakest skill`.
- `session_runner.ts` consumia `masteryByFocus` para seleccionar practica, pero esa lectura venia de un snapshot sin modelo pedagogico explicito.
- El sistema ya diferenciaba `practice`, `reading` y `simulator`, pero no tenia reglas canonicas para ponderar esos modos en una misma interpretacion del alumno.

## Problema detectado

- La interpretacion del progreso estaba dispersa entre storage y recommendation.
- No habia trazabilidad clara de por que una skill aparecia como debil.
- `simulator-ready` dependia de una regla ad hoc y no de un modelo declarativo de mastery.

## Solucion aplicada

- Se agrego `src/progress/mastery_model.ts` como modulo canonico de interpretacion del historial.
- El storage queda como capa raw de persistencia, con wrappers de compatibilidad.
- Dashboard y recommendation ahora consumen este modelo en vez de recalcular logica propia.

## Modelo

### Entrada

- `StoredProgress.sessions`
- `StoredProgress.skill_stats`
- `StoredProgress.seenSkills`

### Unidades interpretadas

- skill canonica (`lengua.skill_n`)
- subskill (`lengua.skill_n.subskill_m`)

### Pesos por modo de sesion

- `practice`: 1.00
- `reading`: 1.15
- `simulator`: 1.25

### Peso por recencia

- ultima entrada: 1.35
- penultima: 1.20
- tercera mas reciente: 1.10
- resto: 1.00

### Score de mastery

El `masteryScore` combina:

- accuracy ponderada global: 45%
- accuracy reciente: 35%
- mastery reportado por sesiones: 20%
- bonus de lectura: hasta 5 puntos
- bonus por consistencia de intentos: hasta 5 puntos

### Traduccion a mastery level

- `4`: score >= 82, accuracy reciente >= 80%, intentos >= 6
- `3`: score >= 64, accuracy reciente >= 70%, intentos >= 4
- `2`: score >= 42, accuracy reciente >= 45%, intentos >= 2
- `1`: resto de los casos

### Traduccion a estado pedagogico

- mastery 1 => `weak`
- mastery 2 => `developing`
- mastery 3 o 4 => `mastered`

## Simulator-ready

Una cuenta se considera `simulator-ready` cuando:

- hay al menos 4 sesiones en total
- hay al menos 4 skills canonicas con 4 o mas intentos y mastery >= 2
- no hay skills canonicas en estado `weak`
- el promedio de mastery score de las skills trabajadas es >= 60

## Trazabilidad

Cada focus interpretado expone `trace`, incluyendo:

- mastery level final
- score obtenido
- accuracy ponderada
- precision reciente
- distribucion por modo (`practice`, `reading`, `simulator`)
- nota de recencia

Esta traza ya se usa para explicar la `weakest skill` y para justificar recomendaciones del dashboard.

## Integracion

- `src/app/dashboard/page.tsx` usa `buildMasteryModel()`.
- `src/recommendation/next_step.ts` usa `buildMasteryModel()`, `getWeakestSkillId()` y `explainWeakestSkill()`.
- `src/storage/local_progress_store.ts` mantiene compatibilidad via wrappers `getPracticeProgressSnapshot()` y `getWeakestPracticeSkillId()`.

## Alcance

- No se reescribio el storage.
- No se agregaron dependencias.
- No se cambio la UI salvo para seguir mostrando la recomendacion existente sobre un contrato mas fuerte.

## Pendientes

- Reusar el mismo modelo en una futura integracion completa del simulador.
- Separar mas explicitamente metricas de skill y subskill si el producto necesita dashboards mas finos.
- Exponer trazas de mastery en UI si se quiere explicar decisiones al alumno o al docente.
